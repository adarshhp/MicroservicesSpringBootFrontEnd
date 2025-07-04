"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const SidebarD = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("company");
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    const storedTab = localStorage.getItem("activetab") || "company";
    const storedUserType = localStorage.getItem("user_type");

    setActiveTab(storedTab);
    setUserType(storedUserType);
  }, []);

  const isActive = (tab: string) =>
    activeTab !== tab
      ? `w-full text-left px-4 hover:bg-gray-700 rounded`
      : `w-full text-left px-4 hover:bg-gray-200 bg-gray-300 rounded text-black`;

  return (
<div className="w-64 max-h-screen bg-green-300 text-white p-30 flex flex-col">
      <div className="space-y-4">
        <h2 className="text-xl font-bold mb-6">Dashboard</h2>

        {/* Company access: user_type === "3" */}
        {userType === "3" && (
          <>
            <button
              className={isActive("company")}
              onClick={() => {
                router.push("/company");
                setActiveTab("company");
                localStorage.setItem("activetab", "company");
              }}
            >
              Company
            </button>

            <button
              className={isActive("rcompany")}
              onClick={() => {
                router.push("/reports/companyreport");
                setActiveTab("rcompany");
                localStorage.setItem("activetab", "rcompany");
              }}
            >
              Company Report
            </button>
          </>
        )}

        {/* Seller access: user_type === "2" */}
        {userType === "2" && (
          <>
            <button
              className={isActive("seller")}
              onClick={() => {
                router.push("/seller");
                setActiveTab("seller");
                localStorage.setItem("activetab", "seller");
              }}
            >
              Seller
            </button>

            <button
              className={isActive("rseller")}
              onClick={() => {
                router.push("/reports/sellerreports");
                setActiveTab("rseller");
                localStorage.setItem("activetab", "rseller");
              }}
            >
              Seller Report
            </button>
          </>
        )}

        {/* Customer access: user_type === "1" */}
        {userType === "1" && (
          <button
            className={isActive("customer")}
            onClick={() => {
              router.push("/customer");
              setActiveTab("customer");
              localStorage.setItem("activetab", "customer");
            }}
          >
            Customer
          </button>
        )}
      </div>

      <div className="mt-auto pt-4">
        <button
          className="w-full bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition"
          onClick={() => {
            localStorage.removeItem("user_type");
            localStorage.removeItem("company_id");
            localStorage.removeItem("user_id");
            localStorage.removeItem("activetab");
            router.push("/");
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default SidebarD;
