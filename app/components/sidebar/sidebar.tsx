"use client";

import React from "react";
import { useRouter } from "next/navigation";

const Sidebar = () => {
  const router = useRouter();

const ff= localStorage.getItem("user_type");
console.log(ff,"user_type");


  return (
    <div className="w-64 min-h-screen bg-gray-900 text-white p-4 space-y-4">
      <h2 className="text-xl font-bold mb-6">Dashboard</h2>

      <button
        className="w-full text-left px-4 py-2 hover:bg-gray-700 rounded"
        onClick={() => router.push("/company")}
      >
        Company
      </button>

      <button
        className="w-full text-left px-4 py-2 hover:bg-gray-700 rounded"
        onClick={() => router.push("/seller")}
      >
        Seller
      </button>

      <button
        className="w-full text-left px-4 py-2 hover:bg-gray-700 rounded"
        onClick={() => router.push("/customer")}
      >
        Customer
      </button>
    </div>
  );
};

export default Sidebar;
