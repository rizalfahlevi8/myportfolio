import Sidebar from "@/components/shared/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";


export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <Sidebar/>
      <SidebarInset>
        <div className="flex-1 space-y-6 p-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )}