/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import axios from "axios";

const CustomerWarrantyPage = () => {
  const [activeTab, setActiveTab] = useState<"registered" | "requests">(
    "registered"
  );
  const [registered, setRegistered] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [productDetailsMap, setProductDetailsMap] = useState<
    Record<string, any>
  >({});
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [modelData, setModelData] = useState<any>(null);
  const [modelValid, setModelValid] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
const [searchModelNo, setSearchModelNo] = useState("");
  const customerId = Number(localStorage.getItem("user_id"));
    const [previewImage, setPreviewImage] = useState<string | null>(null);

  

  const registerForm = useForm();
  const requestForm = useForm();

  const fetchRegistered = async () => {
    const res = await axios.get(
      `http://localhost:4089/warranty-requests-customer?customerId=${customerId}&modelNo=${searchModelNo}`
    );
    const data = res.data || [];
    setRegistered(data);

    const modelNos = [...new Set(data.map((item: any) => item.model_no))];
    if (modelNos.length > 0) {
      try {
        const prodRes = await axios.post(
          "http://localhost:1089/products/by-models",
          modelNos
        );
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
    const res = await axios.get(
      `http://localhost:4089/raised-warranty-requests-customer?userId=${customerId}&modelNo=${searchModelNo}`
    );
    const data = res.data || [];
    setRequests(data);

    const modelNos = [...new Set(data.map((req: any) => req.model_no))];
    if (modelNos.length > 0) {
      try {
        const prodRes = await axios.post(
          "http://localhost:1089/products/by-models",
          modelNos
        );
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

  // const fetchModelDetails = async (modelNo: string) => {
  //   try {
  //     const res = await axios.get(
  //       `http://localhost:1089/getProductDetailsByModelNo?Model_no=${modelNo}`
  //     );
  //     if (res.data && res.data.model_no) {
  //       setModelData(res.data);
  //       requestForm.setValue("company_id", res.data.company_id);
  //       requestForm.setValue("purchase_date", res.data.man_date);
  //       setModelValid(true);
  //     } else {
  //       alert("Invalid model number");
  //       setModelValid(false);
  //     }
  //   } catch {
  //     alert("Model number fetch failed");
  //     setModelValid(false);
  //   }
  // };

  const handleEdit = (item: any) => {
    setEditItem(item);
    registerForm.setValue("model_no", item.model_no);
    registerForm.setValue("purchase_date", item.purchase_date);
    setShowRegisterForm(true);
  };

  const handleDelete = async (purchaseId: number) => {
    try {
      const res = await axios.post(
        `http://localhost:4089/delete-registered-warranty?purchase_Id=${purchaseId}`
      );
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
        await axios.post(
          `http://localhost:4089/editregistered-warranty?purchase_Id=${editItem.purchase_Id}`,
          payload
        );
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
            if (response.data === true) {
              axios
                .post("http://localhost:4089/register-warranty", payload)
                .then((response) => {
                  if (response.status === 200) {

                    axios.post(
                      `http://localhost:1089/changeholderstatus?Model_no=${data.model_no}&status=4`
                    );
                    setShowRegisterForm(false);
                    registerForm.reset();
                    fetchRegistered();
                   return;

                  }
                });
              setShowRegisterForm(false);
              registerForm.reset();
              fetchRegistered();
            } else {
              alert(
                "You are not eligible to register this product. Please contact support."
              );
            }
          });
      } catch (err: any) {
        alert(err.response?.data?.message || err.message);
      }
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

 const handleRequestSubmit = async (data: any) => {
  // if (!modelValid) {
  //   alert("Please validate model number first");
  //   return;
  // }

  try {
    // const response = await axios.get(
    //   `http://localhost:3089/warranty-reg-valid?ModelNo=${data.model_no}&PhoneNo=${data.phone_number}`
    // );

    // if (response.data === false) {
    //   alert("Entered Phono No not linked to this product. Contact seller for more details.");
    //   return;
    // }
 const file = data.image[0]; // data.image is a FileList
    const base64Image = await convertToBase64(file);
    const payload = {
      ...data,
      customer_id: customerId,
      // request_date: new Date().toISOString().split("T")[0],
      purchase_date: "2025-07-03",
      company_id: modelData?.company_id || 0,
      phone_number: data.phone_number,
      request_date:  "2025-07-01",
      reason: data.reason || "No reason provided",
      image:base64Image
    };

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
      alert("You are not eligible to raise a warranty request for this product. Please register the product first.");
    }
  } catch (err: any) {
    alert(err.response?.data?.message || err.message);
  }
};

  const handleRaiseReqeust = (purchaseId: number, modelNo: string) => {
    setShowRequestForm(true);
    requestForm.setValue("model_no", modelNo);
  };

  console.log(productDetailsMap,"productDetailsMap")

  return (
 <div className="p-6 max-w-screen bg-white h-full text-gray-800">
  <h1 className="text-4xl font-bold mb-6 text-center text-gray-900">Customer Dashboard</h1>

  {/* Tabs */}
  <div className="flex justify-between items-center mb-6">
    <div className="space-x-4">
      <button
        className={`px-5 py-2 rounded-full font-medium transition ${
          activeTab === "registered"
            ? "bg-gray-900 text-white shadow"
            : "bg-white border border-gray-300 text-gray-800 hover:bg-gray-100"
        }`}
        onClick={() => setActiveTab("registered")}
      >
        Registered Products
      </button>
      <button
        className={`px-5 py-2 rounded-full font-medium transition ${
          activeTab === "requests"
            ? "bg-gray-900 text-white shadow"
            : "bg-white border border-gray-300 text-gray-800 hover:bg-gray-100"
        }`}
        onClick={() => setActiveTab("requests")}
      >
        Warranty Requests
      </button>
    </div>

<div className="flex flex-wrap items-center justify-between gap-4 mb-4">
  {/* Search Section */}
  <div className="flex items-center gap-2">
    <input
      type="text"
      placeholder="Search Model No"
      onChange={(e) => setSearchModelNo(e.target.value)}
      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm text-gray-800"
    />
    <button
      onClick={() => {fetchRequests();
        fetchRegistered()}
      }
      className="bg-gray-900 text-white px-4 py-2 rounded-md shadow hover:bg-gray-700 transition duration-200 text-sm"
    >
      Search
    </button>
  </div>

  {/* Action Button */}
  {activeTab === "registered" ? (
    <button
      onClick={() => {
        registerForm.reset();
        setEditItem(null);
        setShowRegisterForm(true);
      }}
      className="bg-gray-900 hover:bg-gray-700 text-white px-5 py-2 rounded-full shadow text-sm"
    >
      + Register Product
    </button>
  ) : (
    // <button
    //   onClick={() => {
    //     requestForm.reset();
    //     setModelValid(false);
    //     setShowRequestForm(true);
    //   }}
    //   className="bg-gray-900 hover:bg-gray-700 text-white px-5 py-2 rounded-full shadow text-sm"
    // >
    //   + Raise Request
    // </button>
    <div>

    </div>
  )}
</div>

  </div>

  {/* Registered Products */}
  {activeTab === "registered" && (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {registered.map((item) => {
        const product = productDetailsMap[item.model_no] || {};
        return (
          <div
            key={item.purchase_Id}
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-lg relative"
          >
                <div className="flex items-center justify-between mb-3">
            <p className="text-lg font-medium">Model: {item.model_no}</p>
<button
  onClick={() => setPreviewImage(product.product_image)}
  className="text-blue-600 underline text-sm hover:text-blue-800 transition"
>
  View Image
</button>
</div>
            <p>Purchase Date: {item.purchase_date}</p>
            {product.product_name && (
              <>
                <hr className="my-3" />
                <p>Product Name: {product.product_name}</p>
                <p>Price: ₹{product.product_price}</p>
                <p>Warranty: {product.warrany_tenure} years</p>
                <p>Manufactured: {product.man_date}</p>
              </>
            )}
            <div className="absolute top-2 right-2 space-x-3 text-sm font-medium">
              <button
                onClick={() => handleEdit(item)}
                className="text-gray-700 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item.purchase_Id)}
                className="text-gray-700 hover:underline"
              >
                Delete
              </button>
              <button
                onClick={() =>
                  handleRaiseReqeust(item.purchase_Id, item.model_no)
                }
                className="text-gray-700 hover:underline"
              >
                Request
              </button>
            </div>
          </div>
        );
      })}
    </div>
  )}

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

  {/* Warranty Requests */}
  {activeTab === "requests" && (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {requests.map((req) => {
        const product = productDetailsMap[req.model_no] || {};
        return (
          <div
            key={req.warranty_request_id}
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-lg"
          >
            <div className="flex items-center justify-between mb-3">
            <p className="text-lg font-medium">Model: {req.model_no}</p>
            <button
  onClick={() => setPreviewImage(product.product_image)}
  className="text-blue-600 underline text-sm hover:text-blue-800 transition"
>
  View Image
</button></div>
            <p>Name: {req.customer_name}</p>
            <p>Email: {req.customer_email}</p>
            
            <p>
              Status:{" "}
              <span className="text-gray-700">
                {req.warranty_status === 1
                  ? "Pending"
                  : req.warranty_status === 2
                  ? "Approved"
                  : "Rejected"}
              </span>
            </p>
            {product.product_name && (
              <>
                <hr className="my-3" />
                <p>Product Name: {product.product_name}</p>
                <p>Price: ₹{product.product_price}</p>
                <p>Warranty: {product.warrany_tenure} years</p>
                <p>Manufactured: {product.man_date}</p>

              </>
            )}
          </div>
        );
      })}
    </div>
  )}

  {/* Register Form Modal */}
  {showRegisterForm && (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg relative">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">
            {editItem ? "Edit Registered Product" : "Register Product"}
          </h3>
          <button
            onClick={() => {
              setShowRegisterForm(false);
              setEditItem(null);
            }}
            className="text-2xl text-gray-400 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        <form
          onSubmit={registerForm.handleSubmit(handleRegisterSubmit)}
          className="space-y-4"
        >
          <input
            {...registerForm.register("model_no")}
            placeholder="Model No"
            required
            className="p-2 border border-gray-300 rounded w-full"
          />
          <input
            {...registerForm.register("purchase_date")}
            type="date"
            required
            className="p-2 border border-gray-300 rounded w-full"
          />
          <button
            type="submit"
            className="bg-gray-900 hover:bg-gray-700 text-white px-4 py-2 rounded w-full"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  )}

  {/* Warranty Request Form Modal */}
  {showRequestForm && (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg relative">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Raise Warranty Request</h3>
          <button
            onClick={() => setShowRequestForm(false)}
            className="text-2xl text-gray-400 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        <form
          onSubmit={requestForm.handleSubmit(handleRequestSubmit)}
          className="space-y-4"
        >
          <div className="flex gap-2">
            <input
              {...requestForm.register("model_no")}
              placeholder="Model No"
              required
              className="p-2 border border-gray-300 rounded w-full"
              disabled
            />
            {/* <button
              type="button"
              onClick={() =>
                fetchModelDetails(requestForm.getValues("model_no"))
              }
              className="bg-gray-900 hover:bg-gray-700 text-white px-3 rounded"
            >
              Fetch
            </button> */}
          </div>
          <input
            {...requestForm.register("customer_name")}
            placeholder="Your Name"
            required
            className="p-2 border border-gray-300 rounded w-full"
          />
          <input
            {...requestForm.register("customer_email")}
            placeholder="Your Email"
            required
            className="p-2 border border-gray-300 rounded w-full"
          />
          <input
            {...requestForm.register("phone_number")}
            type="number"
            placeholder="Phone"
            required
            className="p-2 border border-gray-300 rounded w-full"
          />


 <div>
                <label className="block mb-1 text-gray-700">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  {...requestForm.register("image", { required: true })}
                  className="w-full border px-4 py-2 rounded-lg"
                />
              </div>


          <input
            {...requestForm.register("reason")}
            placeholder="Reason for Request"
            required
            className="p-2 border border-gray-300 rounded w-full"
          />
          <button
            type="submit"
            // disabled={!modelValid}
            className={`w-full py-2 rounded transition ${
              modelValid
                ? "bg-gray-900 hover:bg-gray-700 text-white"
                : "bg-gray-900 hover:bg-gray-700 text-white"
            }`}
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
