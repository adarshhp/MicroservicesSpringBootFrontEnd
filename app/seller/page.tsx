/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";

const Page = () => {
  const [activeTab, setActiveTab] = useState<"inventory" | "purchases">(
    "inventory"
  );
  const [inventory, setInventory] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [productDetailsMap, setProductDetailsMap] = useState<
    Record<string, any>
  >({});
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editingPurchase, setEditingPurchase] = useState<any | null>(null);
  const [inventoryModelValid, setInventoryModelValid] = useState(false);
  const [purchaseModelValid, setPurchaseModelValid] = useState(false);
const router = useRouter();
  const sellerId = Number(localStorage.getItem("seller_id"));

  const inventoryForm = useForm();
  const purchaseForm = useForm();

  const fetchInventory = async () => {
    const res = await axios.get(
      `http://localhost:3089/allinventory?Seller_Id=${sellerId}`
    );
    const data = res.data || [];
    setInventory(data);
    enrichWithProductDetails(data.map((i: any) => i.model_no));
  };

  const fetchPurchases = async () => {
    const res = await axios.get(
      `http://localhost:3089/GetPurchases?Seller_Id=${sellerId}`
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

  const fetchModelDetails = async (
    modelNo: string,
    formType: "inventory" | "purchase"
  ) => {
    try {
      const res = await axios.get(
        `http://localhost:1089/getProductDetailsByModelNo?Model_no=${modelNo}`
      );
      const prod = res.data;
      if (!prod || !prod.model_no) {
        alert("Invalid model number");
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        formType === "inventory"
          ? setInventoryModelValid(false)
          : setPurchaseModelValid(false);
        return;
      }

      if (formType === "inventory") {
        inventoryForm.setValue("price", prod.product_price);
        inventoryForm.setValue("warranty", prod.warrany_tenure);
        inventoryForm.setValue("company_id", prod.company_id);
        inventoryForm.setValue("model_no", prod.model_no);
        inventoryForm.setValue("category_id", prod.product_category);
        inventoryForm.setValue("holderStatus", prod.holderStatus);
        setInventoryModelValid(true);
      } else {
        purchaseForm.setValue("price", prod.product_price);
        purchaseForm.setValue("warranty", prod.warrany_tenure);
        purchaseForm.setValue("modelNo", prod.model_no);
        purchaseForm.setValue("company_id", prod.company_id);
        purchaseForm.setValue("category_id", prod.product_category);
                inventoryForm.setValue("holderStatus", prod.holderStatus);

        setPurchaseModelValid(true);
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching model details");
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      formType === "inventory"
        ? setInventoryModelValid(false)
        : setPurchaseModelValid(false);
    }
  };

  const handleInventorySubmit = async (data: any) => {
    if (!inventoryModelValid) {
      alert("Please fetch & validate model number first.");
      return;
    }
    const payload = {
      purchase_date: data.purchase_date,
      price: data.price,
      warranty: data.warranty,
      seller_id: sellerId,
      company_id: data.company_id,
      model_no: data.model_no,
      category_id: data.category_id,
    };

    try {
      if (editingItem) {
        await axios
          .post(
            `http://localhost:3089/editinventory?purchaseId=${editingItem.purchase_id}`,
            payload
          )
          .then((response) => {
            console.log(response);
          });
        setEditingItem(null);
      } else {
       await axios
          .get(
            `http://localhost:1089/checkeligibility?Model_no=${data.model_no}&checkvalue=2`
          )
          .then((response) => {
            console.log(response.data,"mittuuu")
            if (response.data == true) {
               axios
                .post("http://localhost:3089/inventory", payload)
                .then((response) => {
                  if (response) {
                    axios.post(
                      `http://localhost:1089/changeholderstatus?Model_no=${data.model_no}&status=2`
                    );
                  }
                });
            } else {
              alert(
                "Model number is not eligible for inventory. Please check the model number or contact support."
              );
              return;
            }
          });
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
      alert("Please fetch & validate model number first.");
      return;
    }
    // const payload: any = {
    //   customer_id: 0,
    //   modelNo: data.modelNo,
    //   purchase_date: data.purchase_date,
    //   seller_id: sellerId,
    //   name: data.name,
    //   email: data.email,
    //   phono: Number(data.phono),
    //   price: data.price,
    //   warranty: data.warranty,
    // };

    const payload = {
      modelNo: data.modelNo,
      purchase_date: data.purchase_date,
      seller_id: sellerId,
      name: data.name,
      price: data.price,
      warranty: data.warranty,
      phono: Number(data.phono),
      email: data.email,
    };
    try {
      if (editingPurchase) {
        await axios.post(
          `http://localhost:3089/editpurchase?sale_id=${editingPurchase.sale_id}`,
          payload
        );
        setEditingPurchase(null);
      } else {

        await axios
          .get(
            `http://localhost:1089/checkeligibility?Model_no=${data.modelNo}&checkvalue=3`
          )
          .then((response) => {
            console.log(response.data,"mittuuu")
            if (response.data == true) {
                axios
          .post("http://localhost:3089/purchase", payload)
          .then((response) => {
            console.log(response);
            axios.post(
              `http://localhost:1089/changeholderstatus?Model_no=${data.modelNo}&status=3`
            );
          });
            } else {
              alert(
                "Model number is not eligible for purchase. Please check the model number or contact support."
              );
              return false;
            }
          });
       
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

  console.log(inventory,"inventory")
  return (
    <div className="p-6 min-w-sc mx-auto space-y-6 bg-gray-50 min-h-screen text-black">
              <button className="bg-blue-500 fixed top-0 right-0 p-1 rounded-xl" onClick={()=>router.push("/")}>Logout</button>

      <h1 className="text-3xl font-bold">Seller Dashboard</h1>
      {/* Tabs */}
      <div className="flex justify-between items-center mb-4">
        <div className="space-x-4">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-4 py-2 rounded ${
              activeTab === "inventory"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Inventory
          </button>
          <button
            onClick={() => setActiveTab("purchases")}
            className={`px-4 py-2 rounded ${
              activeTab === "purchases"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
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
            className="bg-green-600 text-white px-4 py-2 rounded"
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
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            + Add Purchase
          </button>
        )}
      </div>

      {/* Inventory List */}
      {activeTab === "inventory" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventory.map((item) => {
            const prod = productDetailsMap[item.model_no] || {};
            return (
              <div
                key={item.purchase_id}
                className="bg-indigo-100 border rounded p-4 shadow text-black"
              >
                <p>
                  <strong>Model:</strong> {item.model_no}
                </p>
                <p>Price: ₹{item.price}</p>
                <p>Warranty: {item.warranty} months</p>
                <div className="flex justify-between"><p>Date: {item.purchase_date}</p> <p>ItemStatus:{prod.holderStatus==2?"Item Available":prod.holderStatus==3?"Out of stock": prod.holderStatus==4?  "Item purchased":prod.holderStatus==4?"Applied warranty":prod.holderStatus==1?"Prodcuct Shipped":"No Data"}</p></div>
                {prod.product_name && (
                  <>
                    <hr className="my-2" />
                    <p>Product Name:{prod.product_name}</p>
                    <p>Warranty Tenure (years): {prod.warrany_tenure}</p>
                    <p>Manufactured: {prod.man_date}</p>
                  </>
                )}
                <div className="space-x-2 mt-2">
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      inventoryForm.reset(item);
                      setInventoryModelValid(true);
                      setShowInventoryForm(true);
                    }}
                    className="text-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteInventory(item.purchase_id)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Purchases List */}
      {activeTab === "purchases" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {purchases.map((purchase) => {
            const prod = productDetailsMap[purchase.modelNo] || {};
            return (
              <div
                key={purchase.sale_id}
                className="bg-indigo-100 border rounded p-4 shadow text-black"
              >
                <p>
                  <strong>Customer:</strong> {purchase.name}
                </p>
                <p>Model: {purchase.modelNo}</p>
                <p>Price: ₹{purchase.price}</p>
                <p>Date: {purchase.purchase_date}</p>
                {prod.product_name && (
                  <>
                    <hr className="my-2" />
                    <p>
                      <strong>Product Name:</strong> {prod.product_name}
                    </p>
                    <p>
                      <strong>Warranty Years:</strong> {prod.warrany_tenure}
                    </p>
                    <p>
                      <strong>Manufactured:</strong> {prod.man_date}
                    </p>
                    <p>
                      <strong>Item Status:</strong> {prod.holderStatus==4?"Apply for warranty":"Requested for warranty"
                      
                      
                      }
                    </p>
                  </>
                )}
                <div className="space-x-2 mt-2">
                  <button
                    onClick={() => {
                      setEditingPurchase(purchase);
                      purchaseForm.reset(purchase);
                      setPurchaseModelValid(true);
                      setShowPurchaseForm(true);
                    }}
                    className="text-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deletePurchase(purchase.sale_id)}
                    className="text-red-600"
                  >
                    Cancel Request
                  </button>
                </div>
              </div>
            );
          })}
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
                    fetchModelDetails(
                      inventoryForm.getValues("model_no"),
                      "inventory"
                    )
                  }
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Fetch
                </button>
              </div>
              <div>
                <label>Price</label>
                <input
                  {...inventoryForm.register("price")}
                  type="number"
                  required
                  className="p-2 border rounded w-full"
                />
              </div>
              <div>
                <label>Warranty (Months)</label>
                <input
                  {...inventoryForm.register("warranty")}
                  type="number"
                  required
                  className="p-2 border rounded w-full"
                />
              </div>
              <div>
                <label>Purchase Date</label>
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
        <div className="fixed inset-0 bg-black/60 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-xl relative text-black">
            <button
              onClick={() => setShowPurchaseForm(false)}
              className="absolute top-2 right-3 text-xl text-gray-500"
            >
              ×
            </button>
            <h3 className="text-lg font-semibold mb-4">
              {editingPurchase ? "Edit Purchase" : "Add Purchase"}
            </h3>
            <form
              onSubmit={purchaseForm.handleSubmit(handlePurchaseSubmit)}
              className="grid grid-cols-2 gap-4"
            >
              <div className="col-span-2 flex gap-2">
                <input
                  {...purchaseForm.register("modelNo")}
                  placeholder="Model No"
                  required
                  className="p-2 border rounded w-full"
                />
                <button
                  type="button"
                  onClick={() =>
                    fetchModelDetails(
                      purchaseForm.getValues("modelNo"),
                      "purchase"
                    )
                  }
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Fetch
                </button>
              </div>
              <div>
                <label>Purchase Date</label>
                <input
                  {...purchaseForm.register("purchase_date")}
                  type="date"
                  required
                  className="p-2 border rounded w-full"
                />
              </div>
              <div>
                <label>Price</label>
                <input
                  {...purchaseForm.register("price")}
                  type="number"
                  required
                  className="p-2 border rounded w-full"
                />
              </div>
              <div>
                <label>Warranty</label>
                <input
                  {...purchaseForm.register("warranty")}
                  type="number"
                  required
                  className="p-2 border rounded w-full"
                />
              </div>
              <div>
                <label>Name</label>
                <input
                  {...purchaseForm.register("name")}
                  placeholder="Customer Name"
                  required
                  className="p-2 border rounded w-full"
                />
              </div>
              <div>
                <label>Email</label>
                <input
                  {...purchaseForm.register("email")}
                  placeholder="Email"
                  required
                  className="p-2 border rounded w-full"
                />
              </div>
              <div>
                <label>Phone</label>
                <input
                  {...purchaseForm.register("phono")}
                  type="number"
                  placeholder="Phone"
                  required
                  className="p-2 border rounded w-full"
                />
              </div>
              <div className="col-span-2">
                <button
                  type="submit"
                  disabled={!purchaseModelValid}
                  className={`w-full py-2 rounded ${
                    purchaseModelValid
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
    </div>
  );
};

export default Page;
