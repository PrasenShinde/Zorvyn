import { useEffect, useRef, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { api, getErrorMessage } from '../../lib/api'
import type { FinancialRecord, RecordType, UserSummary } from '../../types/api'
import { Modal } from '../ui/Modal'

const AMOUNT_HELP = 'Amount in ₹ — positive decimal, up to 2 fractional digits (e.g. 1250.50)'

type Mode = 'create' | 'edit'

export function RecordFormModal({
  open,
  mode,
  onClose,
  onSaved,
  record,
  users,
}: {
  open: boolean
  mode: Mode
  onClose: () => void
  onSaved: (kind: 'create' | 'edit') => void
  record: FinancialRecord | null
  users: UserSummary[]
}) {
  const [submitting, setSubmitting] = useState(false)
  const submitLock = useRef(false)

  const [userId, setUserId] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<RecordType>('EXPENSE')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && record) {
      setAmount(record.amount)
      setCategory(record.category)
      setNotes(record.notes ?? '')
      setUserId(record.user_id)
      setType(record.type)
      setDate(record.date.slice(0, 10))
    } else if (mode === 'create') {
      setAmount('')
      setCategory('')
      setNotes('')
      setType('EXPENSE')
      setDate(new Date().toISOString().slice(0, 10))
      setUserId(users[0]?.id ?? '')
    }
  }, [open, mode, record, users])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting || submitLock.current) return
    submitLock.current = true
    setSubmitting(true)
    try {
      if (mode === 'create') {
        await api.post('/api/records', {
          user_id: userId,
          amount,
          type,
          category,
          date: new Date(date).toISOString(),
          notes: notes.trim() || undefined,
        })
        toast.success('Record created')
        onSaved('create')
      } else if (record) {
        const body: { amount?: string; category?: string; notes?: string | null } = {}
        if (amount !== record.amount) body.amount = amount
        if (category !== record.category) body.category = category
        const notesNorm = notes.trim()
        const prev = record.notes ?? ''
        if (notesNorm !== prev) body.notes = notesNorm === '' ? null : notesNorm
        if (Object.keys(body).length === 0) {
          toast.message('No changes to save')
          onClose()
          return
        }
        await api.put(`/api/records/${record.id}`, body)
        toast.success('Record updated')
        onSaved('edit')
      }
      onClose()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      submitLock.current = false
      setSubmitting(false)
    }
  }

  const title = mode === 'create' ? 'Create record' : 'Edit record'

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        {mode === 'create' && (
          <>
            <label className="block text-sm">
              <span className="text-muted">Assign to user</span>
              <select
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-primary/50 px-3 py-2.5 text-sm text-surface outline-none focus:border-accent/50"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.email} ({u.role})
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-muted">Type</span>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as RecordType)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-primary/50 px-3 py-2.5 text-sm text-surface outline-none focus:border-accent/50"
              >
                <option value="INCOME">INCOME</option>
                <option value="EXPENSE">EXPENSE</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-muted">Date</span>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-primary/50 px-3 py-2.5 text-sm text-surface outline-none focus:border-accent/50"
              />
            </label>
          </>
        )}

        <label className="block text-sm">
          <span className="text-muted">Amount</span>
          <input
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-primary/50 px-3 py-2.5 text-sm text-surface outline-none focus:border-accent/50"
            placeholder="0.00"
            inputMode="decimal"
          />
          <span className="mt-1 block text-xs text-surface/45">{AMOUNT_HELP}</span>
        </label>

        <label className="block text-sm">
          <span className="text-muted">Category</span>
          <input
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-primary/50 px-3 py-2.5 text-sm text-surface outline-none focus:border-accent/50"
            placeholder="e.g. Rent"
          />
        </label>

        <label className="block text-sm">
          <span className="text-muted">Notes</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1 w-full resize-none rounded-xl border border-white/10 bg-primary/50 px-3 py-2.5 text-sm text-surface outline-none focus:border-accent/50"
            placeholder="Optional"
          />
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-surface hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-primary hover:brightness-110 disabled:opacity-60"
          >
            {submitting ? 'Saving…' : mode === 'create' ? 'Create' : 'Save changes'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
