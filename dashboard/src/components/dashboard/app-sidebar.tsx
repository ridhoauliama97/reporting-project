import * as React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Collapsible as CollapsiblePrimitive } from "radix-ui";
import { NAV_GROUPS, type NavGroup } from "./nav-config";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  ChartSplineIcon,
  ChevronRightIcon,
  DatabaseIcon,
  BookOpenIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

function CollapsibleMenuGroup({ group }: { group: NavGroup }) {
  const { pathname } = useLocation();
  if (group.disabled) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          disabled
          className="cursor-not-allowed opacity-60"
          aria-disabled="true"
        >
          {group.icon}
          <span>{group.title}</span>
          <Badge
            variant="outline"
            className="ml-auto px-1.5 py-0 text-[10px] font-semibold uppercase tracking-wide"
          >
            Coming Soon
          </Badge>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }
  if (group.flat) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={pathname === group.items[0].url}
          className="data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:[&>svg]:text-sidebar-primary-foreground data-[active=true]:font-medium data-[active=true]:shadow-sm"
        >
          <NavLink to={group.items[0].url}>
            {group.items[0].icon}
            <span>{group.items[0].title}</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }
  return (
    <CollapsiblePrimitive.Root
      asChild
      defaultOpen
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsiblePrimitive.Trigger asChild>
          <SidebarMenuButton>
            {group.icon}
            <span>{group.title}</span>
            <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsiblePrimitive.Trigger>
        <CollapsiblePrimitive.Content>
          <SidebarMenuSub>
            {group.items.map((item) => (
              <SidebarMenuSubItem key={item.url}>
                <SidebarMenuSubButton
                  asChild
                  isActive={pathname === item.url}
                  className="data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:[&>svg]:text-sidebar-primary-foreground data-[active=true]:font-medium data-[active=true]:shadow-sm"
                >
                  <NavLink to={item.url}>
                    {item.icon}
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsiblePrimitive.Content>
      </SidebarMenuItem>
    </CollapsiblePrimitive.Root>
  );
}

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <NavLink to="/dashboard">
                <div className="flex size-6 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                  <ChartSplineIcon className="size-4!" />
                </div>
                <span className="text-base font-semibold">Database Report</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_GROUPS.map((group) => (
                <CollapsibleMenuGroup key={group.title} group={group} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/docs" target="_blank" rel="noopener noreferrer">
                <BookOpenIcon className="size-4" />
                <span>Documentation</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild disabled>
              {/* <NavLink to="/" className=""> */}
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <DatabaseIcon className="size-3.5" />
                Version · v{__APP_VERSION__}
              </span>
              {/* </NavLink> */}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
