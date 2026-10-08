import { createClient } from './server'

const ACTIVE_STATUSES = ['CREATED','SEARCHING','ASSIGNED','MECHANIC_EN_ROUTE','ARRIVED','IN_PROGRESS','PAYMENT_PENDING']
const STATUS_ORDER = ['CREATED','SEARCHING','ASSIGNED','MECHANIC_EN_ROUTE','ARRIVED','IN_PROGRESS','PAYMENT_PENDING','COMPLETED','CANCELLED']

export async function getDashboardData(){
 const supabase = await createClient()
 const start = new Date(); start.setHours(0,0,0,0)
 const seven = new Date(); seven.setDate(seven.getDate()-6); seven.setHours(0,0,0,0)
 const statusQueries = STATUS_ORDER.map(s => supabase.from('service_requests').select('id',{count:'exact',head:true}).eq('status',s))
 const [drivers, mechanics, requests, today, requestRows, payments, ...statusResults] = await Promise.all([
   supabase.from('drivers').select('id',{count:'exact',head:true}),
   supabase.from('mechanics').select('id',{count:'exact',head:true}),
   supabase.from('service_requests').select('id',{count:'exact',head:true}),
   supabase.from('service_requests').select('id',{count:'exact',head:true}).gte('created_at',start.toISOString()),
   supabase.from('service_requests').select('id,status,category,created_at').gte('created_at',seven.toISOString()).order('created_at',{ascending:true}).limit(5000),
   supabase.from('payments').select('amount,status,created_at').gte('created_at',seven.toISOString()).limit(5000),
   ...statusQueries,
 ])
 const all = requestRows.data ?? []
 const statusCounts:Record<string,number> = Object.fromEntries(STATUS_ORDER.map((s,i)=>[s,statusResults[i]?.count??0]))
 const categoryCounts:Record<string,number> = {}
 const daily:Record<string,number> = {}
 for(let i=6;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); d.setHours(0,0,0,0); daily[d.toLocaleDateString('en-IN',{day:'2-digit',month:'short'})]=0 }
 for(const r of all){ const c=r.category||'OTHER'; categoryCounts[c]=(categoryCounts[c]??0)+1; const day=new Date(r.created_at).toLocaleDateString('en-IN',{day:'2-digit',month:'short'}); daily[day]=(daily[day]??0)+1 }
 const active = ACTIVE_STATUSES.reduce((n,s)=>n+(statusCounts[s]??0),0)
 const paymentRows = payments.data ?? []
 const paidAmount = paymentRows.filter((p:any)=>['PAID','COMPLETED','SUCCESS','SUCCESSFUL'].includes(String(p.status||'').toUpperCase())).reduce((n,p)=>n+Number(p.amount||0),0)
 const paymentAmount = paymentRows.reduce((n,p)=>n+Number(p.amount||0),0)
 return {drivers:drivers.count??0, mechanics:mechanics.count??0, requests:requests.count??0, active, today:today.count??0, statusCounts, categoryCounts, daily, paidAmount, paymentAmount}
}

export async function getRecentRequests(){
 const supabase = await createClient()
 const {data,error}=await supabase.from('service_requests').select('id,driver_id,category,status,assigned_mechanic_id,created_at,address,description').order('created_at',{ascending:false}).limit(8)
 if(error) return []
 return data ?? []
}
