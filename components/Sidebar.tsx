'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ClipboardList, Users, Wrench, Truck, CreditCard, Settings } from 'lucide-react'
import SignOutButton from './SignOutButton'

const groups = [
  { title:'Overview', items:[['Dashboard','/dashboard',LayoutDashboard]] },
  { title:'Operations', items:[['Service Requests','/requests',ClipboardList]] },
  { title:'Masters', items:[['Drivers','/drivers',Users],['Mechanics','/mechanics',Wrench],['Vehicles','/vehicles',Truck]] },
  { title:'Finance & Reports', items:[['Payments','/payments',CreditCard]] },
]
export default function Sidebar(){
 const path=usePathname()
 return <aside className="sidebar">
   <div className="brand">TRUCK <span>ASSIST</span><small>ADMIN PORTAL</small></div>
   {groups.map(g=><div key={g.title}><div className="nav-section">{g.title}</div>{g.items.map(([label,href,Icon])=><Link key={href as string} href={href as string} className={'nav '+(path===href?'active':'')}><Icon size={16}/><span>{label as string}</span></Link>)}</div>)}
   <div className="nav-section">System</div>
   <Link href="/settings" className="nav"><Settings size={16}/><span>Settings</span></Link>
   <SignOutButton />
 </aside>
}
