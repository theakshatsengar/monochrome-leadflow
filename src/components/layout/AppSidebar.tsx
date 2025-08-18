import { useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Settings,
  Mail,
  ChevronDown,
  ChevronRight,
  CheckSquare,
  UserCheck,
  LogOut,
  User,
  FlaskConical
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

// Define navigation items with role-based access
const getNavigationItems = (userRole: string | undefined) => {
  if (userRole === 'intern') {
    return [
      { title: "Dashboard", url: "/", icon: UserCheck, roles: ['intern'] },
  { title: "Leads", url: "/leads", icon: Users, roles: ['intern'] },
  { title: "Email Templates", url: "/email-templates", icon: Mail, roles: ['intern'] },
    ];
  }

  const baseItems = [
    { title: "Dashboard", url: "/", icon: LayoutDashboard, roles: ['admin', 'manager'] },
    { title: "Leads", url: "/leads", icon: Users, roles: ['admin', 'manager', 'intern'] },
  ];

  const roleSpecificItems = [
    // Manager/Admin items
    { title: "Analytics", url: "/analytics", icon: BarChart3, roles: ['admin', 'manager'] },
    { title: "Task Management", url: "/todo-management", icon: CheckSquare, roles: ['admin', 'manager'] },
    
    // Admin-only items
    { title: "Settings", url: "/settings", icon: Settings, roles: ['admin'] },
  ];

  // Add Email Templates for all roles (will be filtered by getNavigationItems)
  const emailTemplateItem = { title: "Email Templates", url: "/email-templates", icon: Mail, roles: ['admin', 'manager', 'intern'] };

  const allItems = [...baseItems, ...roleSpecificItems, emailTemplateItem];
  
  if (!userRole) return baseItems;
  
  return allItems.filter(item => item.roles.includes(userRole));
};

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  // Get navigation items based on user role
  const items = getNavigationItems(user?.role);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === "/" && currentPath === "/") return true;
    if (path !== "/" && currentPath.startsWith(path)) return true;
    return false;
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary text-primary-foreground font-medium" 
      : "hover:bg-muted";

  return (
    <Sidebar
      className={`${collapsed ? "w-20" : "w-60"} border-r border-border bg-background`}
      collapsible="icon"
    >
      <SidebarContent>
        {/* Logo/Brand */}
        <div className="p-4 border-b border-border">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2'}`}>
            <div className="h-8 w-8 bg-primary rounded flex items-center justify-center flex-shrink-0">
              <FlaskConical className="h-4 w-4 text-primary-foreground" />
            </div>
            {!collapsed && (
              <span className="font-semibold text-foreground">lessboring</span>
            )}
          </div>
        </div>

        <SidebarGroup className="pt-4">
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"}
                      className={getNavCls({ isActive: isActive(item.url) })}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Profile Section at Bottom */}
        {user && (
          <div className="mt-auto border-t border-border p-4">
            {collapsed ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full p-2 h-auto">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start p-2 h-auto">
                    <div className="flex items-center gap-3 w-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}