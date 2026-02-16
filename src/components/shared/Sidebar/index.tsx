"use client";

import { SIDEBAR_LIST_MENU } from "@/constants/routes/sidebar";
import React, { useState } from "react";
import SidebarMenuItem from "./SidebarMenuItem";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem as SidebarMenuItemUI,
} from "@/components/ui/sidebar";
import { Command } from "lucide-react";

const SidebarComponent: React.FC = () => {
  const [filteredMenu] = useState<SidebarMenu[]>(SIDEBAR_LIST_MENU);

  // 🔥 pindah ke index
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const renderMenu = () => (
    <div className="space-y-4">
      {filteredMenu.map((menu: SidebarMenu) => (
        <SidebarMenuItem
          key={menu.parent}
          parent={menu.parent}
          dataSubMenu={menu.subMenu}
          openDropdown={openDropdown}
          setOpenDropdown={setOpenDropdown}
        />
      ))}
    </div>
  );

  return (
    <Sidebar variant="inset" className="border-r">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItemUI>
            <SidebarMenuButton size="lg" asChild>
              <div>
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Portfolio</span>
                  <span className="truncate text-xs">Management</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItemUI>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>{renderMenu()}</SidebarContent>
    </Sidebar>
  );
};

export default SidebarComponent;
