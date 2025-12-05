import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useUser } from '../../UserContext';
import FailureModal from '../FailureModal';


const LoginForm = () => {
    const { setUserName, setUserId, setUserType, setUserPhone, setEmailId } = useUser(null);
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');

    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm();


    const onSubmit = async (data) => {

        let response = await fetch('http://localhost:5000/customerlogin', {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            let result = await response.json();

            if (result.value === 1) {
                localStorage.setItem("user_id", JSON.stringify(result.id));
                setUserName(result.name);
                setUserId(result.id);
                setUserType("customer");
                setEmailId(result.email);
                setUserPhone(result.phone);

                navigate("/customer/ordernow");
            } else {
                console.log("Invalid creds");

                setMessage("Invalid credentials");
                setIsOpen(true);
            }
        } else {
            setMessage("Invalid credentials");
            setIsOpen(true);
            console.error("Failed to login:", response.status, response.statusText);
        }
    }


    const onClose = () => {
        setIsOpen(false);
    }


    return (
        <div className="flex justify-center bg-gray-50" style={{ height: '600px' }}>
            <div className='flex md:w-1/2 lg:w-1/2 shadow-lg mt-6 mb-6'>
                <div className='w-1/3 pl-6 pt-6 pr-2 text-white' style={{ backgroundColor: '#2874f0' }}>
                    <h1 className='text-3xl font-bold'>Login</h1>
                    <p className='mt-4'>Get access to your Orders, Wishlist</p>
                </div>
                <div className="mt-6 mb-6 flex flex-col justify-center p-8 mx-auto bg-white md:w-2/3 lg:w-2/3">
                    <h2 className="mb-6 text-2xl font-semibold text-center text-gray-800">Welcome Back!</h2>
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} method='post' action='/userlogin'>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-600">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                className="w-full px-4 py-2 mt-2 text-gray-700 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Enter your email"
                                {...register("email",
                                    {
                                        pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: "Invalid email id" },
                                        required: { value: true, message: "Email id must not be empty" },
                                        minLength: { value: 3, message: "Email id must be 3 characters long" },
                                        maxLength: { value: 50, message: "Email id must be under length of 50 characters" }
                                    })
                                }
                            />
                            {errors.email && <p class="text-xs text-red-500 flex items-center mt-2">{errors.email.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-600">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                className="w-full px-4 py-2 mt-2 text-gray-700 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Enter your password"
                                {...register("password",
                                    {
                                        required: { value: true, message: "Password must not be empty" },
                                        minLength: { value: 4, message: "Password must be 4 characters long" },
                                        maxLength: { value: 10, message: "Password must be under length of 10 characters" }
                                    })
                                }
                            />
                            {errors.password && <p class="text-xs text-red-500 flex items-center mt-2">{errors.password.message}</p>}
                        </div>
                        <button
                            type="submit"
                            className="w-full px-4 py-2 text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:bg-indigo-700"
                            style={{ background: '#fb641b' }}
                        >
                            Sign In
                        </button>
                    </form>

                    <p className="mt-6 text-sm text-center text-gray-600">
                        Don’t have an account? <NavLink to="/new-user/signup" className="text-indigo-500 hover:underline">Sign up</NavLink>
                    </p>
                </div>
            </div>

            <FailureModal
                isOpen={isOpen}
                onClose={onClose}
                message={message}
            />
        </div>
    );
};

export default LoginForm;