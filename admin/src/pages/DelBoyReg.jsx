import React, { useState, useEffect } from "react";
import Breadcrumbs from "../components/Breadcrumbs";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Success from "../components/Success";
import Failed from "../components/Failed";
import { useAdmin } from "../AdminContext";

function DelBoyReg() {
    const navigate = useNavigate();

    const { setIsLoggedIn } = useAdmin();
    let intervalId = null;

    function checkLoggedInStatus() {
        if (!intervalId) {
            intervalId = setInterval(async () => {

                try {
                    const response = await fetch("http://localhost:5000/admin/dashboard/loggedin-status", {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                        }
                    })

                    const isLoggedIn = await response.json();

                    if (!isLoggedIn) {
                        setIsLoggedIn(false);
                        stopCheckingLoggedIn();

                        navigate("/admin-login");
                    }
                } catch (error) {
                    console.log(error);
                }

            }, 30000);
        }
    }

    function stopCheckingLoggedIn() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }

    useEffect(() => {
        checkLoggedInStatus();
    }, [])


    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm();

    const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
    const [successModalMessage, setSuccessModalMessage] = useState('');

    const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
    const [errorModalMessage, setErrorModalMessage] = useState('');

    const onSubmit = async (data) => {
        let response = await fetch('http://localhost:5000/admin/dashboard/register/deliveryboy', {
            method: "POST",
            // credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            let isRegistered = await response.json();

            if (isRegistered.value === 1) {
                setIsSuccessModalVisible(true);
                setSuccessModalMessage("Delivery partner registered successfully");
            } else if (isRegistered.value === 2) {
                setIsErrorModalVisible(true);
                setErrorModalMessage("Delivery partner is already registered");
            } else if (isRegistered.value === 3) {
                setIsErrorModalVisible(true);
                setErrorModalMessage("Failed to register delivery partner. Please try after some time");
            }
        } else {
            console.error("Failed to sign up:", response.status, response.statusText);
        }
    }


    const closeSuccessModal = () => {
        setSuccessModalMessage('');
        setIsSuccessModalVisible(false);

        navigate("/delivery-partners");
    }

    const closeErrorModal = () => {
        setErrorModalMessage('');
        setIsErrorModalVisible(false);
    }

    return (
        <div>
            <Breadcrumbs />
            <div className="font-[sans-serif]  min-h-screen px-2 ml-1">
                <div className="mb-4 mt-24">
                    <form id="signup"
                        className="max-w-4xl mx-auto bg-white shadow-[0_2px_13px_-6px_rgba(0,0,0,0.4)] sm:p-8 p-4 rounded-md"
                        action="/usersignup" method="post" onSubmit={handleSubmit(onSubmit)}>

                        <div
                            className="my-8 flex items-center before:mt-0.5 before:flex-1 before:border-neutral-300 after:mt-0.5 after:flex-1 after:border-neutral-300">
                            <p className="mx-4 text-center">
                                Register new delivery partner
                            </p>
                        </div>



                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <label className="text-gray-800 text-sm mb-2 block">First Name</label>
                                <input
                                    type="text"
                                    className="bg-gray-100 focus:bg-transparent w-full text-sm text-gray-800 px-4 py-3 rounded-md outline-blue-500 transition-all"
                                    placeholder="Enter first name"

                                    {...register("fname",
                                        {
                                            required: { value: true, message: "First name must not be empty" },
                                            minLength: { value: 3, message: "First name must be 3 characters long" },
                                            maxLength: { value: 50, message: "First name must be under length of 50 characters" }
                                        })
                                    }
                                />
                                {errors.fname && <p class="text-xs text-red-500 flex items-center mt-2">{errors.fname.message}</p>}
                            </div>
                            <div>
                                <label className="text-gray-800 text-sm mb-2 block">Last Name</label>
                                <input type="text" {...register("lname",
                                    {
                                        required: { value: true, message: "Last name must not be empty" },
                                        minLength: { value: 3, message: "Last name must be 3 characters long" },
                                        maxLength: { value: 50, message: "Last name must be under length of 50 characters" }
                                    })
                                }
                                    className="bg-gray-100 focus:bg-transparent w-full text-sm text-gray-800 px-4 py-3 rounded-md outline-blue-500 transition-all"
                                    placeholder="Enter last name" />
                                {errors.lname && <p class="text-xs text-red-500 flex items-center mt-2">{errors.lname.message}</p>}
                            </div>
                            <div>
                                <label className="text-gray-800 text-sm mb-2 block">Email Id</label>
                                <input type="text" id="email" {...register("email",
                                    {
                                        pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: "Invalid email id" },
                                        required: { value: true, message: "Email id must not be empty" },
                                        minLength: { value: 3, message: "Email id must be 3 characters long" },
                                        maxLength: { value: 50, message: "Email id must be under length of 50 characters" }
                                    })
                                }
                                    className="bg-gray-100 focus:bg-transparent w-full text-sm text-gray-800 px-4 py-3 rounded-md outline-blue-500 transition-all"
                                    placeholder="Enter email id" />
                                {errors.email && <p class="text-xs text-red-500 flex items-center mt-2">{errors.email.message}</p>}
                            </div>
                            <div>
                                <label className="text-gray-800 text-sm mb-2 block">Mobile No.</label>
                                <input id="phone" type="number" {...register("phone",
                                    {
                                        pattern: { value: /^(\+91[\s-]?)?[6-9]\d{9}$/, message: "Invalid phone number" },
                                        required: { value: true, message: "Phone number must not be empty" },
                                        minLength: { value: 10, message: "Phone number must be 10 digits long" },
                                        maxLength: { value: 10, message: "Phone number must be 10 digits long" }
                                    })
                                }
                                    className="bg-gray-100 focus:bg-transparent w-full text-sm text-gray-800 px-4 py-3 rounded-md outline-blue-500 transition-all"
                                    placeholder="Enter phone number" />
                                {errors.phone && <p class="text-xs text-red-500 flex items-center mt-2">{errors.phone.message}</p>}
                            </div>
                            {/* <div>
                            <label className="text-gray-800 text-sm mb-2 block">Password</label>
                            <input type="password" {...register("password",
                                {
                                    required: { value: true, message: "Password must not be empty" },
                                    minLength: { value: 4, message: "Password must be 4 characters long" },
                                    maxLength: { value: 10, message: "Password must be under length of 10 characters" }
                                })
                            }
                                className="bg-gray-100 focus:bg-transparent w-full text-sm text-gray-800 px-4 py-3 rounded-md outline-blue-500 transition-all"
                                placeholder="Enter password" />
                            {errors.password && <p class="text-xs text-red-500 flex items-center mt-2">{errors.password.message}</p>}
                        </div>
                        <div>
                            <label className="text-gray-800 text-sm mb-2 block">Confirm Password</label>
                            <input type="password" {...register("cpassword",
                                {
                                    required: { value: true, message: "Confirm password must not be empty" },
                                    minLength: { value: 4, message: "Confirm password must be 4 characters long" },
                                    maxLength: { value: 10, message: "Confirm password must be under length of 10 characters" },
                                    validate: value => value === getValues("password") || "Passwords do not match."
                                })
                            }
                                className="bg-gray-100 focus:bg-transparent w-full text-sm text-gray-800 px-4 py-3 rounded-md outline-blue-500 transition-all"
                                placeholder="Enter cpassword" />
                            {errors.cpassword && <p class="text-xs text-red-500 flex items-center mt-2">{errors.cpassword.message}</p>}
                        </div> */}
                        </div>
                        <div className="mt-8">
                            <button type="submit"
                                className="py-3 px-6 text-sm tracking-wider font-semibold rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none">
                                Register
                            </button>
                        </div>

                    </form>
                </div>
            </div>


            {/* Success Modal */}
            <Success
                show={isSuccessModalVisible}
                message={successModalMessage}
                onClose={closeSuccessModal}
            />

            {/* Error Modal */}
            <Failed
                show={isErrorModalVisible}
                message={errorModalMessage}
                onClose={closeErrorModal}
            />
        </div>
    );
}

export default DelBoyReg;