import { useCallback, useEffect, useRef, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { api, getErrorMessage } from '../lib/api'
import { formatCurrency } from '../lib/money'
import type { FinancialRecord, RecordType, UserSummary } from '../types/api'
import { useAuth } from '../context/AuthContext'
import { Skeleton } from '../components/ui/Skeleton'
import { RecordFormModal } from '../components/records/RecordFormModal'

const LIMIT = 10

export function RecordsPage() {
  const { role } = useAuth()
  const isAdmin = role === 'ADMIN'

  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState<RecordType | ''>('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [refetchTick, setRefetchTick] = useState(0)

  const [rows, setRows] = useState<FinancialRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserSummary[]>([])
  const [fadingId, setFadingId] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editing, setEditing] = useState<FinancialRecord | null>(null)

  const loadGen = useRef(0)

  const loadRecords = useCallback(async () => {
    const id = ++loadGen.current
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
      })
      if (typeFilter) params.set('type', typeFilter)
      if (categoryFilter.trim()) params.set('category', categoryFilter.trim())

      const res = await api.get<FinancialRecord[]>(`/api/records?${params.toString()}`)
      if (id !== loadGen.current) return
      setRows(res.data)
    } catch (e) {
      if (id !== loadGen.current) return
      toast.error(getErrorMessage(e, 'Could not load records'))
    } finally {
      if (id === loadGen.current) setLoading(false)
    }
  }, [page, typeFilter, categoryFilter])

  useEffect(() => {
    void loadRecords()
  }, [loadRecords, refetchTick])

  useEffect(() => {
    if (!isAdmin) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await api.get<UserSummary[]>('/api/users')
        if (!cancelled) setUsers(res.data)
      } catch {
        /* optional for table view */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isAdmin])

  function bumpRefetch() {
    setRefetchTick((t) => t + 1)
  }

  async function openCreate() {
    if (isAdmin && users.length === 0) {
      try {
        const res = await api.get<UserSummary[]>('/api/users')
        setUsers(res.data)
        if (res.data.length === 0) {
          toast.error('No users available to assign')
          return
        }
      } catch (e) {
        toast.error(getErrorMessage(e, 'Could not load users'))
        return
      }
    }
    setModalMode('create')
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(r: FinancialRecord) {
    setModalMode('edit')
    setEditing(r)
    setModalOpen(true)
  }

  /** After create: show newest rows (page 1, no filters) and always refetch even if state unchanged. */
  function afterRecordCreated() {
    setPage(1)
    setTypeFilter('')
    setCategoryFilter('')
    bumpRefetch()
  }

  function afterRecordUpdated() {
    bumpRefetch()
  }

  async function handleDelete(id: string) {
    if (!confirm('Soft-delete this record?')) return
    setFadingId(id)
    try {
      await new Promise((r) => setTimeout(r, 280))
      await api.delete(`/api/records/${id}`)
      toast.success('Record removed')
      bumpRefetch()
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      setFadingId(null)
    }
  }

  const canGoPrev = page > 1
  const canGoNext = rows.length === LIMIT

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-surface">Financial records</h1>
          <p className="mt-1 text-sm text-muted">
            {isAdmin ? 'Full management' : 'Read-only · your assigned rows'}
          </p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => void openCreate()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-primary shadow-lg shadow-accent/20 hover:brightness-110"
          >
            <Plus className="size-4" />
            Create record
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-white/10 bg-secondary/60 p-4">
        <label className="text-sm">
          <span className="mb-1 block text-xs uppercase tracking-wide text-muted">Type</span>
          <select
            value={typeFilter}
            onChange={(e) => {
              setPage(1)
              setTypeFilter((e.target.value || '') as RecordType | '')
            }}
            className="rounded-xl border border-white/10 bg-primary/50 px-3 py-2 text-sm text-surface outline-none focus:border-accent/50"
          >
            <option value="">All</option>
            <option value="INCOME">INCOME</option>
            <option value="EXPENSE">EXPENSE</option>
          </select>
        </label>
        <label className="min-w-[180px] flex-1 text-sm">
          <span className="mb-1 block text-xs uppercase tracking-wide text-muted">Category</span>
          <input
            value={categoryFilter}
            onChange={(e) => {
              setPage(1)
              setCategoryFilter(e.target.value)
            }}
            placeholder="Filter…"
            className="w-full rounded-xl border border-white/10 bg-primary/50 px-3 py-2 text-sm text-surface outline-none focus:border-accent/50"
          />
        </label>
        <button
          type="button"
          onClick={() => bumpRefetch()}
          className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-surface hover:bg-white/5"
        >
          Apply
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-secondary/80">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium text-right">Amount</th>
                {isAdmin && <th className="px-4 py-3 font-medium text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={isAdmin ? 5 : 4} className="px-4 py-3">
                        <Skeleton className="h-8 w-full" />
                      </td>
                    </tr>
                  ))
                : rows.map((r) => (
                    <tr
                      key={r.id}
                      className={`text-surface/90 transition-opacity duration-300 ${
                        fadingId === r.id ? 'opacity-0' : 'opacity-100'
                      }`}
                    >
                      <td className="px-4 py-3 text-muted">
                        {new Date(r.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            r.type === 'INCOME'
                              ? 'bg-accent/15 text-accent'
                              : 'bg-white/10 text-surface/80'
                          }`}
                        >
                          {r.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">{r.category}</td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums">
                        {formatCurrency(r.amount)}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex gap-1">
                            <button
                              type="button"
                              onClick={() => openEdit(r)}
                              className="rounded-lg p-2 text-surface/70 hover:bg-white/10 hover:text-accent"
                              aria-label="Edit"
                            >
                              <Pencil className="size-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDelete(r.id)}
                              disabled={fadingId === r.id}
                              className="rounded-lg p-2 text-surface/70 hover:bg-red-500/15 hover:text-red-300 disabled:opacity-40"
                              aria-label="Delete"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {!loading && rows.length === 0 && (
          <p className="p-10 text-center text-sm text-muted">No records match your filters.</p>
        )}

        <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 text-sm text-muted">
          <span>
            Page {page}
            {rows.length === 0 ? '' : ` · ${rows.length} row(s)`}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!canGoPrev}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-white/15 px-3 py-1.5 text-surface hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={!canGoNext}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-white/15 px-3 py-1.5 text-surface hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <RecordFormModal
        open={modalOpen}
        mode={modalMode}
        onClose={() => setModalOpen(false)}
        onSaved={(kind) => {
          if (kind === 'create') afterRecordCreated()
          else afterRecordUpdated()
        }}
        record={editing}
        users={users}
      />
    </div>
  )
}
