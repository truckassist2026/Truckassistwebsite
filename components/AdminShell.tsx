import Sidebar from './Sidebar'
export default function AdminShell({children,title='Dashboard'}:{children:React.ReactNode,title?:string}){
 return <div className="shell"><Sidebar/><main className="main"><header className="topbar"><div className="crumb">Truck Assist / <strong>{title}</strong></div><div className="admin"><span>Administrator</span><div className="avatar">A</div></div></header>{children}</main></div>
}
