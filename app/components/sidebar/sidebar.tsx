"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const Sidebar = () => {
  const router = useRouter();

  useEffect(() => {
    const ff = localStorage.getItem("user_type");
    console.log(ff, "user_type");
  }, []);
const ff=localStorage.getItem("activetab")
  const[activetab,setactivetab]=useState(ff||"company");
  return (
    <div className="w-64 min-h-screen bg-gray-900 text-white p-4 flex flex-col">
      <div className="space-y-4">
        <h2 className="text-xl font-bold mb-6">Dashboard</h2>

        <button
          className={activetab!="company"?`w-full text-left px-4  hover:bg-gray-700 rounded`:`w-full text-left px-4  hover:bg-gray-200 bg-gray-300 rounded text-black`}
          onClick={() => {router.push("/company");setactivetab("company");localStorage.setItem("activetab","company")}}
        >
          Company
        </button>

        <button
          className={activetab!="seller"?`w-full text-left px-4  hover:bg-gray-700 rounded`:"w-full text-left px-4  hover:bg-gray-200 bg-gray-300 rounded text-black"}
          onClick={() => {router.push("/seller");setactivetab("seller");localStorage.setItem("activetab","seller")}}
        >
          Seller
        </button>

        <button
          className={activetab!="customer"?`w-full text-left px-4  hover:bg-gray-700 rounded`:"w-full text-left px-4  hover:bg-gray-200 bg-gray-300 rounded text-black"}
          onClick={() => {router.push("/customer");setactivetab("customer");localStorage.setItem("activetab","customer")}}
        >
          Customer
        </button>
        <button
          className={activetab!="rcompany"?`w-full text-left px-4  hover:bg-gray-700 rounded`:"w-full text-left px-4  hover:bg-gray-200 bg-gray-300 rounded text-black"}
          onClick={() => {router.push("/reports/companyreport");setactivetab("rcompany");localStorage.setItem("activetab","rcompany")}}
        >
          Company report
        </button>
        <button
          className={activetab!="rseller"?`w-full text-left px-4  hover:bg-gray-700 rounded`:"w-full text-left px-4  hover:bg-gray-200 bg-gray-300 rounded text-black"}
          onClick={() => {router.push("/reports/sellerreports");setactivetab("rseller");localStorage.setItem("activetab","rseller")}}
        >
          Seller Report
        </button>
      </div>

      <div className="mt-auto pt-4">
        <button
          className="w-full bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition"
          onClick={() => {
            localStorage.removeItem("user_type");
            localStorage.removeItem("company_id");
            localStorage.removeItem("user_id");
            router.push("/");
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
