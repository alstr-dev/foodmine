import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

const LoginForm = () => {
    const navigate = useNavigate();

    const isDpLoggedIn = JSON.parse(localStorage.getItem("isDpLoggedIn"));

    const checkIsLoggedIn = () => {
        if (isDpLoggedIn) {
            navigate("/");
        }
    }

    useEffect(() => {
        checkIsLoggedIn();
    }, [])

    const [isOtpSent, setIsOtpSent] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(true);
    const [countdown, setCountdown] = useState(60);
    const [disableRqstOtp, setDisableRqstOtp] = useState(false);

    const {
        register,
        handleSubmit,
        getValues,
        setValue,
        trigger,
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


    const requestOtp = async () => {
        const isValid = await trigger("email");

        if (isValid) {
            setDisableRqstOtp(true);
            setResendDisabled(true);

            const dpEmail = getValues("email");

            let response = await fetch('http://localhost:5000/delivery/login/request-otp', {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: dpEmail })
            });

            let result = await response.json();

            if (result.value) {
                setIsOtpSent(true);
                setValue("email", dpEmail);
                localStorage.setItem('loginOtp', result.otp);
            } else {
                console.log("Failed to send OTP");
            }
        }
    }


    const verifyOtp = async () => {
        const ogOtp = localStorage.getItem("loginOtp");
        const dpOtp = getValues("otp");

        if (ogOtp === dpOtp) {
            localStorage.removeItem("loginOtp");

            const response = await fetch("http://localhost:5000/delivery/login/submit-otp", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            })

            const result = await response.json();

            if (result.value === 1) {
                localStorage.setItem('dpAuthToken', result.tkn);
                localStorage.setItem('dpName', result.name);
                localStorage.setItem('dpId', result.id);

                localStorage.setItem("isDpLoggedIn", JSON.stringify(true));

                navigate("/");
            } else if (result === 2) {
                console.log("OTP expired");
            } else {
                localStorage.setItem('dpAuthToken', false);
                localStorage.setItem('dpName', false);
                localStorage.setItem('dpId', false);
            }
        }
    }


    const onSubmit = async (data) => {

    }


    return (
        <div className="flex min-h-fit bg-gray-50">
            <div className="mt-40 mb-6 flex flex-col justify-center w-full max-w-md p-8 mx-auto bg-white rounded-lg shadow-lg md:w-1/2 lg:w-1/3">
                <h2 className="mb-6 text-2xl font-semibold text-center text-gray-800">Delivery Login</h2>
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

                    {isOtpSent ? (
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-600">
                                OTP
                            </label>
                            <input
                                type="text"
                                id="otp"
                                className="w-full px-4 py-2 mt-2 text-gray-700 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Enter OTP"
                                {...register("otp",
                                    {
                                        required: { value: true, message: "OTP must not be empty" },
                                        minLength: { value: 4, message: "OTP must be 4 digits long" },
                                        maxLength: { value: 4, message: "OTP must be 4 digits long" }
                                    })
                                }
                            />
                            {errors.otp && <p class="text-xs text-red-500 flex items-center mt-2">{errors.otp.message}</p>}

                            <div className='flex space-x-4'>

                                <button
                                    type="button"
                                    disabled={resendDisabled} // Disabled until countdown ends
                                    onClick={requestOtp} // Resend OTP request
                                    className={`mt-4 px-4 w-3/6 py-2 rounded-md transition duration-300 ${resendDisabled
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-yellow-500 text-white hover:bg-yellow-600"
                                        }`}
                                >
                                    Resend OTP ({countdown}s)
                                </button>

                                <button
                                    // type="submit"
                                    onClick={verifyOtp}
                                    className="mt-4 w-3/6 px-4 py-2 text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:bg-indigo-700"
                                >
                                    Submit OTP
                                </button>
                            </div>
                        </div>

                    ) :
                        <button
                            // type="submit"
                            disabled={disableRqstOtp}
                            onClick={requestOtp}
                            className={`w-full px-4 py-2
                                ${disableRqstOtp
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:bg-indigo-700 text-white"
                                }`}
                        >
                            Request OTP
                        </button>
                    }
                </form>
            </div>
        </div>
    );
};

export default LoginForm;