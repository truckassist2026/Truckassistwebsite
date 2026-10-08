import { createClient } from './supabase/server'
export async function getRows(table:string, select:string, limit=100){ const supabase=await createClient(); const {data}=await supabase.from(table).select(select).order('created_at',{ascending:false}).limit(limit); return data??[] }
