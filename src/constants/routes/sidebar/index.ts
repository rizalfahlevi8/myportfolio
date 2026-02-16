import {
  PATH_HOME,
  PATH_NEXT_PRIVATE_ABOUT,
  PATH_NEXT_PRIVATE_PROJECT,
  PATH_NEXT_PRIVATE_SKILL,
  PATH_NEXT_PRIVATE_SOSMED,
  PATH_NEXT_PRIVATE_WORKEXPERIENCE
} from "@/constants/routes/pages/menu/configuration";

export const SIDEBAR_LIST_MENU: SidebarListMenu = [
  {
    parent: "Data Master",
    subMenu: [
      {
        label: "About",
        path: PATH_NEXT_PRIVATE_ABOUT,
        icon: "User",
      },
      {
        label: "Skills",
        path: PATH_NEXT_PRIVATE_SKILL,
        icon: "Award",
      },
      {
        label: "Sosmed",
        path: PATH_NEXT_PRIVATE_SOSMED,
        icon: "Podcast",
      },
      {
        label: "Projects",
        path: PATH_NEXT_PRIVATE_PROJECT,
        icon: "BriefcaseBusiness",
      },
      {
        label: "Work Experience",
        path: PATH_NEXT_PRIVATE_WORKEXPERIENCE,
        icon: "FilePen",
      }
    ],
  },
  {
    parent: "Portfolio",
    subMenu: [
      {
        label: "Portofolio",
        path: PATH_HOME,
        icon: "User",
      },
    ],
  },
];

