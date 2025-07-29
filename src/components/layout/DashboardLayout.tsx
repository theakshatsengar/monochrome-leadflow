import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Header } from "./Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background overflow-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen max-w-full overflow-hidden">
          <Header />
          <main className="flex-1 p-6 min-h-0 overflow-hidden max-w-full">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}