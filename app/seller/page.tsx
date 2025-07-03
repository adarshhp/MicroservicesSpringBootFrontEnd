/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

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
  const sellerId = Number(localStorage.getItem("seller_id"));
  const [categoryIds, setCategoryIds] = useState<number | "">("");
  const [modelNoss, setModelNos] = useState<string>("");
  const [warrantys, setWarrantys] = useState<number | "">("");
  const [modelnopurchase, setModelNoPurchase] = useState<string>("");

  const inventoryForm = useForm();
  const purchaseForm = useForm();
  const fetchInventory = async () => {
    const res = await axios.get(
      `http://localhost:3089/allinventory?Seller_Id=${sellerId}&page=0&size=1000&categoryId=${categoryIds}&modelNo=${modelNoss}&warranty=${
        warrantys == 0 ? "" : warrantys
      }`
    );
    const data = res.data.content || [];
    setInventory(data);
    enrichWithProductDetails(data.map((i: any) => i.model_no));
  };

  const fetchPurchases = async () => {
    const res = await axios.get(
      `http://localhost:3089/GetPurchases?Seller_Id=${sellerId}&modelNo=${modelnopurchase}&page=0&size=1000`
    );
    const data = res.data.content || [];
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
            if (response.data == true) {
              axios
                .post("http://localhost:3089/inventory", payload)
                .then((response) => {
                  if (response) {
                    axios.post(
                      `http://localhost:1089/changeholderstatus?Model_no=${data.model_no}&status=2`
                    );
                    inventoryForm.reset();
                    setShowInventoryForm(false);
                    setInventoryModelValid(false);
                    fetchInventory();
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
      phono: data.phono,
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
            if (response.data == true) {
              axios
                .post("http://localhost:3089/purchase", payload)
                .then((response) => {
                  purchaseForm.reset();
                  setShowPurchaseForm(false);
                  setPurchaseModelValid(false);
                  fetchPurchases();
                  console.log(response);
                  axios.post(
                    `http://localhost:1089/changeholderstatus?Model_no=${data.modelNo}&status=3`
                  );
                });
            } else {
              alert(
                "Model number is not eligible for purchase. Add it to the inventory first."
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

  const showEditOption = (item: any) => {
    setShowPurchaseForm(true);
    purchaseForm.setValue("modelNo", item.model_no);
    fetchModelDetails(item.model_no, "purchase");
  };
  return (
    <div className="p-6 min-w-sc mx-auto space-y-6 bg-white h-full text-gray-900">
  <h1 className="text-4xl font-bold text-center text-gray-900">Seller Dashboard</h1>

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

            <button
              onClick={() => {
                setEditingItem(null);
                inventoryForm.reset();
                setInventoryModelValid(false);
                setShowInventoryForm(true);
              }}
              className="bg-gray-900 hover:bg-gray-700 text-white px-5 py-2 rounded-full shadow ml-2"
            >
              + Add Item
            </button>
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
            {/* <button
              onClick={() => {
                setEditingPurchase(null);
                purchaseForm.reset();
                setPurchaseModelValid(false);
                setShowPurchaseForm(true);
              }}
              className="bg-gray-900 hover:bg-gray-700 text-white px-5 py-2 rounded-full shadow"
            >
              + Mark Item Sold
            </button> */}
          </div>
        )}
      </span>
    </div>
  </div>

  {/* Inventory List */}
  {activeTab === "inventory" && (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {inventory.map((item) => {
        const prod = productDetailsMap[item.model_no] || {};
        return (
          <div
            key={item.purchase_id}
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-md"
          >
            <span className="flex justify-between">
              <p className="font-semibold text-lg mb-1">Model: {item.model_no}</p>
              <p
                className="text-gray-700 underline cursor-pointer"
                onClick={() => showEditOption(item)}
              >
                Mark sold!
              </p>
            </span>
            <p>Price: ₹{item.price}</p>
            <p>Warranty: {item.warranty} months</p>
            <div className="flex justify-between items-center mt-2 text-sm">
              <p>Date: {item.purchase_date}</p>
              <p className="text-right font-medium text-gray-700">
                Item Status:{" "}
                {prod.holderStatus === 2
                  ? "Item Available"
                  : prod.holderStatus === 3
                  ? "Out of Stock"
                  : prod.holderStatus === 4
                  ? "Item Purchased"
                  : prod.holderStatus === 1
                  ? "Product Shipped"
                  : "No Data"}
              </p>
            </div>
            {prod.product_name && (
              <>
                <hr className="my-3" />
                <p>Product Name: {prod.product_name}</p>
                <p>Warranty Tenure (years): {prod.warrany_tenure}</p>
                <p>Manufactured: {prod.man_date}</p>
              </>
            )}
            <div className="space-x-4 mt-4 text-sm font-medium">
              <button
                onClick={() => {
                  setEditingItem(item);
                  inventoryForm.reset(item);
                  setInventoryModelValid(true);
                  setShowInventoryForm(true);
                }}
                className="text-gray-700 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => deleteInventory(item.purchase_id)}
                className="text-gray-700 hover:underline"
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {purchases.map((purchase) => {
        const prod = productDetailsMap[purchase.modelNo] || {};
        return (
          <div
            key={purchase.sale_id}
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-md"
          >
            <p className="font-semibold text-lg mb-1">Customer: {purchase.name}</p>
            <p>Model: {purchase.modelNo}</p>
            <p>Price: ₹{purchase.price}</p>
            <p>Date: {purchase.purchase_date}</p>
            {prod.product_name && (
              <>
                <hr className="my-3" />
                <p>Product Name: {prod.product_name}</p>
                <p>Warranty Years: {prod.warrany_tenure}</p>
                <p>Manufactured: {prod.man_date}</p>
                <p>
                  Item Status:{" "}
                  <span className="text-gray-700 font-medium">
                    {prod.holderStatus === 4
                      ? "Apply for warranty"
                      : "Requested for warranty"}
                  </span>
                </p>
              </>
            )}
            <div className="space-x-4 mt-4 text-sm font-medium">
              <button
                onClick={() => {
                  setEditingPurchase(purchase);
                  purchaseForm.reset(purchase);
                  setPurchaseModelValid(true);
                  setShowPurchaseForm(true);
                }}
                className="text-gray-700 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => deletePurchase(purchase.sale_id)}
                className="text-gray-700 hover:underline"
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-xl relative">
        <button
          onClick={() => setShowInventoryForm(false)}
          className="absolute top-2 right-3 text-2xl text-gray-400 hover:text-gray-700"
        >
          ×
        </button>
        <h3 className="text-xl font-semibold mb-4">
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
              className="bg-gray-900 text-white px-4 py-1 rounded"
            >
              Fetch
            </button>
          </div>
          <div>
            <label className="block mb-1">Price</label>
            <input
              {...inventoryForm.register("price")}
              type="number"
              required
              className="p-2 border rounded w-full"
            />
          </div>
          <div>
            <label className="block mb-1">Warranty (Months)</label>
            <input
              {...inventoryForm.register("warranty")}
              type="number"
              required
              className="p-2 border rounded w-full"
            />
          </div>
          <div>
            <label className="block mb-1">Selling Date</label>
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
              className={`w-full py-2 rounded transition ${
                inventoryModelValid
                  ? "bg-gray-900 hover:bg-gray-700 text-white"
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-xl relative">
        <button
          onClick={() => setShowPurchaseForm(false)}
          className="absolute top-2 right-3 text-2xl text-gray-400 hover:text-gray-700"
        >
          ×
        </button>
        <h3 className="text-xl font-semibold mb-4">
          {editingPurchase ? "Edit Purchase" : "Mark Item Sold"}
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
              disabled
            />
            {/* <button
              type="button"
              onClick={() =>
                fetchModelDetails(
                  purchaseForm.getValues("modelNo"),
                  "purchase"
                )
              }
              className="bg-gray-900 text-white px-4 py-1 rounded"
            >
              Fetch
            </button> */}
          </div>
          <div>
            <label className="block mb-1">Selling Date</label>
            <input
              {...purchaseForm.register("purchase_date")}
              type="date"
              required
              className="p-2 border rounded w-full"
            />
          </div>
          <div>
            <label className="block mb-1">Price</label>
            <input
              {...purchaseForm.register("price")}
              type="number"
              required
              className="p-2 border rounded w-full"
              disabled
            />
          </div>
          <div>
            <label className="block mb-1">Warranty</label>
            <input
              {...purchaseForm.register("warranty")}
              type="number"
              required
              className="p-2 border rounded w-full"
              disabled
            />
          </div>
          <div>
            <label className="block mb-1">Name</label>
            <input
              {...purchaseForm.register("name")}
              placeholder="Customer Name"
              required
              className="p-2 border rounded w-full"
            />
          </div>
          <div>
            <label className="block mb-1">Email</label>
            <input
              {...purchaseForm.register("email")}
              placeholder="Email"
              required
              className="p-2 border rounded w-full"
            />
          </div>
          <div>
            <label className="block mb-1">Phone</label>
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
              className={`w-full py-2 rounded transition ${
                purchaseModelValid
                  ? "bg-gray-900 hover:bg-gray-700 text-white"
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
