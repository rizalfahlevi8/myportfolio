type SubMenu = {
  label: string;
  path: string;
  itemMenu?: Array<SubMenu>;
  icon?: any;
  disabled?: boolean;
};

type SidebarMenu = {
  parent: string;
  subMenu: Array<SubMenu>;
};

type SidebarListMenu = Array<SidebarMenu>;
