"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "../navbar/Navbar";
import Sidebar from "./sidebar/sidebar";

type Props = {
  children: React.ReactNode;
};

const ClientLayout = ({ children }: Props) => {
  const pathname = usePathname();
  const shouldShowLayout = pathname !== "/"; // Hide layout on login

  if (!shouldShowLayout) return <>{children}</>;

  return (
    <>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 bg-gray-100 min-h-screen">{children}</main>
      </div>
    </>
  );
};

export default ClientLayout;
