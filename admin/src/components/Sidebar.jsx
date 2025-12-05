import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { HomeIcon, ClipboardDocumentListIcon, UserGroupIcon, PlusIcon, Bars3Icon, ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";
import { useAdmin } from "../AdminContext";

const Sidebar = () => {
    const navigate = useNavigate();
    const { isLoggedIn, setIsLoggedIn } = useAdmin();

    const handleLogout = async () => {
        try {
            const response = await fetch("http://localhost:5000/admin/dashboard/logout", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            })

            const isLoggedOut = await response.json();

            if (isLoggedOut) {
                setIsLoggedIn(false);
                navigate("/admin-login");
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="w-64 h-screen bg-gradient-to-br from-gray-800 to-gray-900 text-white flex flex-col justify-between shadow-xl">
            {/* Logo and Title */}
            <div>
                <div className="flex items-center justify-center py-6 border-b border-gray-700">
                    <h2 className="text-2xl font-extrabold text-white">
                        Restaurant Admin
                    </h2>
                </div>

                {/* Navigation Menu */}
                <ul className="mt-6 space-y-2 px-4">
                    {/* <li>
                        <Link
                            to="/"
                            className="flex items-center gap-3 hover:bg-gray-700 p-3 rounded-md transition-all duration-200 group"
                        >
                            <HomeIcon className="h-6 w-6 text-gray-400 group-hover:text-white" />
                            <span className="text-gray-300 group-hover:text-white font-medium">
                                Home
                            </span>
                        </Link>
                    </li> */}
                    <li>
                        <Link
                            to="/orders"
                            className="flex items-center gap-3 hover:bg-gray-700 p-3 rounded-md transition-all duration-200 group"
                        >
                            <ClipboardDocumentListIcon className="h-6 w-6 text-gray-400 group-hover:text-white" />
                            <span className="text-gray-300 group-hover:text-white font-medium">
                                Orders
                            </span>
                        </Link>
                    </li>

                    <li>
                        <Link
                            to="/menu"
                            className="flex items-center gap-3 hover:bg-gray-700 p-3 rounded-md transition-all duration-200 group"
                        >
                            <Bars3Icon className="h-6 w-6 text-gray-400 group-hover:text-white" />
                            <span className="text-gray-300 group-hover:text-white font-medium">
                                Menu
                            </span>
                        </Link>
                    </li>

                    {/* <li>
                        <Link
                            to="/delivery-partners/register-new"
                            className="flex items-center gap-3 hover:bg-gray-700 p-3 rounded-md transition-all duration-200 group"
                        >
                            <UserGroupIcon className="h-6 w-6 text-gray-400 group-hover:text-white" />
                            <span className="text-gray-300 group-hover:text-white font-medium">
                                Delivery Partners
                            </span>
                        </Link>
                    </li> */}

                    <li>
                        <Link
                            to="/delivery-partners"
                            className="flex items-center gap-3 hover:bg-gray-700 p-3 rounded-md transition-all duration-200 group"
                        >
                            <UserGroupIcon className="h-6 w-6 text-gray-400 group-hover:text-white" />
                            <span className="text-gray-300 group-hover:text-white font-medium">
                                Delivery Partners
                            </span>
                        </Link>
                    </li>

                    <li>
                        <Link
                            className="flex items-center gap-3 hover:bg-gray-700 p-3 rounded-md transition-all duration-200 group"
                            onClick={handleLogout}
                        >
                            <ArrowLeftOnRectangleIcon className="h-6 w-6 text-gray-400 group-hover:text-white" />
                            <span className="text-gray-300 group-hover:text-white font-medium">
                                Logout
                            </span>
                        </Link>
                    </li>

                    {/* <li>
                        <Link
                            to="/testpage"
                            className="flex items-center gap-3 hover:bg-gray-700 p-3 rounded-md transition-all duration-200 group"
                        >
                            <Bars3Icon className="h-6 w-6 text-gray-400 group-hover:text-white" />
                            <span className="text-gray-300 group-hover:text-white font-medium">
                                Test Design Page
                            </span>
                        </Link>
                    </li> */}
                </ul>
            </div>

            {/* Footer */}
            <div className="text-center p-4 border-t border-gray-700">
                <p className="text-gray-400 text-sm">&copy; 2024 Restaurant Admin</p>
            </div>
        </div>
    );
};

export default Sidebar;

