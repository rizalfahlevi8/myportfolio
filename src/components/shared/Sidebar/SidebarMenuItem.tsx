"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import * as LucideIcons from "lucide-react";
import { LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem as SidebarMenuItemUI,
} from "@/components/ui/sidebar";

type SidebarMenuItemProps = {
  parent?: string;
  dataSubMenu: Array<SubMenu>;
  openDropdown: string | null;
  setOpenDropdown: React.Dispatch<React.SetStateAction<string | null>>;
};

const getIcon = (iconName: string): LucideIcon => {
  const icons = LucideIcons as unknown as Record<string, LucideIcon>;
  return icons[iconName] ?? LucideIcons.FileText;
};

const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({
  parent,
  dataSubMenu,
  openDropdown,
  setOpenDropdown,
}) => {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      {parent && (
        <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground">
          {parent}
        </SidebarGroupLabel>
      )}

      <SidebarMenu>
        {dataSubMenu.map((item, index) => {
          const isActive =
            item.path === "/"
              ? pathname === item.path
              : pathname?.startsWith(item.path);
          const Icon = getIcon(item.icon);
          const isOpen = openDropdown === item.label;

          return (
            <React.Fragment key={index}>
              <SidebarMenuItemUI>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.label}
                  disabled={item.disabled}
                >
                  <Link
                    href={item.path}
                    onClick={(event) => {
                      if (item.itemMenu) {
                        event.preventDefault();
                        setOpenDropdown((prev) =>
                          prev === item.label ? null : item.label,
                        );
                      } else {
                        setOpenDropdown(null);
                      }
                    }}
                    className={clsx({
                      "pointer-events-none opacity-40": item.disabled,
                    })}
                  >
                    <Icon className="size-4" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItemUI>

              {item.itemMenu && isOpen && (
                <div className="ml-6 space-y-1">
                  {item.itemMenu.map((sub, i) => {
                    const SubIcon = getIcon(sub.icon);
                    const subActive = pathname?.startsWith(sub.path);

                    return (
                      <Link
                        key={i}
                        href={sub.path}
                        className={clsx(
                          "flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-muted",
                          {
                            "bg-muted font-medium": subActive,
                          },
                        )}
                      >
                        <SubIcon className="size-4" />
                        <span>{sub.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
};

export default SidebarMenuItem;
