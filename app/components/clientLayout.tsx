"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "../navbar/Navbar";
import Sidebar from "./sidebar/sidebar";
import SidebarD from "./sidebar/sidebardupe";

type Props = {
  children: React.ReactNode;
};

const ClientLayout = ({ children }: Props) => {
  const pathname = usePathname();
  const shouldShowLayout = pathname !== "/"; // Hide layout on login

  if (!shouldShowLayout) return <>{children}</>;

  return (
    <>
      <div className="flex">
        <Sidebar />
        <SidebarD/>
        <div className="w-full">
          <main className="flex-1 bg-gray-100 min-h-screen">
                    <Navbar/>

          {children}
          </main>
        </div>
      </div>
    </>
  );
};

export default ClientLayout;
