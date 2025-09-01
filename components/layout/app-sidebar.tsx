"use client";

import * as React from "react";
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/layout/nav-documents";
import { NavMain } from "@/components/layout/nav-main";
import { NavSecondary } from "@/components/layout/nav-secondary";
import { NavUser } from "@/components/layout/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";

const data = {
  navMain: [
    {
      title: "Overview",
      url: "/",
      icon: IconDashboard,
    },
    {
      title: "Validators",
      url: "/validators",
      icon: IconListDetails,
    },
    {
      title: "Address Explorer",
      url: "/address-explorer",
      icon: IconChartBar,
    },
    {
      title: "Reports",
      url: "#",
      icon: IconFolder,
    },
  ],

  navSecondary: [
    {
      title: "Overview",
      url: "/",
      icon: IconDashboard,
    },
    {
      title: "Burn History",
      url: "#",
      icon: IconListDetails,
    },
  ],

  navTertiary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props} className=" p-4 pr-0">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Image
                src={
                  "https://pbs.twimg.com/profile_images/1932937462612901889/gbUt2ndV_400x400.jpg"
                }
                alt="TAC"
                width={28}
                height={28}
                className=" w-7 h-7 rounded-sm "
              />
              <div className="grid flex-1 text-left text-md font-semibold leading-tight">
                TAC Staking Dashboard
                <span className="text-xs text-muted-foreground">v0.1.0</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* <NavMain items={data.navMain} label="Dashboard" /> */}
        <NavMain items={data.navSecondary} label="Restricted Validators" />
        <NavSecondary items={data.navTertiary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  );
}
