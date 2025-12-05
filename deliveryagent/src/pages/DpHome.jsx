import React, { useState, useEffect } from "react";
import Failed from "../components/Failed";
import Success from "../components/Success";
import Breadcrumbs from "../components/Breadcrumbs";
import { useNavigate } from "react-router-dom";

const DpHome = () => {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("tab1");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
    const [errorModalMessage, setErrorModalMessage] = useState("");

    const [isDlvCode, setIsDelvCode] = useState(false);
    const [otp, setOtp] = useState("");

    const [tab1, setTab1] = useState(true);
    const [tab2, setTab2] = useState(false);
    const [tab3, setTab3] = useState(false);

    const tabs = [
        { id: "tab1", label: "Orders" },
        { id: "tab2", label: "Completed Orders" },
        { id: "tab3", label: "Logout" }
    ];

    const setTab = async (tabId) => {
        setTab1(false);
        setTab2(false);

        setActiveTab(tabId);

        if (tabId === "tab1")
            setTab1(true);
        else if (tabId === "tab2")
            setTab2(true);
        else if (tabId === "tab3") {
            setTab3(true);
            dpLogout();
        }
    }


    const dpLogout = async () => {
        const response = await fetch("http://localhost:5000/delivery-partner/logout", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        })

        const isLoggedOut = await response.json();

        if (isLoggedOut) {
            localStorage.removeItem("isDpLoggedIn");
            localStorage.removeItem("dpAuthToken");
            localStorage.removeItem("dpId");
            localStorage.removeItem("dpName");

            navigate("/login");
        }
    }


    const [pOrders, setPOrders] = useState([]);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [readyOrders, setReadyOrders] = useState([]);

    const [outOrders, setOutOrders] = useState([]);
    const [completedOrders, setCompletedOrders] = useState([]);


    const fetchOrders = async () => {
        const response = await fetch("http://localhost:5000/admin/dashboard/orders");

        const orders = await response.json();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let allProcessedOrders = [];

        orders.forEach((customer) => {
            const recentOrders = customer.allOrders.filter((order) => {
                const orderDate = new Date(order.createdAt);
                return orderDate >= today;
            });

            recentOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            const processedOrders = recentOrders.map((order, index) => ({
                ...order,
                customerId: customer.customerId,
            }));

            allProcessedOrders = [...allProcessedOrders, ...processedOrders];
        });


        allProcessedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const totalOrders = allProcessedOrders.length;
        allProcessedOrders = allProcessedOrders.map((order, index) => ({
            ...order,
            order_number: totalOrders - index,
        }));


        // Filter orders by status
        const dpId = localStorage.getItem("dpId");

        const pndngOrders = allProcessedOrders.filter((order) => order.orderStatus === "Pending");
        const rdOrders = allProcessedOrders.filter((order) => order.orderStatus === "Ready for pickup");

        const ofdOrders = allProcessedOrders.filter((order) => order.orderStatus === "Out for delivery" && order.da_id === dpId);
        const cmpltdOrders = allProcessedOrders.filter((order) => order.orderStatus === "Delivered" && order.da_id === dpId);

        setPOrders(allProcessedOrders);

        setPendingOrders(pndngOrders);
        setReadyOrders(rdOrders);

        setOutOrders(ofdOrders);
        setCompletedOrders(cmpltdOrders);
    }


    useEffect(() => {
        fetchOrders();
    }, []);


    const showOrder = async (order_id) => {
        const order = pOrders.find((o) => o._id === order_id);
        setSelectedOrder(order);

        const data = localStorage.getItem('orderDelvCred');
        const orderCreds = JSON.parse(data);

        if (orderCreds) {
            if (orderCreds.oId === order._id) {
                setIsDelvCode(true);
            } else {
                setIsDelvCode(false);
            }
        } else {
            setIsDelvCode(false);
        }

        setIsModalOpen(true);
    };

    const closeOrderDetails = () => {
        setIsModalOpen(false)

        setOtp("");
    }


    const updateOrderStatus = async (orderId, customerId, stts) => {
        console.log(orderId, customerId, stts);

        const order = {
            order_id: orderId,
            customer_id: customerId,
            status: stts
        }

        const response = await fetch('http://localhost:5000/admin/dashboard/orders/approve', {
            method: 'POST',
            // credentials: "include",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(order)
        });

        const data = await response.json();

        if (data.message === "success") {
            setIsModalOpen(false);

            if (stts === "Approved")
                setModalMessage("The order has been approved successfully!");
            else if (stts === "Ready for pickup")
                setModalMessage("The order is now ready for pickup");
            else if (stts === "Out for delivery")
                setModalMessage("Order pickup successful");
            else if (stts === "Delivered")
                setModalMessage("Delivery successful");

            setIsModalVisible(true);
        } else if (data.message === "unsuccessful") {
            setIsModalOpen(false);

            if (stts === "Approved")
                setErrorModalMessage("Failed to approve the order. Please try again.");
            else if (stts === "Ready for pickup")
                setErrorModalMessage("Failed to update the order. Please try again.");
            else if (stts === "Out for delivery")
                setErrorModalMessage("Failed to update the order. Please try again.");
            else if (stts === "Delivered")
                setErrorModalMessage("Delivery failed");

            setIsErrorModalVisible(true);
        }
    }


    const closeModal = () => {
        setIsModalVisible(false);

        fetchOrders();
    };

    const closeErrorModal = () => {
        setIsErrorModalVisible(false);

        fetchOrders();
    };


    const generateOtp = async (o_id, cust_id) => {

        const token = localStorage.getItem('dpAuthToken');

        const order = {
            order_id: o_id,
            customer_id: cust_id,
            dp_auth_token: token
        }

        const response = await fetch('http://localhost:5000/delivery/initiate', {
            method: 'POST',
            // credentials: "include",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(order)
        });

        const data = await response.json();

        console.log(data);

        localStorage.setItem("orderDelvCred", JSON.stringify(data));

        setIsDelvCode(true);
    }


    const submitOtp = (o_id, cust_id) => {

        const data = localStorage.getItem("orderDelvCred");
        const dlvCreds = JSON.parse(data);

        const otpNum = Number(otp);

        if (dlvCreds.code === otpNum && dlvCreds.oId === o_id && dlvCreds.custId === cust_id) {
            updateOrderStatus(o_id, cust_id, "Delivered");

            setIsDelvCode(false);
            setOtp("");
            localStorage.removeItem('orderDelvCred');
        }
    };

    return (
        <div className="text-xs">
            <div className="px-0 sm:px-0 space-y-0">
                {/* Breadcrumbs */}
                <Breadcrumbs />

                {/* Tabs */}
                <div className="bg-gray-50 shadow-md rounded-lg">
                    <div className="p-2 flex overflow-auto space-x-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setTab(tab.id)}
                                className={`px-6 py-2 text-sm font-medium transition-all ${activeTab === tab.id
                                    ? "bg-blue-500 text-white shadow-lg"
                                    : "text-gray-600 hover:bg-gray-100"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* First Tab: Out for Delivery Orders */}
                {tab1 && (
                    <div>
                        {outOrders.length === 0 ? (
                            <p className="text-center py-4 text-gray-500 text-lg font-semibold bg-gray-100 border border-gray-300 rounded-lg shadow-md">
                                No orders to deliver.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white rounded-lg shadow-md">
                                    <thead>
                                        <tr className="bg-gray-100 text-left">
                                            <th className="py-2 px-2">No.</th>
                                            <th className="py-2 px-2">Name</th>
                                            <th className="py-2 px-2">Phone</th>
                                            <th className="py-2 px-2">Address</th>
                                            <th className="py-2 px-2">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {outOrders.map((order) => (
                                            <tr
                                                key={order.order_number}
                                                className="border-t hover:bg-gray-50"
                                            >
                                                <td className="py-2 pl-2">{order.order_number}</td>
                                                <td className="py-2 px-1">{order.customerName}</td>
                                                <td className="py-2 px-1">
                                                    {order.phone?.toString().slice(2)}
                                                </td>
                                                <td className="py-2 px-1 text-yellow-600">
                                                    {order.deliveryAddress}
                                                </td>
                                                <td className="py-2 px-2">
                                                    <button
                                                        onClick={() => showOrder(order._id)}
                                                        className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition"
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}



                {/* Second Tab: For completed Orders */}
                {tab2 && (
                    <div>
                        {completedOrders.length === 0 ? (
                            <p className="text-center py-4 text-gray-500 text-lg font-semibold bg-gray-100 border border-gray-300 rounded-lg shadow-md">
                                📦 No orders for today.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white rounded-lg shadow-md">
                                    <thead>
                                        <tr className="bg-gray-100 text-left">
                                            <th className="py-2 px-2">No.</th>
                                            <th className="py-2 px-2">Name</th>
                                            <th className="py-2 px-2">Phone</th>
                                            <th className="py-2 px-2">Address</th>
                                            <th className="py-2 px-2">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {completedOrders.map((order) => (
                                            <tr
                                                key={order.order_number}
                                                className="border-t hover:bg-gray-50"
                                            >
                                                <td className="py-2 pl-2">{order.order_number}</td>
                                                <td className="py-2 px-1">{order.customerName}</td>
                                                <td className="py-2 px-1">
                                                    {order.phone?.toString().slice(2)}
                                                </td>
                                                <td className="py-2 px-1 text-yellow-600">
                                                    {order.deliveryAddress}
                                                </td>
                                                <td className="py-2 px-2">
                                                    <button
                                                        onClick={() => showOrder(order._id)}
                                                        className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition"
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Modal */}
                {isModalOpen && selectedOrder && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4 sm:px-8">
                        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 overflow-auto">
                            <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Order Details</h2>

                            <div className="space-y-4">
                                {/* Key-Value Pair Layout */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="font-medium text-gray-600">Customer Name:</div>
                                    <div className="text-gray-800">{selectedOrder.customerName}</div>

                                    <div className="font-medium text-gray-600">Customer Phone:</div>
                                    <div className="text-gray-800">{selectedOrder.phone?.toString().slice(2)}</div>

                                    <div className="font-medium text-gray-600">Order No.:</div>
                                    <div className="text-gray-800">{selectedOrder.order_number}</div>

                                    <div className="font-medium text-gray-600">Order Time:</div>
                                    <div className="text-gray-800">
                                        {new Date(selectedOrder.createdAt).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </div>

                                    <div className="font-medium text-gray-600">Delivery Address:</div>
                                    <div className="text-gray-800">{selectedOrder.deliveryAddress}</div>

                                    <div className="font-medium text-gray-600">Items:</div>
                                    <div className="text-gray-800">
                                        <ul className="list-disc pl-5">
                                            {selectedOrder.items.map((item, itemIndex) => (
                                                <li key={itemIndex}>
                                                    {item.item_name} (x{item.quantity})
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="font-medium text-gray-600">Order Status:</div>
                                    <div className="text-gray-800">{selectedOrder.orderStatus}</div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-6 flex flex-wrap gap-3 justify-between">

                                    {isDlvCode && (
                                        <div>
                                            <h2 className="text-base font-semibold text-gray-700 mb-3 text-center">
                                                Enter OTP to Proceed
                                            </h2>
                                            <div className="flex space-x-2">
                                                <input
                                                    type="number"
                                                    placeholder="Enter OTP"
                                                    maxLength="4"
                                                    className="w-full px-4 py-1 text-lg border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4 appearance-none"
                                                    style={{
                                                        appearance: 'none',
                                                        MozAppearance: 'textfield',
                                                        WebkitAppearance: 'none',
                                                    }}
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value)}
                                                />


                                                <button
                                                    onClick={() => generateOtp(selectedOrder._id, selectedOrder.customerId)}
                                                    className="w-full bg-blue-500 text-white py-2 px-4 text-base font-semibold rounded-md shadow-md hover:bg-blue-600 transition focus:outline-none focus:ring-2 focus:ring-blue-300 mb-4"
                                                >
                                                    Resend
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => submitOtp(selectedOrder._id, selectedOrder.customerId)}
                                                className="w-full bg-blue-500 text-white py-2 px-6 text-base font-semibold rounded-md shadow-md hover:bg-blue-600 transition focus:outline-none focus:ring-2 focus:ring-blue-300"
                                            >
                                                Submit OTP
                                            </button>
                                        </div>
                                    )}


                                    {tab1 && !isDlvCode && (
                                        <button
                                            onClick={() => generateOtp(selectedOrder._id, selectedOrder.customerId)}
                                            className="bg-blue-500 text-white w-full sm:w-auto px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition text-lg"
                                        >
                                            Initiate Delivery
                                        </button>
                                    )}


                                    <button
                                        onClick={() => closeOrderDetails(false)}
                                        className="bg-red-500 text-white w-full sm:w-auto px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition text-lg"
                                    >
                                        Close
                                    </button>

                                </div>
                            </div>
                        </div>
                    </div>

                )}
            </div>


            <Success
                show={isModalVisible}
                message={modalMessage}
                onClose={closeModal}
            />

            <Failed
                show={isErrorModalVisible}
                message={errorModalMessage}
                onClose={closeErrorModal}
            />

        </div>
    );
};

export default DpHome;
