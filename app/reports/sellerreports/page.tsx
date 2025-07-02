/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import DownloadIcon from "@/icons/page";
import * as XLSX from "xlsx";

const Page = () => {
  const [activeTab, setActiveTab] = useState<"inventory" | "purchases">(
    "inventory"
  );
  const [inventory, setInventory] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [productDetailsMap, setProductDetailsMap] = useState<
    Record<string, any>
  >({});
  const sellerId = Number(localStorage.getItem("seller_id"));
  const [categoryIds, setCategoryIds] = useState<number | "">("");
  const [modelNoss, setModelNos] = useState<string>("");
  const [warrantys, setWarrantys] = useState<number | "">("");
  const [modelnopurchase, setModelNoPurchase] = useState<string>("");

  const fetchInventory = async () => {
    const res = await axios.get(
      `http://localhost:3089/allinventory?Seller_Id=${sellerId}&categoryId=${categoryIds}&modelNo=${modelNoss}&warranty=${
        warrantys == 0 ? "" : warrantys
      }`
    );
    const data = res.data || [];
    setInventory(data);
    enrichWithProductDetails(data.map((i: any) => i.model_no));
  };

  const fetchPurchases = async () => {
    const res = await axios.get(
      `http://localhost:3089/GetPurchases?Seller_Id=${sellerId}&modelNo=${modelnopurchase}`
    );
    const data = res.data || [];
    setPurchases(data);
    enrichWithProductDetails(data.map((p: any) => p.modelNo));
  };

  const enrichWithProductDetails = async (modelNos: string[]) => {
    const unique = [...new Set(modelNos)].filter(Boolean);
    if (unique.length === 0) return;
    try {
      const prodRes = await axios.post(
        "http://localhost:1089/products/by-models",
        unique
      );
      const map: Record<string, any> = {};
      prodRes.data.forEach((prod: any) => {
        map[prod.model_no] = prod;
      });
      setProductDetailsMap((prev) => ({ ...prev, ...map }));
    } catch (err) {
      console.error("Error fetching product details:", err);
    }
  };

  useEffect(() => {
    if (sellerId) {
      fetchInventory();
      fetchPurchases();
    }
  }, [sellerId]);


const handleDownload = () => {
  const data = activeTab === "inventory" ? inventory : purchases;

  if (!data || data.length === 0) {
    alert("No data available to download");
    return;
  }

  // Step 1: Map raw keys to user-friendly labels
  const keyLabelMap: Record<string, string> = {
    sale_id: "Sale ID",
    purchase_id: "Purchase ID",
    model_no: "Model No",
    modelNo: "Model No",
    name: "Customer Name",
    email: "Email",
    phono: "Phone",
    price: "Price (₹)",
    warranty: "Warranty (months)",
    warrany_tenure: "Warranty (years)",
    purchase_date: "Purchase Date",
    man_date: "Manufactured Date",
    seller_id: "Seller ID",
    customer_email: "Customer Email",
    phone_number: "Phone",
    customer_name: "Customer Name",
    request_date: "Request Date",
    warranty_status: "Status",
  };

  // Step 2: Remove unwanted fields
  const excludedKeys = ["is_deleted", "image", "product_image"];
  const filteredKeys = Object.keys(data[0]).filter(
    (key) => !excludedKeys.includes(key)
  );

  // Step 3: Build the formatted row data
  const formattedData = data.map((row) => {
    const newRow: Record<string, any> = {};
    filteredKeys.forEach((key) => {
      const label = keyLabelMap[key] || key;
      newRow[label] = row[key];
    });
    return newRow;
  });

  // Step 4: Create worksheet and auto-fit column widths
  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // Auto-adjust column widths
  const colWidths = filteredKeys.map((key) => {
    const maxLength = Math.max(
      keyLabelMap[key]?.length || key.length,
      ...data.map((row) => (row[key] ? row[key].toString().length : 0))
    );
    return { wch: maxLength + 4 };
  });
  worksheet["!cols"] = colWidths;

  // Step 5: Create workbook and export
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
  XLSX.writeFile(workbook, `report_${activeTab}.xlsx`);
};


  return (
    <div className="p-6 min-w-sc mx-auto space-y-6 bg-white h-full text-gray-900">
      <div className="w-full flex justify-center">
  <h1 className="text-4xl font-bold text-center text-gray-900 flex flex-row">Reports<p className="flex items-center justify-center" onClick={()=>handleDownload()}><DownloadIcon/></p></h1>
</div>
  {/* Tabs */}
  <div className="flex justify-between items-center mb-6">
    <div className="space-x-4">
      <button
        onClick={() => setActiveTab("inventory")}
        className={`px-5 py-2 rounded-full font-medium transition ${
          activeTab === "inventory"
            ? "bg-gray-900 text-white shadow"
            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
        }`}
      >
        Inventory
      </button>
      <button
        onClick={() => setActiveTab("purchases")}
        className={`px-5 py-2 rounded-full font-medium transition ${
          activeTab === "purchases"
            ? "bg-gray-900 text-white shadow"
            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
        }`}
      >
        Sold Items
      </button>
    </div>

    {/* Filters and Add Buttons */}
    <div>
      <span>
        {activeTab === "inventory" ? (
          <div className="flex justify-between items-center">
            <span className="flex flex-wrap items-center gap-2 text-sm">
              <input
                type="text"
                placeholder="Model No"
                className="p-1.5 border border-gray-300 rounded-md w-36"
                value={modelNoss}
                onChange={(e) => setModelNos(e.target.value)}
              />
              <input
                type="number"
                min={0}
                placeholder="Warranty"
                className="p-1.5 border border-gray-300 rounded-md w-28"
                value={warrantys || ""}
                onChange={(e) =>
                  setWarrantys(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              />
              <select
                onChange={(e) =>
                  setCategoryIds(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                value={categoryIds || ""}
                className="p-1.5 border border-gray-300 rounded-md w-36"
              >
                <option value="">Select Category</option>
                <option value="1">Electronics</option>
                <option value="2">Plastic</option>
                <option value="3">Wood</option>
                <option value="4">Metal</option>
              </select>
              <button
                onClick={fetchInventory}
                className="bg-gray-900 hover:bg-gray-700 text-white px-4 py-1.5 rounded-md shadow-sm text-sm"
              >
                Search
              </button>
            </span>
          </div>
        ) : (
          <div className="flex justify-between items-center gap-2">
            <input
              type="text"
              placeholder="Model No"
              className="p-1.5 border border-gray-300 rounded-md w-36"
              value={modelnopurchase}
              onChange={(e) => setModelNoPurchase(e.target.value)}
            />
            <button
              onClick={fetchPurchases}
              className="bg-gray-900 hover:bg-gray-700 text-white px-4 py-1.5 rounded-md shadow-sm text-sm"
            >
              Search
            </button>
          </div>
        )}
      </span>
    </div>
  </div>

  {/* Inventory List */}
 {activeTab === "inventory" && (
  <div className="overflow-x-auto">
    <table className="min-w-full border border-gray-300 text-sm">
      <thead className="bg-gray-100 text-gray-900">
        <tr>
          <th className="p-2 border">Sl No</th>
          <th className="p-2 border">Model No</th>
          <th className="p-2 border">Price</th>
          <th className="p-2 border">Warranty (months)</th>
          <th className="p-2 border">Purchase Date</th>
          <th className="p-2 border">Item Status</th>
          <th className="p-2 border">Product Name</th>
          <th className="p-2 border">Tenure (years)</th>
          <th className="p-2 border">Mfg Date</th>
        </tr>
      </thead>
      <tbody>
        {inventory.map((item,index) => {
          const prod = productDetailsMap[item.model_no] || {};
          return (
            <tr key={index+1} className="text-center hover:bg-gray-50">
              <td className="p-2 border">{item.purchase_id}</td>
              <td className="p-2 border">{item.model_no}</td>
              <td className="p-2 border">₹{item.price}</td>
              <td className="p-2 border">{item.warranty}</td>
              <td className="p-2 border">{item.purchase_date}</td>
              <td className="p-2 border">
                {prod.holderStatus === 2
                  ? "Item Available"
                  : prod.holderStatus === 3
                  ? "Out of Stock"
                  : prod.holderStatus === 4
                  ? "Item Purchased"
                  : prod.holderStatus === 1
                  ? "Product Shipped"
                  : "No Data"}
              </td>
              <td className="p-2 border">{prod.product_name || "-"}</td>
              <td className="p-2 border">{prod.warrany_tenure || "-"}</td>
              <td className="p-2 border">{prod.man_date || "-"}</td>
    
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
)}


  {/* Purchases List */}
{activeTab === "purchases" && (
  <div className="overflow-x-auto">
    <table className="min-w-full border border-gray-300 text-sm">
      <thead className="bg-gray-100 text-gray-900">
        <tr>
          <th className="p-2 border">Sl.No</th>
          <th className="p-2 border">Customer Name</th>
          <th className="p-2 border">Model No</th>
          <th className="p-2 border">Price</th>
          <th className="p-2 border">Purchase Date</th>
          <th className="p-2 border">Product Name</th>
          <th className="p-2 border">Warranty Years</th>
          <th className="p-2 border">Mfg Date</th>
          <th className="p-2 border">Item Status</th>
        </tr>
      </thead>
      <tbody>
        {purchases.map((purchase,index) => {
          const prod = productDetailsMap[purchase.modelNo] || {};
          return (
            <tr key={purchase.sale_id} className="text-center hover:bg-gray-50">
              <td className="p-2 border">{index + 1}</td>
              <td className="p-2 border">{purchase.name}</td>
              <td className="p-2 border">{purchase.modelNo}</td>
              <td className="p-2 border">₹{purchase.price}</td>
              <td className="p-2 border">{purchase.purchase_date}</td>
              <td className="p-2 border">{prod.product_name || "-"}</td>
              <td className="p-2 border">{prod.warrany_tenure || "-"}</td>
              <td className="p-2 border">{prod.man_date || "-"}</td>
              <td className="p-2 border text-gray-700 font-medium">
                {prod.holderStatus === 4
                  ? "Apply for warranty"
                  : "Requested for warranty"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
)}

</div>

  );
};

export default Page;
