import AdminShell from '@/components/AdminShell'
import { createClient } from '@/lib/supabase/server'
import { statusClass } from '@/lib/status'
import Link from 'next/link'
import { ArrowLeft, MapPin, Phone, Truck, Wrench, CalendarDays, CreditCard, FileText } from 'lucide-react'

export default async function RequestDetails({params}:{params:Promise<{id:string}>}){
 const {id}=await params; const supabase=await createClient()
 const {data:r}=await supabase.from('service_requests').select('*').eq('id',id).single()
 if(!r) return <AdminShell title="Request"><div className="content"><div className="empty">Request not found.</div></div></AdminShell>
 const [{data:driver},{data:mechanic},{data:history},{data:payments},{data:vehicles}] = await Promise.all([
  r.driver_id?supabase.from('drivers').select('*').eq('id',r.driver_id).maybeSingle():Promise.resolve({data:null}),
  r.assigned_mechanic_id?supabase.from('mechanics').select('*').eq('id',r.assigned_mechanic_id).maybeSingle():Promise.resolve({data:null}),
  supabase.from('request_status_history').select('*').eq('request_id',id).order('created_at',{ascending:true}),
  supabase.from('payments').select('*').eq('service_request_id',id).order('created_at',{ascending:false}),
  r.driver_id?supabase.from('vehicles').select('*').eq('driver_id',r.driver_id).eq('is_primary',true).maybeSingle():Promise.resolve({data:null})
 ])
 const userIds=[driver?.user_id,mechanic?.user_id].filter(Boolean) as string[]
 const {data:users}=userIds.length?await supabase.from('users').select('id,name,phone,email,role,status').in('id',userIds):{data:[]}
 const um=new Map((users??[]).map((u:any)=>[u.id,u])); const du=driver?um.get(driver.user_id):null; const mu=mechanic?um.get(mechanic.user_id):null
 return <AdminShell title={`Request #${String(id).slice(0,8)}`}><div className="content">
  <div className="title-row"><div><Link href="/requests" className="back-link"><ArrowLeft size={14}/> Back to requests</Link><h1 className="title request-title">#{String(id).slice(0,8)} <span className={'badge '+statusClass(r.status)}>{r.status}</span></h1><p className="subtitle">{r.category||'General assistance'} · Created {new Date(r.created_at).toLocaleString('en-IN')}</p></div></div>
  <div className="detail-grid">
   <section className="panel detail-card"><div className="panel-head"><div className="panel-title"><FileText size={16}/> Service request</div></div><div className="detail-body"><div className="detail-row"><span>Category</span><strong>{r.category||'—'}</strong></div><div className="detail-row"><span>Description</span><strong>{r.description||'No description provided'}</strong></div><div className="detail-row"><span>Address</span><strong>{r.address||'Location not provided'}</strong></div><div className="detail-row"><span>Coordinates</span><strong>{r.latitude!=null&&r.longitude!=null?`${r.latitude}, ${r.longitude}`:'—'}</strong></div></div></section>
   <section className="panel detail-card"><div className="panel-head"><div className="panel-title"><Truck size={16}/> Driver & vehicle</div></div><div className="detail-body"><div className="person-block"><div className="person-avatar">{(du?.name||'D').slice(0,1).toUpperCase()}</div><div><strong>{du?.name||'Driver'}</strong><small>{du?.phone||'Phone not available'}</small></div></div><div className="detail-row"><span>License</span><strong>{driver?.license_number||'—'}</strong></div><div className="detail-row"><span>Vehicle</span><strong>{vehicles?[vehicles.registration_number,vehicles.manufacturer,vehicles.model].filter(Boolean).join(' · '):'No primary vehicle'}</strong></div></div></section>
   <section className="panel detail-card"><div className="panel-head"><div className="panel-title"><Wrench size={16}/> Assigned mechanic</div></div><div className="detail-body">{mechanic?<><div className="person-block"><div className="person-avatar mechanic-avatar">{(mu?.name||mechanic.workshop_name||'M').slice(0,1).toUpperCase()}</div><div><strong>{mechanic.workshop_name||mu?.name||'Mechanic'}</strong><small>{mu?.phone||'Phone not available'}</small></div></div><div className="detail-row"><span>Experience</span><strong>{mechanic.experience_years??0} years</strong></div><div className="detail-row"><span>Rating</span><strong>★ {mechanic.rating??'—'}</strong></div><div className="detail-row"><span>Jobs</span><strong>{mechanic.total_jobs??0}</strong></div></>:<div className="empty">No mechanic assigned.</div>}</div></section>
   <section className="panel detail-card"><div className="panel-head"><div className="panel-title"><CreditCard size={16}/> Payment</div></div><div className="detail-body">{(payments??[]).length?payments!.map((p:any)=><div className="payment-line" key={p.id}><div><strong>₹{Number(p.amount||0).toLocaleString('en-IN')}</strong><small>{p.payment_method||'Method not recorded'} · {p.status||'Pending'}</small></div><span className={'badge '+(['PAID','COMPLETED','SUCCESS','SUCCESSFUL'].includes(String(p.status||'').toUpperCase())?'green':'amber')}>{p.status||'PENDING'}</span></div>):<div className="empty">No payment recorded for this request.</div>}</div></section>
  </div>
  <section className="panel"><div className="panel-head"><div><div className="panel-title"><CalendarDays size={16}/> Request timeline</div><div className="subtitle">Status history from PostgreSQL</div></div></div><div className="timeline">{(history??[]).length?(history??[]).map((h:any,i:number)=><div className="timeline-item" key={h.id}><div className="timeline-dot"><span/></div><div className="timeline-content"><strong>{h.status}</strong><small>{new Date(h.created_at).toLocaleString('en-IN')}{h.notes?` · ${h.notes}`:''}</small></div></div>):<div className="empty">No status history recorded.</div>}</div></section>
 </div></AdminShell>
}
