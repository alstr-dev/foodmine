import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useUser } from '../UserContext';
import { useNavigate } from "react-router-dom";

function Navbar() {

    const { setUserName, setUserId, setUserType, setItemCount, setEmailId, setUserPhone } = useUser();
    const { userId, userName, userType, itemCount, emailId, userPhone } = useUser();

    const navigate = useNavigate();


    const handleLogout = async () => {
        try {
            if (userType === "customer") {
                const response = await fetch('http://localhost:5000/customerlogout', {
                    method: 'POST',
                    credentials: 'include'
                });

                if (response.ok) {
                    localStorage.removeItem("user_id");
                    setUserName(null);
                    setUserId(null);
                    setUserType(null);
                    setEmailId(null);
                    setUserPhone(null);

                    navigate("/");

                    window.location.reload();
                } else {
                    console.error('Failed to logout');
                }
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };


    return (
        <div>
            <nav className="bg-white">
                <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
                    {/* Logo */}
                    <div className="text-2xl font-bold text-orange-400">
                        <NavLink to="/">FoodMine</NavLink>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex space-x-4 ml-8 mr-24">

                        <ul className='lg:flex lg:gap-x-10 max-lg:space-y-3 max-lg:fixed max-lg:bg-white max-lg:w-2/3 max-lg:min-w-[300px] max-lg:top-0 max-lg:left-0 max-lg:p-4 max-lg:h-full max-lg:shadow-md max-lg:overflow-auto z-50'>

                            {userName === null && userId === null && (
                                <li className='max-lg:border-b max-lg:px-3 max-lg:py-3 relative'><NavLink to="/" className="py-4 inline-flex items-center [&.active]:border-b-2 [&.active]:border-blue-500 text-sm font-medium whitespace-nowrap focus:outline-none text-gray-600 hover:text-blue-500 [&.active]:text-blue-500" aria-current="page">
                                    Home
                                </NavLink></li>
                            )}

                            <li className='max-lg:border-b max-lg:px-3 max-lg:py-3 relative'><NavLink to="/customer/ordernow" className="py-4 inline-flex items-center [&.active]:border-b-2 [&.active]:border-blue-500 text-sm font-medium whitespace-nowrap focus:outline-none text-gray-600 hover:text-blue-500 [&.active]:text-blue-500" aria-current="page">
                                Order Now
                            </NavLink></li>

                            {/* <li className='max-lg:border-b max-lg:px-3 max-lg:py-3 relative'><NavLink to="/restaurant/register" className="py-4 inline-flex items-center [&.active]:border-b-2 [&.active]:border-blue-500 text-sm font-medium whitespace-nowrap focus:outline-none text-gray-600 hover:text-blue-500 [&.active]:text-blue-500" aria-current="page">
                                Add Restaurant
                            </NavLink></li> */}

                            {userName === null && userId === null && (
                                <>
                                    <li className='max-lg:border-b max-lg:px-3 max-lg:py-3 relative'><NavLink to="/customer/login" className="py-4 inline-flex items-center [&.active]:border-b-2 [&.active]:border-blue-500 text-sm font-medium whitespace-nowrap focus:outline-none text-gray-600 hover:text-blue-500 [&.active]:text-blue-500" aria-current="page">
                                        Login
                                    </NavLink></li>

                                    <li className='max-lg:border-b max-lg:px-3 max-lg:py-3 relative'><NavLink to="/new-user/signup" className="py-4 inline-flex items-center [&.active]:border-b-2 [&.active]:border-blue-500 text-sm font-medium whitespace-nowrap focus:outline-none text-gray-600 hover:text-blue-500 [&.active]:text-blue-500" aria-current="page">
                                        Signup
                                    </NavLink></li>
                                </>
                            )}



                            {/* Food Tray */}
                            <li className='max-lg:border-b max-lg:px-3 max-lg:py-3 relative'>
                                <NavLink to="/customer/tray" className="inline-flex items-center [&.active]:border-b-2 [&.active]:border-blue-500 mt-3" aria-current="page">

                                    <div className="relative inline-block">
                                        {/* Cart SVG */}
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M7 4H3C2.44772 4 2 4.44772 2 5C2 5.55228 2.44772 6 3 6H5.1863L6.51162 14.2345C6.6119 14.8653 7.16226 15.3 7.80154 15.3H17.7823C18.3512 15.3 18.8623 14.9232 19.0517 14.3784L21.553 7.37844C21.6855 6.9772 21.4307 6.54761 21.0226 6.42643C20.6145 6.30525 20.1628 6.55215 20.0303 6.95339L17.5289 13.9534H8.72709L8.40251 12H18.6848C19.1026 12 19.4841 11.7435 19.6526 11.3518L22 5.5C22.1883 5.00992 21.9519 4.44966 21.463 4.25015C20.974 4.05064 20.3937 4.30667 20.2053 4.79675L17.858 10.6482H7.11143L6.01127 4H7ZM8 17C7.17157 17 6.5 17.6716 6.5 18.5C6.5 19.3284 7.17157 20 8 20C8.82843 20 9.5 19.3284 9.5 18.5C9.5 17.6716 8.82843 17 8 17ZM18 17C17.1716 17 16.5 17.6716 16.5 18.5C16.5 19.3284 17.1716 20 18 20C18.8284 20 19.5 19.3284 19.5 18.5C19.5 17.6716 18.8284 17 18 17Z" fill="#FFA500" />
                                        </svg>

                                        {/* Product Count Badge */}
                                        {itemCount > 0 && (
                                            <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                                {itemCount}
                                            </span>
                                        )}
                                    </div>

                                </NavLink>
                            </li>



                            {/* Profile Dropdown */}
                            {userName && userId && (

                                <li className='group max-lg:border-b max-lg:px-3 max-lg:py-3 relative py-0 px-1 ml-16'>

                                    <NavLink to='#'
                                        className='hover:text-[#007bff] hover:fill-[#007bff] text-[15px] text-sm font-medium whitespace-nowrap focus:outline-none text-gray-600 flex items-center mt-4'>
                                        {/* <img
                                            src='../main_photo.png'
                                            alt="Profile"
                                            className="w-12 h-12 rounded-full object-contain mr-2"
                                        /> */}
                                        {userName}
                                    </NavLink>
                                    <ul
                                        className='absolute top-12 max-lg:top-8 left-0 z-50 block space-y-2 shadow-lg bg-white max-h-0 overflow-hidden min-w-[180px] group-hover:opacity-100 group-hover:max-h-[700px] px-6 group-hover:pb-4 group-hover:pt-0 transition-all duration-50'>
                                        <li className='border-b py-3'>
                                            <NavLink to='/customer/orders'
                                                className='hover:text-[#007bff] hover:fill-[#007bff] text-gray-600 font-semibold text-[15px] block mt-4'>
                                                Your Orders
                                            </NavLink>
                                        </li>
                                        <li className='border-b py-3'>
                                            <NavLink to='#'
                                                className='hover:text-[#007bff] hover:fill-[#007bff] text-gray-600 font-semibold text-[15px] block' onClick={handleLogout}>
                                                Logout
                                            </NavLink>
                                        </li>
                                    </ul>
                                </li>
                            )}
                        </ul>
                    </div>

                </div>
            </nav>
        </div>
    );
}

export default Navbar;