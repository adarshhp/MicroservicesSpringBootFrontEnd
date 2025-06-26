// app/components/ClientLayout.tsx
"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "../navbar/Navbar"; // Adjust path as needed

type Props = {
  children: React.ReactNode;
};

const ClientLayout = ({ children }: Props) => {
  const pathname = usePathname();
  const shouldShowNavbar = pathname !== "/"; // Hide navbar on root route

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      {children}
    </>
  );
};

export default ClientLayout;
