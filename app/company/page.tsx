"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

const categories = [
  { id: 1, name: "Electronics" },
  { id: 2, name: "Plastic" },
  { id: 3, name: "Wood" },
  { id: 4, name: "Metal" },
];

type Product = {
  product_price: number;
  product_name: string;
  model_no: string;
  company_id: number;
  warrany_tenure: number;
  man_date: string;
  product_image: string;
  product_category: number;
};

type WarrantyRequest = {
  warranty_request_id: number;
  customer_id: number;
  request_date: string;
  customer_name: string;
  customer_email: string;
  phone_number: number;
  model_no: string;
  purchase_date: string;
  warranty_status: number;
  image: string;
  company_id: number;
};

const Page = () => {
  const [activeTab, setActiveTab] = useState<"products" | "requests">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [requests, setRequests] = useState<WarrantyRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset } = useForm<Product>();
  const companyId = Number(localStorage.getItem("user_id"));

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`http://localhost:1089/getProducts?company_id=${companyId}`);
      setProducts(res.data || []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert("Error fetching products: " + error.message);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`http://localhost:4089/getraised-warranty-requests?company_id=${companyId}`);
      setRequests(res.data || []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert("Error fetching requests: " + error.message);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchProducts();
      fetchRequests();
    }
  }, [companyId]);

  const onSubmit = async (data: Product) => {
    try {
      const payload = {
        ...data,
        company_id: companyId,
      };

      await axios.post("http://localhost:1089/postproduct", payload);
      alert("Product added!");
      reset();
      setShowForm(false);
      fetchProducts();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert("Error adding product: " + error.message);
    }
  };

  return (
    <div className="p-6 bg-white text-black min-h-screen space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Company Product Dashboard</h2>
        <div className="space-x-2">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 rounded ${activeTab === "products" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2 rounded ${activeTab === "requests" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Warranty Requests
          </button>
          {activeTab === "products" && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              + Add Product
            </button>
          )}
        </div>
      </div>

      {/* Product List */}
      {activeTab === "products" && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {products.length === 0 ? (
            <p className="col-span-full text-gray-500">No products found.</p>
          ) : (
            products.map((product, index) => (
              <div key={index} className="border rounded-lg p-4 bg-white text-black shadow-sm">
                <p className="font-semibold">{product.product_name}</p>
                <p className="text-sm text-gray-600">Model: {product.model_no}</p>
                <p className="text-sm">₹{product.product_price}</p>
                <p className="text-sm">Warranty: {product.warrany_tenure} months</p>
                <p className="text-sm">Category: {categories.find(c => c.id === product.product_category)?.name || product.product_category}</p>
                <p className="text-xs text-gray-500">Mfg Date: {product.man_date}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Warranty Requests */}
      {activeTab === "requests" && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {requests.length === 0 ? (
            <p className="col-span-full text-gray-500">No warranty requests found.</p>
          ) : (
            requests.map((req) => (
              <div key={req.warranty_request_id} className="border rounded-lg p-4 bg-white text-black shadow-sm">
                <p className="font-semibold">{req.customer_name}</p>
                <p className="text-sm">Model: {req.model_no}</p>
                <p className="text-sm">Email: {req.customer_email}</p>
                <p className="text-sm">Phone: {req.phone_number}</p>
                <p className="text-sm">Request Date: {req.request_date}</p>
                <p className="text-sm">Status: {req.warranty_status === 1 ? "Pending" : req.warranty_status === 2 ? "In Progress" : "Resolved"}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Popover Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-gray-900 text-white p-6 rounded-lg w-full max-w-lg shadow-lg relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-2 right-3 text-white hover:text-red-400 text-xl"
            >
              ×
            </button>
            <h3 className="text-lg font-semibold mb-4">Add New Product</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <label>Product Name</label>
              <input {...register("product_name")} placeholder="Product Name" required className="w-full border px-3 py-2 rounded bg-white text-black" />
                              <label>Model No</label>

              <input {...register("model_no")} placeholder="Model No" required className="w-full border px-3 py-2 rounded bg-white text-black" />
              <label>Price</label>
              <input {...register("product_price")} type="number" placeholder="Price" required className="w-full border px-3 py-2 rounded bg-white text-black" />
              <label>Warranty Tenure(Months)</label>
              <input {...register("warrany_tenure")} type="number" placeholder="Warranty (months)" required className="w-full border px-3 py-2 rounded bg-white text-black" />
              <label>Manufacturing date</label>
              <input {...register("man_date")} type="date" placeholder="Manufacturing Date" required className="w-full border px-3 py-2 rounded bg-white text-black" />
              <label>Product Category</label>
              <select {...register("product_category")} className="w-full border px-3 py-2 rounded bg-white text-black" required>
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">
                Save Product
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
