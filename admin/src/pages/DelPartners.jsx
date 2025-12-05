import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import { PlusIcon } from "@heroicons/react/24/outline";
import Success from "../components/Success";
import Failed from "../components/Failed";
import { useAdmin } from "../AdminContext";

const DelPartners = () => {
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


    const [deliveryAgents, setDeliveryAgents] = useState([]);

    const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
    const [successModalMessage, setSuccessModalMessage] = useState('');

    const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
    const [errorModalMessage, setErrorModalMessage] = useState('');

    const fetchDeliveryAgents = async () => {
        const response = await fetch("http://localhost:5000/admin/dashboard/delivery-agents");

        const dAgents = await response.json();

        setDeliveryAgents(dAgents);
    }

    useEffect(() => {
        fetchDeliveryAgents();
    }, []);


    const deleteDp = async (dp_id) => {
        try {
            const response = await fetch("http://localhost:5000/admin/dashboard/delivery-partners/delete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ dpId: dp_id })
            })

            const isDeleted = await response.json();

            if (isDeleted.value === 1) {
                fetchDeliveryAgents();

                setSuccessModalMessage(`Deleivery partner: ${isDeleted.name} deleted successfully`);
                setIsSuccessModalVisible(true);
            } else if (isDeleted.value === 2) {
                setErrorModalMessage(`Failed to delete delivery partner. Please try after sometime`);
                setIsErrorModalVisible(true);
            }
        } catch (error) {

        }
    }


    const closeSuccessModal = () => {
        setSuccessModalMessage('');
        setIsSuccessModalVisible(false);
    }

    const closeErrorModal = () => {
        setErrorModalMessage('');
        setIsErrorModalVisible(false);
    }


    return (
        <div>
            <Breadcrumbs />

            <div className="p-4 pt-1 bg-gray-100 min-h-screen ml-1">
                <Link
                    to="/delivery-partners/register-new"
                    className="flex items-center gap-3 hover:bg-gray-700 p-3 rounded-md transition-all duration-200 group w-1/6 mt-2 mb-2"
                >
                    <PlusIcon className="h-6 w-6 text-gray-800 group-hover:text-white font-medium" />
                    <span className="text-gray-800 group-hover:text-white font-medium">
                        Register New
                    </span>
                </Link>

                <div className="overflow-x-auto">
                    <table className="table-auto w-full bg-white shadow-md rounded-lg">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-4 py-2 text-left text-gray-200 font-semibold">Name</th>
                                <th className="px-4 py-2 text-left text-gray-200 font-semibold">Email</th>
                                <th className="px-4 py-2 text-left text-gray-200 font-semibold">Phone</th>
                                <th className="px-4 py-2 text-left text-gray-200 font-semibold">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deliveryAgents.length > 0 ? (
                                deliveryAgents.map((partner, index) => (
                                    <tr
                                        key={index}
                                        className="bg-gray-100"
                                    >
                                        <td className="px-4 py-2 text-gray-800">{partner.first_name + ' ' + partner.last_name}</td>
                                        <td className="px-4 py-2 text-gray-800">{partner.dp_email}</td>
                                        <td className="px-4 py-2 text-gray-800">{partner.dp_phone}</td>
                                        <td className="px-4 py-2 text-gray-800">
                                            <button
                                                onClick={() => deleteDp(partner._id)}
                                                className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="px-4 py-4 text-center text-gray-500">
                                        No delivery partners registered
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
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

export default DelPartners;