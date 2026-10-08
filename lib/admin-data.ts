import { createClient } from './supabase/server'

export const TERMINAL_REQUEST_STATUSES = ['COMPLETED', 'CANCELLED'] as const

export async function getUsersMap(ids: string[]) {
  const unique = [...new Set(ids.filter(Boolean))]
  if (!unique.length) return new Map<string, any>()
  const supabase = await createClient()
  const { data } = await supabase.from('users').select('id,name,phone,email,role,status,profile_image_url').in('id', unique)
  return new Map((data ?? []).map((u: any) => [u.id, u]))
}

export async function getDriverProfiles(limit = 200) {
  const supabase = await createClient()
  const { data: drivers } = await supabase.from('drivers').select('id,user_id,license_number,license_expiry_date,emergency_contact_name,emergency_contact_phone,is_available,created_at').order('created_at', { ascending: false }).limit(limit)
  const rows = drivers ?? []
  const users = await getUsersMap(rows.map((r: any) => r.user_id))
  const requestCounts = new Map<string, number>()
  if (rows.length) {
    const { data: requests } = await supabase.from('service_requests').select('driver_id,status').in('driver_id', rows.map((r: any) => r.id))
    for (const r of requests ?? []) requestCounts.set(r.driver_id, (requestCounts.get(r.driver_id) ?? 0) + 1)
  }
  return rows.map((r: any) => ({ ...r, user: users.get(r.user_id), requestCount: requestCounts.get(r.id) ?? 0 }))
}

export async function getMechanicProfiles(limit = 200) {
  const supabase = await createClient()
  const { data: mechanics } = await supabase.from('mechanics').select('id,user_id,experience_years,workshop_name,workshop_address,is_available,rating,total_jobs,latitude,longitude,last_location_at,created_at').order('created_at', { ascending: false }).limit(limit)
  const rows = mechanics ?? []
  const users = await getUsersMap(rows.map((r: any) => r.user_id))
  const activeCounts = new Map<string, number>()
  if (rows.length) {
    const { data: requests } = await supabase.from('service_requests').select('assigned_mechanic_id,status').in('assigned_mechanic_id', rows.map((r: any) => r.id))
    for (const r of requests ?? []) if (!TERMINAL_REQUEST_STATUSES.includes(r.status)) activeCounts.set(r.assigned_mechanic_id, (activeCounts.get(r.assigned_mechanic_id) ?? 0) + 1)
  }
  return rows.map((r: any) => ({ ...r, user: users.get(r.user_id), activeJobs: activeCounts.get(r.id) ?? 0 }))
}

export async function getVehicleProfiles(limit = 200) {
  const supabase = await createClient()
  const { data } = await supabase.from('vehicles').select('id,driver_id,registration_number,manufacturer,model,vehicle_type,manufacturing_year,color,is_primary,status,created_at').order('created_at', { ascending: false }).limit(limit)
  const rows = data ?? []
  const driverRows = rows.map((r: any) => r.driver_id).filter(Boolean)
  const { data: drivers } = driverRows.length ? await supabase.from('drivers').select('id,user_id').in('id', driverRows) : { data: [] }
  const users = await getUsersMap((drivers ?? []).map((r: any) => r.user_id))
  const driverMap = new Map((drivers ?? []).map((d: any) => [d.id, users.get(d.user_id)]))
  return rows.map((r: any) => ({ ...r, driver: driverMap.get(r.driver_id) }))
}

export async function getPaymentSummary() {
  const supabase = await createClient()
  const { data } = await supabase.from('payments').select('id,service_request_id,amount,status,payment_method,notes,created_at,paid_at').order('created_at', { ascending: false }).limit(1000)
  const rows = data ?? []
  const total = rows.reduce((s: number, r: any) => s + Number(r.amount || 0), 0)
  const paid = rows.filter((r: any) => ['PAID','COMPLETED','SUCCESS','SUCCESSFUL'].includes(String(r.status ?? '').toUpperCase())).reduce((s: number, r: any) => s + Number(r.amount || 0), 0)
  const pending = total - paid
  const methods = new Map<string, number>()
  for (const r of rows) { const k = r.payment_method || 'UNKNOWN'; methods.set(k, (methods.get(k) ?? 0) + Number(r.amount || 0)) }
  return { rows, total, paid, pending: Math.max(0, pending), methods: [...methods.entries()].sort((a,b) => b[1]-a[1]) }
}
