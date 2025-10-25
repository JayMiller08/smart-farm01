import { Home, Cloud, Sparkles, Calculator, User, Radio, MapPin, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Weather", url: "/weather", icon: Cloud },
  { title: "Soil Analysis", url: "/soil-analysis", icon: MapPin },
  { title: "Farm AI", url: "/ai-advisor", icon: Sparkles },
  { title: "Calculators", url: "/calculators", icon: Calculator },
  { title: "IoT Sensors", url: "/iot-dashboard", icon: Radio },
  { title: "Profile", url: "/profile", icon: User },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const navigate = useNavigate();

  // Placeholder logo: replace src with your logo path if available
  const logoSrc = ""; // or wherever your logo is

  function handleLogout() {
    // Add your logout logic here
    // For now, just redirect to login
    navigate("/login");
  }

  return (
  <Sidebar collapsible="icon" className="border-r flex flex-col h-full bg-green-200">
      <SidebarContent className="flex flex-col h-full">
        {/* Logo and Title */}
        <div className="flex flex-col items-center pt-6 pb-2">
          <img src={logoSrc} alt="Logo" className="h-12 w-12 mb-2" />
          <SidebarGroupLabel>
            <span className="text-green-800 font-bold text-lg">Smart Farm</span>
          </SidebarGroupLabel>
        </div>
  {/* Space between logo/title and menu */}
  <div className="mb-2" />
        {/* Menu */}
        <SidebarGroupContent className="flex-1">
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <NavLink
                    to={item.url}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-lg font-semibold ${
                        isActive
                          ? "bg-green-300 text-green-900 font-bold"
                          : "text-green-900 hover:bg-green-100"
                      }`
                    }
                  >
                    <item.icon className="h-6 w-6" />
                    {open && <span>{item.title}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
        {/* Logout at the bottom */}
        <div className="mt-auto mb-4 flex justify-center">
          <SidebarMenu className="w-full">
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <button
                  onClick={handleLogout}
                  className={
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-lg font-semibold text-red-600 hover:bg-red-100 w-full justify-start`
                  }
                >
                  <LogOut className="h-6 w-6" />
                  {open && <span>Logout</span>}
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
