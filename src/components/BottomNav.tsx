import { Home, Cloud, Sparkles, Calculator, User } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Weather", url: "/weather", icon: Cloud },
  { title: "Farm AI", url: "/ai-advisor", icon: Sparkles },
  { title: "Tools", url: "/calculators", icon: Calculator },
  { title: "Profile", url: "/profile", icon: User },
];

export function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t shadow-elegant z-50">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs font-medium">{item.title}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
