import { SidebarTrigger } from "@/components/ui/sidebar";
import { useLocation } from "react-router-dom";

export function Header() {
  const location = useLocation();
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Dashboard";
      case "/leads":
        return "Lead Management";
      case "/analytics":
        return "Analytics";
      case "/settings":
        return "Settings";
      default:
        return "Lead Management";
    }
  };

  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="h-8 w-8" />
        <h1 className="text-lg font-semibold text-foreground">{getPageTitle()}</h1>
      </div>
    </header>
  );
}