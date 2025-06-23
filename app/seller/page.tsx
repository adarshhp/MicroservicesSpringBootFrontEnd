/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

const Page = () => {
  const [activeTab, setActiveTab] = useState<"inventory" | "purchases">("inventory");
  const [inventory, setInventory] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editingPurchase, setEditingPurchase] = useState<any | null>(null);
  const [inventoryModelValid, setInventoryModelValid] = useState(false);
  const [purchaseModelValid, setPurchaseModelValid] = useState(false);

  const sellerId = Number(localStorage.getItem("seller_id"));

  const inventoryForm = useForm();
  const purchaseForm = useForm();

  const fetchInventory = async () => {
    const res = await axios.get(`http://localhost:3089/allinventory?Seller_Id=${sellerId}`);
    setInventory(res.data || []);
  };

  const fetchPurchases = async () => {
    const res = await axios.get(`http://localhost:3089/GetPurchases?Seller_Id=${sellerId}`);
    setPurchases(res.data || []);
  };

  useEffect(() => {
    if (sellerId) {
      fetchInventory();
      fetchPurchases();
    }
  }, [sellerId]);

  const fetchModelDetails = async (modelNo: string, formType: "inventory" | "purchase") => {
    try {
      const res = await axios.get(`http://localhost:1089/getProductDetailsByModelNo?Model_no=${modelNo}`);
      const product = res.data;

      if (!product || Object.keys(product).length === 0) {
        alert("Model number not found. Please enter a valid model number.");
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        formType === "inventory" ? setInventoryModelValid(false) : setPurchaseModelValid(false);
        return;
      }

      if (formType === "inventory") {
        inventoryForm.setValue("price", product.product_price);
        inventoryForm.setValue("warranty", product.warrany_tenure);
        inventoryForm.setValue("company_id", product.company_id);
        inventoryForm.setValue("image", product.product_image);
        inventoryForm.setValue("category_id", product.prod_id);
        inventoryForm.setValue("model_no", modelNo);
        setInventoryModelValid(true);
      } else {
        purchaseForm.setValue("price", product.product_price);
        purchaseForm.setValue("warranty", product.warrany_tenure);
        purchaseForm.setValue("modelNo", modelNo);
        setPurchaseModelValid(true);
      }
    } catch (err) {
      console.log(err);
      alert("Error fetching model details. Please check the model number.");
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      formType === "inventory" ? setInventoryModelValid(false) : setPurchaseModelValid(false);
    }
  };

  const handleInventorySubmit = async (data: any) => {
    if (!inventoryModelValid) {
      alert("Please fetch and validate a correct model number before submitting.");
      return;
    }

    const payload = {
      purchase_date: data.purchase_date,
      price: data.price,
      warranty: data.warranty,
      image: data.image || "default_image",
      seller_id: sellerId,
      is_deleted: 0,
      company_id: data.company_id,
      model_no: data.model_no,
      category_id: data.category_id,
    };

    try {
      if (editingItem) {
        await axios.put(`http://localhost:3089/editinventory?purchaseId=${editingItem.purchase_id}`, payload);
        setEditingItem(null);
      } else {
        await axios.post("http://localhost:3089/inventory", payload);
      }
      inventoryForm.reset();
      setShowInventoryForm(false);
      setInventoryModelValid(false);
      fetchInventory();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handlePurchaseSubmit = async (data: any) => {
    if (!purchaseModelValid) {
      alert("Please fetch and validate a correct model number before submitting.");
      return;
    }

    const payload: any = {
      customer_id: 0,
      modelNo: data.modelNo,
      purchase_date: data.purchase_date,
      seller_id: sellerId,
      is_deleted: 0,
      name: data.name,
      price: data.price,
      email: data.email,
      phono: Number(data.phono),
      warranty: data.warranty,
      image: "default_image",
    };

    try {
      if (editingPurchase) {
        await axios.put(`http://localhost:3089/editpurchase?sale_id=${editingPurchase.sale_id}`, payload);
        setEditingPurchase(null);
      } else {
        await axios.post("http://localhost:3089/purchase", payload);
      }
      purchaseForm.reset();
      setShowPurchaseForm(false);
      setPurchaseModelValid(false);
      fetchPurchases();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const deleteInventory = async (id: number) => {
    await axios.post(`http://localhost:3089/deleteinventory?purchase_id=${id}`);
    fetchInventory();
  };

  const deletePurchase = async (id: number) => {
    await axios.get(`http://localhost:3089/deletepurchase?sale_id=${id}`);
    fetchPurchases();
  };

  return (
    <div className="p-6 min-w-sc mx-auto space-y-6 bg-gray-50 min-h-screen text-black">
      {/* Tabs */}
      <div className="flex justify-between items-center mb-4">
        <div className="space-x-4">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-4 py-2 rounded ${activeTab === "inventory" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Inventory
          </button>
          <button
            onClick={() => setActiveTab("purchases")}
            className={`px-4 py-2 rounded ${activeTab === "purchases" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Purchases
          </button>
        </div>
        {activeTab === "inventory" ? (
          <button
            onClick={() => {
              setEditingItem(null);
              inventoryForm.reset();
              setInventoryModelValid(false);
              setShowInventoryForm(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            + Add Item
          </button>
        ) : (
          <button
            onClick={() => {
              setEditingPurchase(null);
              purchaseForm.reset();
              setPurchaseModelValid(false);
              setShowPurchaseForm(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            + Add Purchase
          </button>
        )}
      </div>

      {/* Inventory List */}
      {activeTab === "inventory" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventory.map((item) => (
            <div key={item.purchase_id} className="bg-white border rounded p-4 shadow text-black">
              <p><strong>Model:</strong> {item.model_no}</p>
              <p>Price: ₹{item.price}</p>
              <p>Warranty: {item.warranty} months</p>
              <p>Date: {item.purchase_date}</p>
              <div className="space-x-2 mt-2">
                <button onClick={() => { setEditingItem(item); inventoryForm.reset(item); setInventoryModelValid(true); setShowInventoryForm(true); }} className="text-blue-600">Edit</button>
                <button onClick={() => deleteInventory(item.purchase_id)} className="text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Purchases List */}
      {activeTab === "purchases" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {purchases.map((purchase) => (
            <div key={purchase.sale_id} className="bg-white border rounded p-4 shadow text-black">
              <p><strong>Customer:</strong> {purchase.name}</p>
              <p>Model: {purchase.modelNo}</p>
              <p>Price: ₹{purchase.price}</p>
              <p>Date: {purchase.purchase_date}</p>
              <div className="space-x-2 mt-2">
                <button onClick={() => { setEditingPurchase(purchase); purchaseForm.reset(purchase); setPurchaseModelValid(true); setShowPurchaseForm(true); }} className="text-blue-600">Edit</button>
                <button onClick={() => deletePurchase(purchase.sale_id)} className="text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inventory Form */}
    {showInventoryForm && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow-lg w-full max-w-xl relative text-black">
      <button
        onClick={() => setShowInventoryForm(false)}
        className="absolute top-2 right-3 text-xl text-gray-500 hover:text-red-500"
      >
        ×
      </button>
      <h3 className="text-lg font-semibold mb-4">
        {editingItem ? "Edit Inventory" : "Add Inventory"}
      </h3>
      <form
        onSubmit={inventoryForm.handleSubmit(handleInventorySubmit)}
        className="grid grid-cols-2 gap-4"
      >
        <div className="col-span-2 flex gap-2">
          <input
            {...inventoryForm.register("model_no")}
            placeholder="Model No"
            required
            className="p-2 border rounded w-full"
          />
          <button
            type="button"
            onClick={() =>
              fetchModelDetails(inventoryForm.getValues("model_no"), "inventory")
            }
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Fetch
          </button>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Price</label>
          <input
            {...inventoryForm.register("price")}
            type="number"
            placeholder="Price"
            required
            className="p-2 border rounded w-full"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Warranty (Months)</label>
          <input
            {...inventoryForm.register("warranty")}
            type="number"
            placeholder="Warranty"
            required
            className="p-2 border rounded w-full"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Purchase Date</label>
          <input
            {...inventoryForm.register("purchase_date")}
            type="date"
            required
            className="p-2 border rounded w-full"
          />
        </div>

        <div className="col-span-2">
          <button
            type="submit"
            disabled={!inventoryModelValid}
            className={`w-full py-2 rounded ${
              inventoryModelValid
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-400 text-white cursor-not-allowed"
            }`}
          >
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
)}


      {/* Purchase Form */}
      {showPurchaseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-xl relative text-black">
            <button onClick={() => setShowPurchaseForm(false)} className="absolute top-2 right-3 text-xl text-gray-500">×</button>
            <h3 className="text-lg font-semibold mb-4">{editingPurchase ? "Edit Purchase" : "Add Purchase"}</h3>
           <form onSubmit={purchaseForm.handleSubmit(handlePurchaseSubmit)} className="grid grid-cols-2 gap-4">
  <div className="col-span-2 flex gap-2">
    <div className="w-full">
      <label className="block mb-1 text-sm font-medium">Model No</label>
      <input {...purchaseForm.register("modelNo")} placeholder="Model No" required className="p-2 border rounded w-full" />
    </div>
    <button
      type="button"
      onClick={() => fetchModelDetails(purchaseForm.getValues("modelNo"), "purchase")}
      className="bg-blue-600 text-white px-3 py-1 rounded self-end h-10"
    >
      Fetch
    </button>
  </div>

  <div>
    <label className="block mb-1 text-sm font-medium">Purchase Date</label>
    <input {...purchaseForm.register("purchase_date")} type="date" required className="p-2 border rounded w-full" />
  </div>

  <div>
    <label className="block mb-1 text-sm font-medium">Price</label>
    <input {...purchaseForm.register("price")} type="number" placeholder="Price" required className="p-2 border rounded w-full" />
  </div>

  <div>
    <label className="block mb-1 text-sm font-medium">Warranty</label>
    <input {...purchaseForm.register("warranty")} type="number" placeholder="Warranty" required className="p-2 border rounded w-full" />
  </div>

  <div>
    <label className="block mb-1 text-sm font-medium">Customer Name</label>
    <input {...purchaseForm.register("name")} placeholder="Customer Name" required className="p-2 border rounded w-full" />
  </div>

  <div>
    <label className="block mb-1 text-sm font-medium">Email</label>
    <input {...purchaseForm.register("email")} placeholder="Email" required className="p-2 border rounded w-full" />
  </div>

  <div>
    <label className="block mb-1 text-sm font-medium">Phone</label>
    <input {...purchaseForm.register("phono")} type="number" placeholder="Phone" required className="p-2 border rounded w-full" />
  </div>

  <div className="col-span-2">
    <button
      type="submit"
      disabled={!purchaseModelValid}
      className={`w-full py-2 rounded ${
        purchaseModelValid ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-400 text-white cursor-not-allowed"
      }`}
    >
      Save
    </button>
  </div>
</form>

          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
