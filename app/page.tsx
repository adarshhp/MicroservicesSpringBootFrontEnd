"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const { register, handleSubmit, reset } = useForm();
  const router = useRouter(); // ✅ Correct hook for Next.js navigation

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
          localStorage.setItem("user_id", response.data.user_id);

          const type = response.data.user_type;

          if (type === 4) {
            router.push("/admin");
          } else if (type === 1) {
            alert("Login successful!");
            router.push("/customer");
          } else if (type === 3) {
            router.push("/company");
          } else if (type === 2) {
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
    <div className="bg-white min-h-screen flex items-center justify-center p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-md w-full bg-gray-600 rounded-2xl shadow-xl p-8 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => {
              setIsLogin(true);
              reset();
            }}
            className={`px-4 py-2 rounded-lg ${
              isLogin ? "bg-blue-600 text-white" : "bg-gray-300"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              reset();
            }}
            className={`px-4 py-2 rounded-lg ${
              !isLogin ? "bg-blue-600 text-white" : "bg-gray-300"
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isLogin && (
            <input
              {...register("userName")}
              type="text"
              placeholder="Username"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          )}
          <input
            {...register("email")}
            type="email"
            placeholder="Email"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <input
            {...register("password")}
            type="password"
            placeholder="Password"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
