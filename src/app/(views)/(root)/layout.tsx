import { inter, calistoga } from "@/constants/styles/general";
import { twMerge } from "tailwind-merge";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={twMerge(
        inter.variable,
        calistoga.variable,
        "bg-gray-50 text-black antialiased font-sans"
      )}
    >
      {children}
    </div>
  );
}
