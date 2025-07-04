/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
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
  image: FileList;
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
  const [activeTab, setActiveTab] = useState<"products" | "requests">(
    "products"
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [requests, setRequests] = useState<WarrantyRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [holderStatus, setHolderStatus] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [modelNo, setModelNo] = useState("");

  const { register, handleSubmit, reset } = useForm<Product>();
  const [astatus, setAstatus] = useState("");
  const [amodelNo, setAmodelNo] = useState("");
  const companyId = Number(localStorage.getItem("company_id"));

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:1089/getProducts", {
        params: {
          company_id: companyId,
          holderStatus,
          productCategory,
          ModelNo: modelNo,
          page: 0,
          size: 1000,
        },
      });
      setProducts(res.data.content || []);
    } catch (error: any) {
      alert("Error fetching products: " + error.message);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        `http://localhost:4089/getraised-warranty-requests?company_id=${companyId}&status=${astatus}&modelNo=${amodelNo}&page=0&size=1000`
      );
      setRequests(res.data.content || []);
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
    const file = data.image[0]; // data.image is a FileList
    const base64Image = await convertToBase64(file);
    try {
      const payload = {
        product_category: data.product_category,
        man_date: "2025-07-01",
        product_name: data.product_name,
        product_image: base64Image,
        product_price: Number(data.product_price),
        warrany_tenure: Number(data.warrany_tenure),
        model_no: data.model_no,
        company_id: companyId,
      };

      await axios.post("http://localhost:1089/postproduct", payload);
      alert("Product added!");
      reset();
      setShowForm(false);
      fetchProducts();
    } catch (error: any) {
      alert("Error adding product: " + error.message);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleStatusChange = (status: any, requestid: any) => {
    axios
      .get(
        `http://localhost:4089/warranty-action?purchase_id=${requestid}&status=${status}`
      )
      .then((response) => {
        if (response?.status == 200) {
          fetchRequests();
        }
      });
  };

  return (
    <div className="p-6 bg-white h-full text-black space-y-8">
      <div className="relative flex justify-center items-center">
        <h1 className="text-4xl font-bold text-gray-900">Company Dashboard</h1>

        {activeTab === "products" && (
          <div className="absolute right-0">
            <button
              onClick={() => setShowForm(true)}
              className="bg-gray-900 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              + Add Product
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <div className="space-x-4">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-6 py-2 rounded-lg font-medium ${
              activeTab === "products"
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-6 py-2 rounded-lg font-medium ${
              activeTab === "requests"
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            Warranty Requests
          </button>
        </div>

        {activeTab === "requests" && (
          <div className="flex flex-wrap items-center gap-3 p-3 rounded-md shadow-sm text-sm">
            <input
              type="text"
              onChange={(e) => setAmodelNo(e.target.value)}
              placeholder="Model No"
              className=" text-gray-900 placeholder-gray-900 border border-gray-700 rounded px-3 py-1.5 w-48 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />

            <select
              value={astatus}
              onChange={(e) => setAstatus(e.target.value)}
              className=" text-gray-900 border placeholder-gray-900 border-gray-700 rounded px-3 py-1.5 w-40 focus:outline-none focus:ring-1 focus:ring-gray-500"
            >
              <option value="">All Statuses</option>
              <option value="1">Pending</option>
              <option value="2">Approved</option>
              <option value="3">Rejected</option>
            </select>

            <button
              onClick={fetchRequests}
              className="bg-gray-900 text-gray-100 px-4 py-1.5 rounded hover:bg-gray-800 transition"
            >
              Search
            </button>
          </div>
        )}

        {activeTab === "products" && (
          <div>
            <div className="flex flex-wrap items-center gap-3 p-3 rounded-md shadow-sm text-sm">
              <input
                type="text"
                onChange={(e) => setModelNo(e.target.value)}
                placeholder="Model No"
                className="text-gray-900 placeholder-gray-900 border border-gray-700 rounded px-3 py-1.5 w-48 focus:outline-none focus:ring-1 focus:ring-gray-500"
              />

              <select
                value={holderStatus}
                onChange={(e) => setHolderStatus(e.target.value)}
                className="text-gray-900 border placeholder-gray-900 border-gray-700 rounded px-3 py-1.5 w-40 focus:outline-none focus:ring-1 focus:ring-gray-500"
              >
                <option value="">All Product Status</option>
                <option value="1">In Company Stocks</option>
                <option value="2">With Retail Seller</option>
                <option value="3">Sold To Customer</option>
                <option value="4">With Customer</option>
                <option value="5">Raised Warranty Request</option>
              </select>

              <select
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
                className="text-gray-900 border placeholder-gray-900 border-gray-700 rounded px-3 py-1.5 w-40 focus:outline-none focus:ring-1 focus:ring-gray-500"
              >
                <option value="">All Categories</option>
                <option value="1">Electronics</option>
                <option value="2">Plastic</option>
                <option value="3">Wood</option>
                <option value="4">Metal</option>
              </select>

              <button
                onClick={() => {
                  fetchProducts();
                }}
                className="bg-gray-900 text-gray-100 px-4 py-1.5 rounded hover:bg-gray-800 transition"
              >
                Search
              </button>
            </div>
          </div>
        )}
      </div>

     {previewImage && (
  <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
    <div className="bg-white p-4 rounded-lg shadow-lg relative">
      <button
        onClick={() => setPreviewImage(null)}
        className="absolute top-1 right-2 text-xl text-gray-500 hover:text-gray-700"
      >
        ×
      </button>
      <div className="relative w-[80vw] h-[80vh] max-w-[600px] max-h-[600px]">
        <Image
          src={previewImage}
          alt="Product Preview"
          fill
          className="object-contain rounded"
        />
      </div>
    </div>
  </div>
)}


      {/* Products Tab */}
      {activeTab === "products" && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {products.length === 0 ? (
            <p className="col-span-full text-gray-500">No products found.</p>
          ) : (
            products.map((product, index) => (
              <div
                key={index}
                className="bg-white shadow-md rounded-xl p-5 space-y-2 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  {product.product_name}
                </h2>
                <button
  onClick={() => setPreviewImage(product.product_image)}
  className="text-blue-600 underline text-sm hover:text-blue-800 transition"
>
  View Image
</button></div>
                <p className="text-sm text-gray-600">
                  Model: {product.model_no}
                </p>
                <p className="text-sm text-gray-800 font-medium">
                  ₹{product.product_price}
                </p>
                <p className="text-sm">
                  Warranty: {product.warrany_tenure} months
                </p>
                <p className="text-sm">
                  Category:{" "}
                  {product.product_category == 1
                    ? "Electronics"
                    : product.product_category == 2
                    ? "Plastic"
                    : product.product_category == 3
                    ? "Wood"
                    : product.product_category == 4
                    ? "Metal"
                    : "Unknown"}
                </p>
               

                <p className="text-xs text-gray-500">
                  Mfg Date: {product.man_date}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Warranty Requests Tab */}
      {activeTab === "requests" && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {requests.length === 0 ? (
            <p className="col-span-full text-gray-500">
              No warranty requests found.
            </p>
          ) : (
            requests.map((req) => (
              <div
                key={req.warranty_request_id}
                className="bg-white shadow-md rounded-xl p-5 space-y-2 border border-gray-200"
              >
                <h2 className="text-lg font-semibold text-gray-900">
                  {req.customer_name}
                </h2>

                <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-600">Model: {req.model_no}</p>
                <button
  onClick={() => setPreviewImage(req.image)}
  className="text-blue-600 underline text-sm hover:text-blue-800 transition"
>
  View Image
</button>
</div>
                <p className="text-sm">Email: {req.customer_email}</p>
                <p className="text-sm">Phone: {req.phone_number}</p>
                <p className="text-sm">Request Date: {req.request_date}</p>
                <p className="text-sm font-medium text-gray-700">
                  Status:{" "}
                  {req.warranty_status === 1
                    ? "Pending"
                    : req.warranty_status === 2
                    ? "Approved"
                    : "Rejected"}
                </p>
                <select
                  value={req.warranty_status}
                  onChange={(e) =>
                    handleStatusChange(e.target.value, req.warranty_request_id)
                  }
                  className={`w-full border px-3 py-2 rounded-lg mt-2 font-semibold ${
                    req.warranty_status === 1
                      ? "text-yellow-500"
                      : req.warranty_status === 2
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  <option value="1" disabled>
                    Pending
                  </option>
                  <option value="2">Approve</option>
                  <option value="3">Reject</option>
                </select>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 px-4">
          <div className="bg-white text-black p-6 rounded-lg w-full max-w-xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
            <h3 className="text-2xl font-semibold mb-5 text-center text-gray-900">
              Add New Product
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block mb-1 text-gray-700">Product Name</label>
                <input
                  {...register("product_name")}
                  required
                  className="w-full border px-4 py-2 rounded-lg"
                  placeholder="Product Name"
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-700">
                  Product Category
                </label>
                <select
                  {...register("product_category")}
                  required
                  className="w-full border px-4 py-2 rounded-lg"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-gray-700">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  {...register("image", { required: true })}
                  className="w-full border px-4 py-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-700">Model No</label>
                <input
                  {...register("model_no")}
                  required
                  className="w-full border px-4 py-2 rounded-lg"
                  placeholder="Model Number"
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-700">Price</label>
                <input
                  {...register("product_price")}
                  type="number"
                  min="0"
                  required
                  className="w-full border px-4 py-2 rounded-lg"
                  placeholder="Price"
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-700">
                  Warranty Tenure (Months)
                </label>
                <input
                  {...register("warrany_tenure")}
                  type="number"
                  min="0"
                  required
                  className="w-full border px-4 py-2 rounded-lg"
                  placeholder="Warranty Tenure"
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-700">
                  Manufacturing Date
                </label>
                <input
                  {...register("man_date")}
                  type="date"
                  required
                  className="w-full border px-4 py-2 rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="bg-gray-900 text-white px-6 py-2 rounded-lg w-full hover:bg-gray-700 transition"
              >
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
