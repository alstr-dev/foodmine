import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import FailureModal from "../FailureModal";
import SuccessModal from "../SuccessModal";

function SignupForm() {

    const navigate = useNavigate();

    const [isFailureModalOpen, setFailureModalOpen] = useState(false);
    const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
    const [failMsg, setFailMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const handleOpenFailureModal = () => setFailureModalOpen(true);
    const handleCloseFailureModal = () => setFailureModalOpen(false);

    const handleOpenSuccessModal = () => setSuccessModalOpen(true);
    const handleCloseSuccessModal = () => {
        setSuccessModalOpen(false)

        navigate("/customer/login");
    };

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm();


    const onSubmit = async (data) => {
        let response = await fetch('http://localhost:5000/usersignup', {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            let result = await response.json();

            if (result.value === 1) {
                setSuccessMsg("Registration successfull")
                handleOpenSuccessModal();
            } else if (result.value === 2) {
                setFailMsg(result.message);
                handleOpenFailureModal();

            } else if (result.value === 3) {
                setFailMsg(result.message);
                handleOpenFailureModal();
            }
        } else {
            console.error("Failed to sign up:", response.status, response.statusText);
        }
    }


    return (
        <div className="font-[sans-serif]">

            <div
                className="text-center from-blue-800 to-blue-400 min-h-[160px] sm:p-6 p-4 bg-[url('https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1965&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center">
            </div>


            <div className="mx-4 mb-4 -mt-16">
                <form id="signup"
                    className="max-w-4xl mx-auto bg-white shadow-[0_2px_13px_-6px_rgba(0,0,0,0.4)] sm:p-8 p-4 rounded-md"
                    action="/usersignup" method="post" onSubmit={handleSubmit(onSubmit)}>


                    <div
                        className="my-8 flex items-center before:mt-0.5 before:flex-1 before:border-neutral-300 after:mt-0.5 after:flex-1 after:border-neutral-300">
                        <p className="mx-4 text-center">
                            Create new account
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
                        <div>
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
                        </div>
                    </div>
                    <div className="mt-8">
                        <button type="submit"
                            className="py-3 px-6 text-sm tracking-wider font-semibold rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none">
                            Sign up
                        </button>
                    </div>

                    <div
                        className="my-8 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-neutral-300 after:mt-0.5 after:flex-1 after:border-t after:border-neutral-300">
                        <p className="mx-4 text-center">
                            Or
                        </p>
                    </div>

                    <p className="mt-4 text-center text-sm text-gray-600">Allready have an account? <NavLink to="/customer/login"
                        className="text-blue-500 hover:underline">Login</NavLink></p>
                </form>
            </div>


            <FailureModal
                isOpen={isFailureModalOpen}
                onClose={handleCloseFailureModal}
                message={failMsg}
            />


            <SuccessModal
                isOpen={isSuccessModalOpen}
                onClose={handleCloseSuccessModal}
                message={successMsg}
            />
        </div>
    );
}

export default SignupForm;