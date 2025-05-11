import { Logo } from "./logo"
import { SidebarRoutes } from "./sidebar-routes"

export const Sidebar = () => {
    return (
        <div className="h-full border-r flex flex-col overflow-y-auto
        bg-white shadow-sm">
            {/* <div className="p-5">
                <Logo />
            </div> */}
            <div className="flex flex-col w-full mt-10">
                <SidebarRoutes />
            </div>
        </div>
    )
}