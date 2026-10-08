'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, ExternalLink, SlidersHorizontal, X } from 'lucide-react'
import { statusClass } from '@/lib/status'

const STATUSES = [
  'CREATED', 'SEARCHING', 'ASSIGNED', 'MECHANIC_EN_ROUTE',
  'ARRIVED', 'IN_PROGRESS', 'PAYMENT_PENDING', 'COMPLETED', 'CANCELLED'
]

type Props = {
  rows: any[]
  users: Record<string, any>
  mechanics: Record<string, any>
}

function formatStatus(value: string) {
  return value?.replaceAll('_', ' ') || '—'
}

function formatDate(value: string) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(value))
}

export default function RequestTable({ rows, users, mechanics }: Props) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('ALL')
  const [category, setCategory] = useState('ALL')

  const categories = useMemo(() => [...new Set(rows.map(r => r.category).filter(Boolean))].sort(), [rows])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter(r => {
      const driver = users[r.driver_id]
      const mechanic = mechanics[r.assigned_mechanic_id]
      const hay = [
        r.id, r.category, r.description, r.address,
        driver?.name, driver?.phone, driver?.email,
        mechanic?.name, mechanic?.workshop_name
      ].filter(Boolean).join(' ').toLowerCase()
      return (!q || hay.includes(q)) &&
        (status === 'ALL' || r.status === status) &&
        (category === 'ALL' || r.category === category)
    })
  }, [rows, query, status, category, users, mechanics])

  const clearFilters = () => {
    setQuery('')
    setStatus('ALL')
    setCategory('ALL')
  }

  const hasFilters = query !== '' || status !== 'ALL' || category !== 'ALL'

  return (
    <>
      <div className="filter-bar request-filter-bar">
        <div className="searchbox request-search">
          <Search size={19} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search request, driver, mechanic..."
          />
        </div>

        <div className="request-filter-control">
          <SlidersHorizontal size={17} />
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="ALL">All statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{formatStatus(s)}</option>)}
          </select>
        </div>

        <div className="request-filter-control">
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="ALL">All categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {hasFilters && (
          <button className="clear-filter" onClick={clearFilters}>
            <X size={16} /> Clear
          </button>
        )}

        <div className="request-result">
          <strong>{filtered.length}</strong><span>requests</span>
        </div>
      </div>

      <div className="table-wrap request-table-wrapper">
        <table className="table request-table">
          <thead>
            <tr>
              <th>REQUEST</th>
              <th>DRIVER</th>
              <th>SERVICE</th>
              <th>MECHANIC</th>
              <th>STATUS</th>
              <th>CREATED</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => {
              const driver = users[r.driver_id]
              const mechanic = mechanics[r.assigned_mechanic_id]
              return (
                <tr key={r.id}>
                  <td>
                    <Link href={`/requests/${r.id}`} className="request-id">
                      #{String(r.id).slice(0, 8)}
                    </Link>
                    <span className="request-location">{r.address || 'Location not provided'}</span>
                  </td>
                  <td>
                    <div className="table-person">
                      <div className="table-avatar">
                        {(driver?.name || 'D').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <strong>{driver?.name || String(r.driver_id).slice(0, 8)}</strong>
                        <span>{driver?.phone || 'No phone'}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="service-cell">
                      <strong>{r.category || 'OTHER'}</strong>
                      {r.description && <span>{r.description}</span>}
                    </div>
                  </td>
                  <td>
                    {mechanic ? (
                      <div className="mechanic-cell">
                        <strong>{mechanic.workshop_name || mechanic.name || 'Mechanic'}</strong>
                        <span>{mechanic.name || ''}</span>
                      </div>
                    ) : <span className="unassigned">Unassigned</span>}
                  </td>
                  <td>
                    <span className={`request-status ${statusClass(r.status)}`}>
                      {formatStatus(r.status)}
                    </span>
                  </td>
                  <td><span className="created-date">{formatDate(r.created_at)}</span></td>
                  <td>
                    <Link className="request-open" href={`/requests/${r.id}`} title="Open request">
                      <ExternalLink size={18} />
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="request-empty">
          <div className="request-empty-icon"><Search size={24} /></div>
          <strong>No requests found</strong>
          <span>Try changing your search or filters.</span>
        </div>
      )}
    </>
  )
}
