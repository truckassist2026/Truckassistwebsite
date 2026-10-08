'use client'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
export default function SignOutButton(){
 const router=useRouter()
 async function signOut(){const supabase=createClient();await supabase.auth.signOut();router.replace('/login');router.refresh()}
 return <button className="nav nav-button" onClick={signOut}><LogOut size={16}/><span>Sign out</span></button>
}
