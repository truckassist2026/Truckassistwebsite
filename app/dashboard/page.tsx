import AdminShell from '@/components/AdminShell'
import { getDashboardData, getRecentRequests } from '@/lib/supabase/dashboard'
import { getUsersMap } from '@/lib/admin-data'
import { Users, Wrench, ClipboardList, Activity, CircleDollarSign, Clock3, CheckCircle2, Search, ArrowUpRight } from 'lucide-react'
import { statusClass } from '@/lib/status'
import Link from 'next/link'

const money=(n:number)=>`₹${n.toLocaleString('en-IN',{maximumFractionDigits:0})}`
export default async function Dashboard(){
 const [data,recent]=await Promise.all([getDashboardData(),getRecentRequests()]);
 const userMap=await getUsersMap(recent.map(r=>r.driver_id))
 const statCards=[
  ['Total Drivers',data.drivers,Users,'Registered drivers'],['Total Mechanics',data.mechanics,Wrench,'Registered mechanics'],['Total Requests',data.requests,ClipboardList,`${data.today} created today`],['Active Requests',data.active,Activity,'Needs attention now'],
  ['Completed',data.statusCounts.COMPLETED,CheckCircle2,'All-time completed'],['Searching',data.statusCounts.SEARCHING,Search,'Waiting for mechanic'],['In Progress',data.statusCounts.IN_PROGRESS,Clock3,'Currently being serviced'],['Payment Pending',data.statusCounts.PAYMENT_PENDING,CircleDollarSign,'Awaiting payment']
 ] as const
 const dailyValues=Object.values(data.daily) as number[]
 const maxDaily=Math.max(1,...dailyValues)
 const topCategories=Object.entries(data.categoryCounts).sort((a,b)=>b[1]-a[1]).slice(0,6)
 const activeStages=['CREATED','SEARCHING','ASSIGNED','MECHANIC_EN_ROUTE','ARRIVED','IN_PROGRESS','PAYMENT_PENDING']
 return <AdminShell><div className="content">
  <div className="title-row"><div><div className="eyebrow-text">OPERATIONS OVERVIEW</div><h1 className="title">Good Morning 👋</h1><p className="subtitle">A live view of your Truck Assist operations.</p></div><div className="live-pill"><span/> LIVE DATABASE</div></div>
  <div className="grid4">{statCards.map(([label,value,Icon,foot])=><div className="stat" key={label}><div className="stat-top"><span className="stat-label">{label}</span><div className="stat-icon"><Icon size={18}/></div></div><div className="stat-value">{value}</div><div className="stat-foot">{foot}</div></div>)}</div>
  <div className="dashboard-grid">
   <section className="panel"><div className="panel-head"><div><div className="panel-title">Request activity</div><div className="subtitle">Last 7 days</div></div><Link className="text-link" href="/requests">View requests <ArrowUpRight size={14}/></Link></div><div className="chart"><div className="chart-bars">{Object.entries(data.daily).map(([day,count])=><div className="bar-col" key={day}><div className="bar-value">{count}</div><div className="bar" style={{height:`${Math.max(8,(count/maxDaily)*145)}px`}}/><span>{day}</span></div>)}</div></div></section>
   <section className="panel"><div className="panel-head"><div><div className="panel-title">Service mix</div><div className="subtitle">Requests by category</div></div></div><div className="category-list">{topCategories.length?topCategories.map(([cat,count])=><div className="category-row" key={cat}><div><strong>{cat}</strong><small>{count} requests</small></div><div className="progress"><span style={{width:`${Math.round((count/(topCategories[0]?.[1]||1))*100)}%`}}/></div></div>):<div className="empty">No category data yet.</div>}</div></section>
  </div>
  <div className="dashboard-grid">
   <section className="panel"><div className="panel-head"><div><div className="panel-title">Live operational queue</div><div className="subtitle">Requests currently requiring action</div></div><Link className="text-link" href="/requests">Open queue <ArrowUpRight size={14}/></Link></div><div className="stage-grid">{activeStages.map(s=><div className="stage-card" key={s}><span className={'stage-dot '+statusClass(s)}/><div><strong>{s.replaceAll('_',' ')}</strong><small>{data.statusCounts[s]??0} requests</small></div></div>)}</div></section>
   <section className="panel"><div className="panel-head"><div><div className="panel-title">Payments snapshot</div><div className="subtitle">Last 7 days</div></div><CircleDollarSign size={18} className="panel-icon"/></div><div className="payment-big">{money(data.paymentAmount)}</div><div className="payment-label">Total recorded</div><div className="payment-split"><div><strong>{money(data.paidAmount)}</strong><span>Paid / successful</span></div><div><strong>{money(Math.max(0,data.paymentAmount-data.paidAmount))}</strong><span>Outstanding</span></div></div></section>
  </div>
  <section className="panel"><div className="panel-head"><div><div className="panel-title">Recent assistance requests</div><div className="subtitle">Latest transactions from the Driver app</div></div><Link className="btn secondary" href="/requests">View all</Link></div><div className="table-wrap"><table className="table"><thead><tr><th>Request</th><th>Driver</th><th>Category</th><th>Status</th><th>Created</th></tr></thead><tbody>{recent.map(r=><tr key={r.id}><td><Link className="table-link" href={`/requests/${r.id}`}>#{String(r.id).slice(0,8)}</Link></td><td>{userMap.get(r.driver_id)?.name||String(r.driver_id).slice(0,8)}</td><td>{r.category||'—'}</td><td><span className={'badge '+statusClass(r.status)}>{r.status}</span></td><td>{new Date(r.created_at).toLocaleString('en-IN')}</td></tr>)}</tbody></table></div></section>
 </div></AdminShell>
}
