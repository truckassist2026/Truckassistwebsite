import AdminShell from '@/components/AdminShell'
import RequestTable from '@/components/RequestTable'
import { createClient } from '@/lib/supabase/server'
import { getMechanicProfiles, getUsersMap } from '@/lib/admin-data'
import { REQUEST_STATUSES } from '@/lib/status'

export default async function Requests(){
 const supabase=await createClient()
 const [{data,error}, mechanics] = await Promise.all([
  supabase.from('service_requests').select('id,driver_id,category,description,address,status,assigned_mechanic_id,created_at,completed_at,cancelled_at,latitude,longitude').order('created_at',{ascending:false}).limit(500),
  getMechanicProfiles()
 ])
 const rows=data??[]
 const users=await getUsersMap(rows.map(r=>r.driver_id))
 const userObj=Object.fromEntries([...users.entries()]); const mechanicObj=Object.fromEntries(mechanics.map((m:any)=>[m.id,{...m.user,...m}]))
 const counts=Object.fromEntries(REQUEST_STATUSES.map(s=>[s,rows.filter(r=>r.status===s).length]))
 return <AdminShell title="Service Requests"><div className="content">
  <div className="title-row"><div><div className="eyebrow-text">OPERATIONS</div><h1 className="title">Service Requests</h1><p className="subtitle">Monitor, search and open every roadside assistance transaction.</p></div><div className="request-summary"><strong>{rows.length}</strong><span>loaded requests</span></div></div>
  <div className="status-strip">{REQUEST_STATUSES.map(s=><div className="status-count" key={s}><span className={'stage-dot '+(s==='COMPLETED'?'green':s==='CANCELLED'?'red':'blue')}/><div><strong>{counts[s]??0}</strong><small>{s.replaceAll('_',' ')}</small></div></div>)}</div>
  <div className="panel"><RequestTable rows={rows} users={userObj} mechanics={mechanicObj}/>{error&&<div className="error">Unable to load requests: {error.message}</div>}</div>
 </div></AdminShell>
}
