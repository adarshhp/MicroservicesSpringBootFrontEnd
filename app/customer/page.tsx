/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

const CustomerWarrantyPage = () => {
  const [activeTab, setActiveTab] = useState<"registered" | "requests">("registered");
  const [registered, setRegistered] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [modelData, setModelData] = useState<any>(null);
  const [modelValid, setModelValid] = useState(false);
console.log(modelData)
  const customerId = Number(localStorage.getItem("user_id"));

  const registerForm = useForm();
  const requestForm = useForm();

  const fetchRegistered = async () => {
    const res = await axios.get(`http://localhost:4089/warranty-requests-customer?customerId=${customerId}`);
    setRegistered(res.data || []);
  };

  const fetchRequests = async () => {
    const res = await axios.get(`http://localhost:4089/raised-warranty-requests-customer?userId=${customerId}`);
    setRequests(res.data || []);
  };

  useEffect(() => {
    if (customerId) {
      fetchRegistered();
      fetchRequests();
    }
  }, [customerId]);

  const fetchModelDetails = async (modelNo: string) => {
    try {
      const res = await axios.get(`http://localhost:1089/getProductDetailsByModelNo?Model_no=${modelNo}`);
      if (res.data && res.data.model_no) {
        setModelData(res.data);
        requestForm.setValue("company_id", res.data.company_id);
        requestForm.setValue("image", res.data.product_image);
        requestForm.setValue("purchase_date", res.data.man_date);
        setModelValid(true);
      } else {
        alert("Invalid model number");
        setModelValid(false);
      }
    } catch {
      alert("Model number fetch failed");
      setModelValid(false);
    }
  };

  const handleRegisterSubmit = async (data: any) => {
    const payload = { ...data, customerId };
    try {
      await axios.post("http://localhost:4089/register-warranty", payload);
      setShowRegisterForm(false);
      registerForm.reset();
      fetchRegistered();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleRequestSubmit = async (data: any) => {
    if (!modelValid) {
      alert("Please validate model number first");
      return;
    }
    const payload = { ...data, customer_id: customerId, request_date: new Date().toISOString().split("T")[0] };
    try {
      await axios.post("http://localhost:4089/raise-warranty-request", payload);
      setShowRequestForm(false);
      requestForm.reset();
      setModelData(null);
      setModelValid(false);
      fetchRequests();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="p-6 min-w-screen bg-gray-50 min-h-screen text-black">
      <div className="flex justify-between items-center mb-6">
        <div className="space-x-4">
          <button
            className={`px-4 py-2 rounded ${activeTab === "registered" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            onClick={() => setActiveTab("registered")}
          >
            Registered Products
          </button>
          <button
            className={`px-4 py-2 rounded ${activeTab === "requests" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            onClick={() => setActiveTab("requests")}
          >
            Warranty Requests
          </button>
        </div>
        {activeTab === "registered" ? (
          <button
            onClick={() => {
              registerForm.reset();
              setShowRegisterForm(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            + Register Product
          </button>
        ) : (
          <button
            onClick={() => {
              requestForm.reset();
              setModelValid(false);
              setShowRequestForm(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            + Raise Request
          </button>
        )}
      </div>

      {activeTab === "registered" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {registered.map((item) => (
            <div key={item.purchase_Id} className="bg-white border rounded p-4 shadow">
              <p><strong>Model:</strong> {item.model_no}</p>
              <p>Purchase Date: {item.purchase_date}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "requests" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((req) => (
            <div key={req.warranty_request_id} className="bg-white border rounded p-4 shadow">
              <p><strong>Model:</strong> {req.model_no}</p>
              <p>Name: {req.customer_name}</p>
              <p>Email: {req.customer_email}</p>
              <p>Status: {req.warranty_status === 1 ? "Pending" : "Resolved"}</p>
            </div>
          ))}
        </div>
      )}

      {/* Register Form */}
      {showRegisterForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Register Product</h3>
            <form onSubmit={registerForm.handleSubmit(handleRegisterSubmit)} className="space-y-4">
              <input {...registerForm.register("model_no")} placeholder="Model No" required className="p-2 border w-full rounded" />
              <input {...registerForm.register("purchase_date")} type="date" required className="p-2 border w-full rounded" />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">Submit</button>
            </form>
          </div>
        </div>
      )}

      {/* Raise Request Form */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Raise Warranty Request</h3>
            <form onSubmit={requestForm.handleSubmit(handleRequestSubmit)} className="space-y-3">
              <div className="flex gap-2">
                <input {...requestForm.register("model_no")} placeholder="Model No" required className="p-2 border w-full rounded" />
                <button type="button" onClick={() => fetchModelDetails(requestForm.getValues("model_no"))} className="bg-blue-600 text-white px-3 rounded">Fetch</button>
              </div>
              <input {...requestForm.register("customer_name")} placeholder="Your Name" required className="p-2 border w-full rounded" />
              <input {...requestForm.register("customer_email")} placeholder="Your Email" required className="p-2 border w-full rounded" />
              <input {...requestForm.register("phone_number")} type="number" placeholder="Phone" required className="p-2 border w-full rounded" />
              <button
                type="submit"
                disabled={!modelValid}
                className={`w-full py-2 rounded ${modelValid ? "bg-green-600 text-white" : "bg-gray-400 text-white cursor-not-allowed"}`}
              >
                Submit Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerWarrantyPage;