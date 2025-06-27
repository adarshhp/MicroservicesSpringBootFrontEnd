"use client";
import { useRouter } from 'next/navigation'
import React from 'react'

const Navbar = () => {
    const router = useRouter()
  return (
    <div className='w-full bg-gray-800 text-white p-2 flex justify-between items-center'>
      Welcome 
      <button className='bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition' onClick={() => {router.push('/');
        
        //localStorage.removeItem('user_type'); localStorage.removeItem('company_id'); localStorage.removeItem('user_id');
        
        }}>
        Logout
      </button>
    </div>
  )
}

export default Navbar
