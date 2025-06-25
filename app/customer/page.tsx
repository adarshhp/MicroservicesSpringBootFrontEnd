/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";

const CustomerWarrantyPage = () => {
  const [activeTab, setActiveTab] = useState<"registered" | "requests">("registered");
  const [registered, setRegistered] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [productDetailsMap, setProductDetailsMap] = useState<Record<string, any>>({});
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [modelData, setModelData] = useState<any>(null);
  const [modelValid, setModelValid] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);

  const customerId = Number(localStorage.getItem("user_id"));

  const registerForm = useForm();
  const requestForm = useForm();
const router = useRouter();

  const fetchRegistered = async () => {
    const res = await axios.get(`http://localhost:4089/warranty-requests-customer?customerId=${customerId}`);
    const data = res.data || [];
    setRegistered(data);

    const modelNos = [...new Set(data.map((item: any) => item.model_no))];
    if (modelNos.length > 0) {
      try {
        const prodRes = await axios.post("http://localhost:1089/products/by-models", modelNos);
        const productMap: Record<string, any> = {};
        prodRes.data.forEach((prod: any) => {
          productMap[prod.model_no] = prod;
        });
        setProductDetailsMap((prev) => ({ ...prev, ...productMap }));
      } catch (error) {
        console.error("Failed to fetch product details for registered:", error);
      }
    }
  };

  const fetchRequests = async () => {
    const res = await axios.get(`http://localhost:4089/raised-warranty-requests-customer?userId=${customerId}`);
    const data = res.data || [];
    setRequests(data);

    const modelNos = [...new Set(data.map((req: any) => req.model_no))];
    if (modelNos.length > 0) {
      try {
        const prodRes = await axios.post("http://localhost:1089/products/by-models", modelNos);
        const productMap: Record<string, any> = {};
        prodRes.data.forEach((prod: any) => {
          productMap[prod.model_no] = prod;
        });
        setProductDetailsMap((prev) => ({ ...prev, ...productMap }));
      } catch (error) {
        console.error("Failed to fetch product details for requests:", error);
      }
    }
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

  const handleEdit = (item: any) => {
    setEditItem(item);
    registerForm.setValue("model_no", item.model_no);
    registerForm.setValue("purchase_date", item.purchase_date);
    setShowRegisterForm(true);
  };

  const handleDelete = async (purchaseId: number) => {
    try {
      const res = await axios.post(`http://localhost:4089/delete-registered-warranty?purchase_Id=${purchaseId}`);
      if (res.data?.message === "Cant Delete") {
        alert("Cannot delete this warranty");
      } else {
        fetchRegistered();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleRegisterSubmit = async (data: any) => {
    const payload = { ...data, customerId };
    if (editItem) {
      try {
        await axios.post(`http://localhost:4089/editregistered-warranty?purchase_Id=${editItem.purchase_Id}`, payload);
        setShowRegisterForm(false);
        setEditItem(null);
        registerForm.reset();
        fetchRegistered();
      } catch (err: any) {
        alert(err.response?.data?.message || err.message);
      }
    } else {
      try {
 await axios
          .get(
            `http://localhost:1089/checkeligibility?Model_no=${data.model_no}&checkvalue=4`
          )
          .then((response) => {
if(response.data === true) {
         axios.post("http://localhost:4089/register-warranty", payload).then((response)=>{
          if (response.status === 200) {
                     axios.post(`http://localhost:1089/changeholderstatus?Model_no=${data.model_no}&status=4`)
            return;
          }
        })
        setShowRegisterForm(false);
        registerForm.reset();
        fetchRegistered();
      }else{
alert("You are not eligible to register this product. Please contact support.");
      }

      })


      } catch (err: any) {
        alert(err.response?.data?.message || err.message);
      }
    }
  };

const handleRequestSubmit = async (data: any) => {
  if (!modelValid) {
    alert("Please validate model number first");
    return;
  }

  const payload = {
    ...data,
    customer_id: customerId,
    request_date: new Date().toISOString().split("T")[0]
  };

  try {
    const eligibilityResponse = await axios.get(
      `http://localhost:1089/checkeligibility?Model_no=${data.model_no}&checkvalue=5`
    );

    if (eligibilityResponse.data === true) {
      const postResponse = await axios.post(
        "http://localhost:4089/raise-warranty-request",
        payload
      );

      if (postResponse.status === 200) {
        await axios.post(
          `http://localhost:1089/changeholderstatus?Model_no=${data.model_no}&status=5`
        );

        // Reset and fetch data only after successful post
        setShowRequestForm(false);
        requestForm.reset();
        setModelData(null);
        setModelValid(false);
        fetchRequests();
      }
    } else {
      alert("You are not eligible to raise a warranty request for this product. Please contact support.");
    }
  } catch (err: any) {
    alert(err.response?.data?.message || err.message);
  }
};
const handleRaiseReqeust = (purchaseId: number, modelNo: string) => {
setShowRequestForm(true);
requestForm.setValue("model_no", modelNo);  

}

  return (
    <div className="p-6 min-w-screen bg-gray-50 min-h-screen text-black">
                    <button className="bg-blue-500 fixed top-0 right-0 p-1 rounded-xl" onClick={()=>router.push("/")}>Logout</button>

      <h1 className="text-3xl font-bold pb-">Customer Dashboard</h1>
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
              setEditItem(null);
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
          {registered.map((item) => {
            const product = productDetailsMap[item.model_no] || {};
            return (
              <div key={item.purchase_Id} className="bg-indigo-100 border rounded p-4 shadow relative">
                <p><strong>Model:</strong> {item.model_no}</p>
                <p>Purchase Date: {item.purchase_date}</p>
                {product.product_name && (
                  <>
                    <hr className="my-2" />
                    <p><strong>Product Name:</strong> {product.product_name}</p>
                    <p><strong>Price:</strong> ₹{product.product_price}</p>
                    <p><strong>Warranty:</strong> {product.warrany_tenure} years</p>
                    <p><strong>Manufactured:</strong> {product.man_date}</p>
                  </>
                )}
                <div className="absolute top-2 right-2 space-x-2">
                  <button onClick={() => handleEdit(item)} className="text-blue-500">Edit</button>
                  <button onClick={() => handleDelete(item.purchase_Id)} className="text-red-500">Delete</button>
                  <button onClick={()=>handleRaiseReqeust(item.purchase_Id,item.model_no)} className="text-green-500">Request</button>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "requests" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((req) => {
            const product = productDetailsMap[req.model_no] || {};
            return (
              <div key={req.warranty_request_id} className="bg-indigo-100 border rounded p-4 shadow">
                <p><strong>Model:</strong> {req.model_no}</p>
                <p>Name: {req.customer_name}</p>
                <p>Email: {req.customer_email}</p>
                <p>Status: {req.warranty_status === 1 ? "Pending" : req.warranty_status === 2 ? "Approved" : "Rejected"}</p>
                {product.product_name && (
                  <>
                    <hr className="my-2" />
                    <p><strong>Product Name:</strong> {product.product_name}</p>
                    <p><strong>Price:</strong> ₹{product.product_price}</p>
                    <p><strong>Warranty:</strong> {product.warrany_tenure} years</p>
                    <p><strong>Manufactured:</strong> {product.man_date}</p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showRegisterForm && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
            <div className="w-full flex justify-between">
              <h3 className="text-lg font-semibold mb-4">{editItem ? "Edit Registered Product" : "Register Product"}</h3>
              <button onClick={() => { setShowRegisterForm(false); setEditItem(null); }}>close</button>
            </div>
            <form onSubmit={registerForm.handleSubmit(handleRegisterSubmit)} className="space-y-4">
              <input {...registerForm.register("model_no")} placeholder="Model No" required className="p-2 border w-full rounded" />
              <input {...registerForm.register("purchase_date")} type="date" required className="p-2 border w-full rounded" />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">Submit</button>
            </form>
          </div>
        </div>
      )}

      {showRequestForm && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
            <div className="w-full flex justify-between">
              <h3 className="text-lg font-semibold mb-4">Raise Warranty Request</h3>
              <button onClick={() => setShowRequestForm(false)} className="bg-red p-0.5">close</button>
            </div>
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