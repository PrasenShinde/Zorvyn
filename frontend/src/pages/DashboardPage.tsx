import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { api, getErrorMessage } from '../lib/api'
import { formatCurrency, parseMoneyString } from '../lib/money'
import type { DashboardSummary, FinancialRecord } from '../types/api'
import { Skeleton } from '../components/ui/Skeleton'

const PIE_COLORS = ['#01c38d', '#2dd4bf', '#38bdf8', '#a78bfa', '#fbbf24', '#f472b6', '#696e79']

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ name?: string; value?: number }>
}) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  if (!p) return null
  return (
    <div className="rounded-lg border border-white/10 bg-secondary px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-surface">{String(p.name)}</p>
      <p className="text-accent">{formatCurrency(Number(p.value))}</p>
    </div>
  )
}

function RecentTable({ rows, loading }: { rows: FinancialRecord[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (!rows.length) {
    return (
      <p className="p-8 text-center text-sm text-muted">No recent activity yet.</p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-muted">
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.map((r) => (
            <tr key={r.id} className="text-surface/90">
              <td className="px-4 py-3 text-muted">
                {new Date(r.date).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    r.type === 'INCOME'
                      ? 'bg-accent/15 text-accent'
                      : 'bg-white/10 text-surface/80'
                  }`}
                >
                  {r.type}
                </span>
              </td>
              <td className="px-4 py-3">{r.category}</td>
              <td
                className={`px-4 py-3 text-right font-medium tabular-nums ${
                  r.type === 'INCOME' ? 'text-accent' : 'text-surface'
                }`}
              >
                {r.type === 'EXPENSE' ? '−' : '+'}
                {formatCurrency(r.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const res = await api.get<DashboardSummary>('/api/dashboard/summary')
        if (!cancelled) setData(res.data)
      } catch (e) {
        toast.error(getErrorMessage(e, 'Could not load dashboard'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const pieData = useMemo(() => {
    const raw = data?.expenseCategoryTotals ?? {}
    return Object.entries(raw)
      .map(([name, value]) => ({ name, value }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value)
  }, [data])

  const net = data ? parseMoneyString(data.netBalance) : 0

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-surface">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Summary and category expense allocation</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Total income"
          loading={loading}
          value={data?.totalIncome}
          icon={<ArrowUpRight className="size-5 text-accent" />}
          accent
        />
        <SummaryCard
          label="Total expenses"
          loading={loading}
          value={data?.totalExpenses}
          icon={<ArrowDownRight className="size-5 text-surface/80" />}
        />
        <SummaryCard
          label="Net balance"
          loading={loading}
          value={data?.netBalance}
          icon={<Wallet className="size-5 text-accent" />}
          highlight={net >= 0}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-secondary/80 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Expenses by category
          </h2>
          <p className="mt-1 text-xs text-surface/50">Doughnut · expense transactions only</p>
          <div className="mt-4 h-72">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : pieData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted">
                No expense data to chart
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={68}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 12, color: '#9ca3af' }}
                    formatter={(value) => <span className="text-surface/80">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-secondary/80">
          <div className="border-b border-white/10 px-6 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Recent activity
            </h2>
            <p className="mt-1 text-xs text-surface/50">Latest five transactions</p>
          </div>
          <RecentTable rows={data?.recentActivity ?? []} loading={loading} />
        </div>
      </div>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  loading,
  icon,
  accent,
  highlight,
}: {
  label: string
  value?: string
  loading: boolean
  icon: ReactNode
  accent?: boolean
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-secondary/80 p-5 ${
        accent ? 'ring-1 ring-accent/20' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        <span className="rounded-lg bg-primary/50 p-2">{icon}</span>
      </div>
      {loading ? (
        <Skeleton className="mt-4 h-9 w-36" />
      ) : (
        <p
          className={`mt-3 text-2xl font-semibold tabular-nums tracking-tight ${
            highlight === false ? 'text-red-300' : 'text-surface'
          }`}
        >
          {value != null ? formatCurrency(value) : '—'}
        </p>
      )}
    </div>
  )
}
