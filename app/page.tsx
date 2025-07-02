"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const { register, handleSubmit, reset } = useForm();
  const router = useRouter(); // ✅ Correct hook for Next.js navigation


//   useEffect(() => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     const userType = localStorage.getItem("user_type");
//     const userId = localStorage.getItem("user_id");
//     const companyId = localStorage.getItem("company_id");
//     const sellerId = localStorage.getItem("seller_id");

//     if (userType === "4") {
//       router.replace("/admin");
//     } else if (userType === "1" && userId) {
//       router.replace("/customer");
//     } else if (userType === "3" && companyId) {
//       router.replace("/company");
//     } else if (userType === "2" && sellerId) {
//       router.replace("/seller");
//     }
//   }
// }, []);


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    try {
      if (isLogin) {
        const response = await axios.post("http://localhost:2089/login", {
          email: data.email,
          password: data.password,
        });

        if (response.data.statusCode === 200) {
          localStorage.setItem("token", response.data.jwt);
          localStorage.setItem("user_type", response.data.user_type);

          const type = response.data.user_type;
          axios
            .get(
              `http://localhost:2089/getuserdetails?user_Id=${response.data.user_id}
`
            )
            .then((response) => {
              if (response) {
                localStorage.setItem("user_name", response.data.userName);
              }
            });
          if (type === 4) {
            router.push("/admin");
          } else if (type === 1) {
            // alert("Login successful!");
            localStorage.setItem("user_id", response.data.user_id);
            router.push("/customer");
          } else if (type === 3) {
            localStorage.setItem("company_id", response.data.user_id);
            router.push("/company");
          } else if (type === 2) {
            localStorage.setItem("seller_id", response.data.user_id);
            router.push("/seller");
          }
        }
      } else {
        const response = await axios.post("http://localhost:2089/signup", {
          userName: data.userName,
          email: data.email,
          password: data.password,
        });

        if (response.status === 200) {
          alert("Signup successful! You can now log in.");
          setIsLogin(true);
          reset();
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert("Error: " + (error.response?.data?.message || error.message));
    }
  };
return (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">
  <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-300">
    
    {/* Tabs */}
    <div className="flex justify-center gap-4 mb-6">
      <button
        onClick={() => {
          setIsLogin(true);
          reset();
        }}
        className={`px-5 py-2 rounded-full font-medium transition ${
          isLogin
            ? "bg-gray-800 text-white shadow"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        Login
      </button>
      <button
        onClick={() => {
          setIsLogin(false);
          reset();
        }}
        className={`px-5 py-2 rounded-full font-medium transition ${
          !isLogin
            ? "bg-gray-800 text-white shadow"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        Sign Up
      </button>
    </div>

    {/* Form */}
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {!isLogin && (
        <input
          {...register("userName")}
          type="text"
          placeholder="Username"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 placeholder:text-gray-700"
        />
      )}
      <input
        {...register("email")}
        type="email"
        placeholder="Email"
        required
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 placeholder:text-gray-700"
      />
      <input
        {...register("password")}
        type="password"
        placeholder="Password"
        required
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 placeholder:text-gray-700"
      />
      <button
        type="submit"
        className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold transition"
      >
        {isLogin ? "Login" : "Sign Up"}
      </button>
    </form>
  </div>
</div>

);

}
