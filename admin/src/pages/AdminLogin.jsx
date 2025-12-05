import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../AdminContext";

const AdminLogin = () => {
    const navigate = useNavigate();

    const { isLoggedIn, setIsLoggedIn } = useAdmin();

    if (isLoggedIn) {
        // navigate("/");
        navigate("/orders");
    }

    const [step, setStep] = useState(1);
    const [resendDisabled, setResendDisabled] = useState(true);
    const [countdown, setCountdown] = useState(60);
    const [disableRqstOtp, setDisableRqstOtp] = useState(false);

    const {
        register,
        trigger,
        handleSubmit,
        setValue,
        getValues,
        formState: { errors },
    } = useForm();

    useEffect(() => {
        let timer;
        if (resendDisabled) {
            timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setResendDisabled(false);
                        return 60;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendDisabled]);


    const handleRequestOtp = async () => {
        try {
            const isValid = await trigger("email");

            if (isValid) {
                setDisableRqstOtp(true);
                setResendDisabled(true);

                const adminEmail = getValues("email");

                const response = await fetch("http://localhost:5000/admin/dashboard/login/step-1", {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email: adminEmail }),
                });

                const resData = await response.json();
                if (response.ok) {
                    setValue("email", adminEmail);
                    setStep(2);
                    // setResendDisabled(true);
                } else {
                    console.log("Error:", resData.message);
                }
            }
        } catch (error) {
            console.log("Error:", error);
        }
    };


    const handleSubmitOtp = async (data) => {
        try {
            const response = await fetch("http://localhost:5000/admin/dashboard/login/step-2", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: data.email, otp: data.otp }),
            });

            const resData = await response.json();

            if (resData.value === 1) {
                console.log("Login successful", resData);

                setIsLoggedIn(true);

                checkLoggedInStatus();

                // navigate("/");
                navigate("/orders");
            } else {
                console.error("Error:", resData.message);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };


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


    return (
        <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-orange-300 to-orange-500 overflow-hidden">

            <div className="absolute top-[-50px] left-[-50px] w-96 h-96 z-0 opacity-80">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <path
                        fill="#FFD700"
                        d="M42.1,-72.6C54.4,-65.4,62.6,-54.2,65.9,-42.8C69.2,-31.5,67.5,-19.9,67.3,-8.6C67,2.6,68.2,13.5,65.2,25.3C62.2,37.1,54.9,49.7,45.1,55.2C35.3,60.7,23.1,59.1,12.1,57.1C1.1,55,-8.7,52.6,-21.2,49.1C-33.7,45.5,-49,40.7,-56.2,31.9C-63.4,23.1,-62.5,10.3,-66.5,-4.5C-70.6,-19.3,-79.6,-35.9,-75.4,-45.3C-71.3,-54.8,-53.9,-57.1,-40.1,-63.5C-26.2,-69.8,-13.1,-80.2,-0.7,-79.4C11.7,-78.6,23.4,-66.8,42.1,-72.6Z"
                        transform="translate(100 100)"
                    />
                </svg>
            </div>
            <div className="absolute bottom-[-50px] right-[-50px] w-96 h-96 z-0 opacity-80">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <path
                        fill="#FF6347"
                        d="M41.8,-72.5C52.7,-65.2,55.4,-47.3,61.7,-34.2C68,-21.2,77.9,-12.9,81.2,-1.7C84.6,9.4,81.4,23.4,73.4,33.1C65.5,42.8,52.7,48.3,41.3,54.8C30,61.3,20.1,68.9,8.2,73.5C-3.7,78.1,-17.6,79.6,-25.6,71.6C-33.6,63.5,-35.7,46,-45.4,33.5C-55.1,21,-72.5,13.5,-76.2,3.8C-79.9,-5.9,-69.9,-17.7,-62.8,-28.2C-55.8,-38.8,-51.6,-48.2,-43.2,-55.2C-34.8,-62.2,-22.2,-66.7,-8.2,-67.5C5.7,-68.2,11.3,-65.3,21.8,-63.6C32.4,-62,46.8,-61.7,41.8,-72.5Z"
                        transform="translate(100 100)"
                    />
                </svg>
            </div>


            {/* <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md relative"> */}
            <div className="bg-transparent rounded-lg p-8 w-full max-w-md relative">
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
                    Admin Dashboard Login
                </h2>
                <form className="space-y-4">
                    {/* Email Field */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-600">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            placeholder="Enter your email"
                            disabled={step === 2} // Disable input if on Step 2
                            className="w-full mt-1 px-4 py-2 bg-gray-100 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                    message: "Enter a valid email address",
                                },
                            })}
                        />
                        {errors.email ? (
                            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                        ) : (<p className="mt-2 h-4"></p>)}
                    </div>

                    {/* OTP Field (Visible only on Step 2) */}
                    {step === 2 && (
                        <div>
                            <label htmlFor="otp" className="block text-sm font-medium text-gray-600">
                                Enter OTP
                            </label>
                            <input
                                type="text"
                                id="otp"
                                placeholder="Enter the OTP sent to your email"
                                className="w-full mt-1 px-4 py-2 bg-gray-100 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                {...register("otp", {
                                    required: "OTP is required",
                                    minLength: {
                                        value: 4,
                                        message: "OTP must be 4 characters long",
                                    },
                                })}
                            />
                            {errors.otp ? (
                                <p className="text-red-500 text-sm mt-1">{errors.otp.message}</p>
                            ) : (<p className="mt-2 h-4"></p>)}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex justify-between">
                        {step === 1 ? (
                            <button
                                type="button"
                                disabled={disableRqstOtp}
                                onClick={handleRequestOtp} // Submit email for OTP request
                                className={`px-4 py-2 rounded-md font-semibold w-full
                                    ${disableRqstOtp
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-blue-500 text-white hover:bg-blue-600 transition duration-300"
                                    }`}
                            >
                                Request OTP
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    disabled={resendDisabled} // Disabled until countdown ends
                                    onClick={handleRequestOtp} // Resend OTP request
                                    className={`px-4 py-2 rounded-md font-semibold transition duration-300 ${resendDisabled
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-yellow-500 text-white hover:bg-yellow-600"
                                        }`}
                                >
                                    Resend OTP ({countdown}s)
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmit(handleSubmitOtp)} // Submit OTP for verification
                                    className="bg-green-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-600 transition duration-300"
                                >
                                    Submit OTP
                                </button>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
