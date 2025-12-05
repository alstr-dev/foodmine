import React, { useState, useEffect } from "react";
import Breadcrumbs from "../components/Breadcrumbs";
import Success from "../components/Success";
import Failed from "../components/Failed";
import { div } from "framer-motion/client";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../AdminContext";

const Orders = () => {
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


    const [activeTab, setActiveTab] = useState("tab1");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // For success message Modal
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    const [isErrorModalVisible, setIsErrorModalVisible] = useState(false); // Renamed for clarity
    const [errorModalMessage, setErrorModalMessage] = useState("");

    const [tab1, setTab1] = useState(true);
    const [tab2, setTab2] = useState(false);
    const [tab3, setTab3] = useState(false);
    const [tab4, setTab4] = useState(false);
    const [tab5, setTab5] = useState(false);
    const [tab6, setTab6] = useState(false);

    const tabs = [
        { id: "tab1", label: "New" },
        { id: "tab2", label: "Approved" },
        { id: "tab3", label: "Outlet" },
        { id: "tab4", label: "Delivery" },
        { id: "tab5", label: "Completed" },
        { id: "tab6", label: "All" },
    ];

    const setTab = async (tabId) => {
        setTab1(false);
        setTab2(false);
        setTab3(false);
        setTab4(false);
        setTab5(false);
        setTab6(false);

        setActiveTab(tabId);

        if (tabId === "tab1")
            setTab1(true);
        else if (tabId === "tab2")
            setTab2(true);
        else if (tabId === "tab3")
            setTab3(true);
        else if (tabId === "tab4")
            setTab4(true);
        else if (tabId === "tab5")
            setTab5(true);
        else if (tabId === "tab6")
            setTab6(true);
    }


    const [pOrders, setPOrders] = useState([]);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [approvedOrders, setApprovedOrders] = useState([]);
    const [readyOrders, setReadyOrders] = useState([]);
    const [outOrders, setOutOrders] = useState([]);
    const [deliveredOrders, setDeliveredOrders] = useState([]);

    const [pickupNumber, setPickupNumber] = useState("");

    const [deliveryAgents, setDeliveryAgents] = useState([]);
    const [selectedAgentId, setSelectedAgentId] = useState("");

    const [orderCounts, setOrderCounts] = useState([]);


    const fetchOrders = async () => {
        const response = await fetch("http://localhost:5000/admin/dashboard/orders");

        const orders = await response.json();

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set time to the start of the day

        let allProcessedOrders = [];

        orders.forEach((customer) => {
            // Filter orders from the current date for each customer
            const recentOrders = customer.allOrders.filter((order) => {
                const orderDate = new Date(order.createdAt);
                return orderDate >= today;
            });

            // Sort recent orders by timestamp (most recent first)
            recentOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            // Add customerId and assign order_number in reverse order
            const processedOrders = recentOrders.map((order, index) => ({
                ...order,
                customerId: customer.customerId, // Use the customerId from the current customer
                // order_number: recentOrders.length - index, // Reverse order numbering
            }));

            // Append processed orders to the main list
            allProcessedOrders = [...allProcessedOrders, ...processedOrders];
        });


        // Sort all processed orders by timestamp (most recent first)
        allProcessedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Assign reverse continuous order numbers
        const totalOrders = allProcessedOrders.length;
        allProcessedOrders = allProcessedOrders.map((order, index) => ({
            ...order,
            order_number: totalOrders - index, // Reverse numbering
        }));


        // Filter orders by status
        const pndngOrders = allProcessedOrders.filter((order) => order.orderStatus === "Pending");
        const apvdOrders = allProcessedOrders.filter((order) => order.orderStatus === "Approved");
        const rdOrders = allProcessedOrders.filter((order) => order.orderStatus === "Ready for pickup");
        const ofdOrders = allProcessedOrders.filter((order) => order.orderStatus === "Out for delivery");
        const cmpltdOrders = allProcessedOrders.filter((order) => order.orderStatus === "Delivered");

        setOrderCounts([
            pndngOrders.length,
            apvdOrders.length,
            rdOrders.length,
            ofdOrders.length,
            cmpltdOrders.length,
            allProcessedOrders.length
        ]);

        setPOrders(allProcessedOrders);

        setPendingOrders(pndngOrders);
        setApprovedOrders(apvdOrders);
        setReadyOrders(rdOrders);
        setOutOrders(ofdOrders);
        setDeliveredOrders(cmpltdOrders);
    }


    const fetchDeliveryAgents = async () => {
        const response = await fetch("http://localhost:5000/admin/dashboard/delivery-agents");

        const dAgents = await response.json();

        setDeliveryAgents(dAgents);
    }


    useEffect(() => {
        fetchOrders();
        fetchDeliveryAgents();
    }, []);


    useEffect(() => {
        const interval = setInterval(() => {
            fetchOrders();
        }, 1000);

        return () => clearInterval(interval);
    }, [])


    // Log pOrders whenever it updates
    // useEffect(() => {
    //     console.log(pOrders + pendingOrders + approvedOrders);
    // }, [pOrders, approvedOrders, pendingOrders]);


    const showOrder = async (order_id) => {
        const order = pOrders.find((o) => o._id === order_id); // Find order by _id
        setSelectedOrder(order);

        setIsModalOpen(true);
    };


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

            setIsModalVisible(true);
        } else if (data.message === "unsuccessful") {
            setIsModalOpen(false);

            if (stts === "Approved")
                setErrorModalMessage("Failed to approve the order. Please try again.");
            else if (stts === "Ready for pickup")
                setErrorModalMessage("Failed to update the order. Please try again.");
            else if (stts === "Out for delivery")
                setErrorModalMessage("Failed to update the order. Please try again.");

            setIsErrorModalVisible(true);
        }
    }


    const closeModal = () => {
        setIsModalVisible(false);

        fetchOrders();
        // window.location.reload();
    };

    const closeErrorModal = () => {
        setIsErrorModalVisible(false);

        fetchOrders();
        // window.location.reload();
    };


    const handlePickup = async (o_id, cust_id, agnt_id) => {
        if (!agnt_id) {
            setErrorModalMessage("Please select the delivery agent.");
            setIsErrorModalVisible(true);

            return;
        }

        try {
            const dAgent = deliveryAgents.find((agnt) => agnt._id === agnt_id);

            console.log(dAgent);


            const data = {
                orderId: o_id,
                customer_id: cust_id,
                agent_id: agnt_id,
                agent_name: dAgent.first_name + ' ' + dAgent.last_name,
                agent_phone: dAgent.dp_phone
            }

            await fetch("http://localhost:5000/admin/dashboard/orders/pickup", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
                .then(async (result) => {
                    if (!result.ok) {
                        // Handle HTTP errors
                        const errorMessage = await result.text(); // Get the error message from the server
                        throw new Error(`HTTP Error: ${result.status} - ${errorMessage}`);
                    }

                    const res = await result.json(); // Wait for the JSON response
                    console.log(res);

                    if (res.value === 1) {
                        setIsModalOpen(false);
                        setModalMessage("Order pickup successful");
                        setIsModalVisible(true);
                    }
                })
                .catch((error) => {
                    console.error('Unexpected Error:', error.message);

                    // Optionally show an error modal
                    setErrorModalMessage("The server is unable to serve the request. Please try after some time");
                    setIsErrorModalVisible(true);
                });


        } catch (error) {
            console.log(error);

        }
    };


    return (
        <div>
            <Breadcrumbs />
            <div className="font-[sans-serif] px-2 space-y-3 min-h-screen">

                <div className="bg-gray-50 shadow-md">
                    <div className="p-1">
                        {tabs.map((tab, index) => (
                            <div className="inline-block">
                                <button
                                    key={tab.id}
                                    onClick={() => setTab(tab.id)}
                                    className={`relative px-6 py-2 text-sm font-medium transition-all ${activeTab === tab.id
                                        ? "bg-blue-500 text-white shadow-lg"
                                        : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                >

                                    <span className="mr-7">{tab.label}</span>

                                    {orderCounts[index] !== undefined && (
                                        <span className={`absolute top-2 right-2 text-sm font-bold flex items-center justify-center ${activeTab === tab.id
                                            ? "text-white"
                                            : "text-red-600"
                                            }`}>
                                            ({orderCounts[index]})
                                        </span>
                                    )}
                                </button>

                            </div>
                        ))}
                    </div>
                </div>


                {/* First tab for the new orders */}
                {tab1 && (
                    <div>
                        {pendingOrders.length === 0 ? (
                            <p className="text-center py-4 text-gray-600 text-lg font-semibold  border border-gray-100 rounded-lg shadow-md">
                                No new orders.
                            </p>

                        ) : (

                            <table className="min-w-full bg-white rounded-lg shadow-md">
                                <thead>
                                    <tr className="bg-gray-100 text-left">
                                        <th className="py-2 px-4">Order No.</th>
                                        <th className="py-2 px-4">Customer Name</th>
                                        <th className="py-2 px-4">Customer Phone</th>
                                        <th className="py-2 px-4">Status</th>
                                        <th className="py-2 px-4">Total</th>
                                        <th className="py-2 px-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingOrders.map((order) => (
                                        <tr key={order.order_number * 2} className="border-t hover:bg-gray-50">
                                            <td className="py-2 px-4">{order.order_number}</td>
                                            <td className="py-2 px-4">{order.customerName}</td>
                                            <td className="py-2 px-4">{order.phone?.toString().slice(2)}</td>

                                            <td className="py-2 px-4 text-yellow-600">{order.orderStatus}</td>
                                            <td className="py-2 px-4">{order.amount}</td>
                                            {/* <td className="py-2 px-4"><button type="button" className="">view</button></td> */}
                                            <td className="py-2 px-4">
                                                <button
                                                    onClick={() => showOrder(order._id)}
                                                    className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition"
                                                >
                                                    View Order
                                                </button>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* Second tab for Approved orders */}
                {tab2 && (
                    <div>
                        {approvedOrders.length === 0 ? (
                            <p className="text-center py-4 text-gray-600 text-lg font-semibold  border border-gray-100 rounded-lg shadow-md">
                                No approved orders.
                            </p>

                        ) : (

                            <table className="min-w-full bg-white rounded-lg shadow-md">
                                <thead>
                                    <tr className="bg-gray-100 text-left">
                                        <th className="py-2 px-4">Order No.</th>
                                        <th className="py-2 px-4">Customer Name</th>
                                        <th className="py-2 px-4">Customer Phone</th>
                                        <th className="py-2 px-4">Status</th>
                                        <th className="py-2 px-4">Total</th>
                                        <th className="py-2 px-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {approvedOrders.map((order) => (
                                        <tr key={order.order_number} className="border-t hover:bg-gray-50">
                                            <td className="py-2 px-4">{order.order_number}</td>
                                            <td className="py-2 px-4">{order.customerName}</td>
                                            <td className="py-2 px-4">{order.phone?.toString().slice(2)}</td>

                                            <td className="py-2 px-4 text-yellow-600">{order.orderStatus}</td>
                                            <td className="py-2 px-4">{order.amount}</td>
                                            {/* <td className="py-2 px-4"><button type="button" className="">view</button></td> */}
                                            <td className="py-2 px-4">
                                                <button
                                                    onClick={() => showOrder(order._id)}
                                                    className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition"
                                                >
                                                    View Order
                                                </button>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}


                {/* Third tab for Ready orders */}
                {tab3 && (
                    <div>
                        {readyOrders.length === 0 ? (
                            <p className="text-center py-4 text-gray-600 text-lg font-semibold  border border-gray-100 rounded-lg shadow-md">
                                No orders in outlet.
                            </p>

                        ) : (

                            <table className="min-w-full bg-white rounded-lg shadow-md">
                                <thead>
                                    <tr className="bg-gray-100 text-left">
                                        <th className="py-2 px-4">Order No.</th>
                                        <th className="py-2 px-4">Customer Name</th>
                                        <th className="py-2 px-4">Customer Phone</th>
                                        <th className="py-2 px-4">Status</th>
                                        <th className="py-2 px-4">Total</th>
                                        <th className="py-2 px-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {readyOrders.map((order) => (
                                        <tr key={order.order_number} className="border-t hover:bg-gray-50">
                                            <td className="py-2 px-4">{order.order_number}</td>
                                            <td className="py-2 px-4">{order.customerName}</td>
                                            <td className="py-2 px-4">{order.phone?.toString().slice(2)}</td>

                                            <td className="py-2 px-4 text-yellow-600">{order.orderStatus}</td>
                                            <td className="py-2 px-4">{order.amount}</td>
                                            {/* <td className="py-2 px-4"><button type="button" className="">view</button></td> */}
                                            <td className="py-2 px-4">
                                                <button
                                                    onClick={() => showOrder(order._id)}
                                                    className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition"
                                                >
                                                    View Order
                                                </button>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}


                {/* Fourth tab for Out orders */}
                {tab4 && (
                    <div>
                        {outOrders.length === 0 ? (
                            <p className="text-center py-4 text-gray-600 text-lg font-semibold  border border-gray-100 rounded-lg shadow-md">
                                No orders for delivery.
                            </p>

                        ) : (

                            <table className="min-w-full bg-white rounded-lg shadow-md">
                                <thead>
                                    <tr className="bg-gray-100 text-left">
                                        <th className="py-2 px-4">Order No.</th>
                                        <th className="py-2 px-4">Customer Name</th>
                                        <th className="py-2 px-4">Customer Phone</th>
                                        <th className="py-2 px-4">Status</th>
                                        <th className="py-2 px-4">Total</th>
                                        <th className="py-2 px-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {outOrders.map((order) => (
                                        <tr key={order.order_number} className="border-t hover:bg-gray-50">
                                            <td className="py-2 px-4">{order.order_number}</td>
                                            <td className="py-2 px-4">{order.customerName}</td>
                                            <td className="py-2 px-4">{order.phone?.toString().slice(2)}</td>

                                            <td className="py-2 px-4 text-yellow-600">{order.orderStatus}</td>
                                            <td className="py-2 px-4">{order.amount}</td>
                                            {/* <td className="py-2 px-4"><button type="button" className="">view</button></td> */}
                                            <td className="py-2 px-4">
                                                <button
                                                    onClick={() => showOrder(order._id)}
                                                    className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition"
                                                >
                                                    View Order
                                                </button>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}


                {/* Fifth tab for completed orders */}
                {tab5 && (
                    <div>
                        {deliveredOrders.length === 0 ? (
                            <p className="text-center py-4 text-gray-600 text-lg font-semibold  border border-gray-100 rounded-lg shadow-md">
                                No completed orders.
                            </p>

                        ) : (

                            <table className="min-w-full bg-white rounded-lg shadow-md">
                                <thead>
                                    <tr className="bg-gray-100 text-left">
                                        <th className="py-2 px-4">Order No.</th>
                                        <th className="py-2 px-4">Customer Name</th>
                                        <th className="py-2 px-4">Customer Phone</th>
                                        <th className="py-2 px-4">Status</th>
                                        <th className="py-2 px-4">Total</th>
                                        <th className="py-2 px-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {deliveredOrders.map((order) => (
                                        <tr key={order.order_number} className="border-t hover:bg-gray-50">
                                            <td className="py-2 px-4">{order.order_number}</td>
                                            <td className="py-2 px-4">{order.customerName}</td>
                                            <td className="py-2 px-4">{order.phone?.toString().slice(2)}</td>

                                            <td className="py-2 px-4 text-yellow-600">{order.orderStatus}</td>
                                            <td className="py-2 px-4">{order.amount}</td>
                                            {/* <td className="py-2 px-4"><button type="button" className="">view</button></td> */}
                                            <td className="py-2 px-4">
                                                <button
                                                    onClick={() => showOrder(order._id)}
                                                    className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition"
                                                >
                                                    View Order
                                                </button>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}


                {/* Sixth tab for all orders */}
                {tab6 && (
                    <div>
                        {pOrders.length === 0 ? (
                            <p className="text-center py-4 text-gray-600 text-lg font-semibold  border border-gray-100 rounded-lg shadow-md">
                                No orders for today.
                            </p>

                        ) : (

                            <table className="min-w-full bg-white rounded-lg shadow-md">
                                <thead>
                                    <tr className="bg-gray-100 text-left">
                                        <th className="py-2 px-4">Order No.</th>
                                        <th className="py-2 px-4">Customer Name</th>
                                        <th className="py-2 px-4">Customer Phone</th>
                                        <th className="py-2 px-4">Status</th>
                                        <th className="py-2 px-4">Total</th>
                                        <th className="py-2 px-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pOrders.map((order) => (
                                        <tr key={order.order_number} className="border-t hover:bg-gray-50">
                                            <td className="py-2 px-4">{order.order_number}</td>
                                            <td className="py-2 px-4">{order.customerName}</td>
                                            <td className="py-2 px-4">{order.phone?.toString().slice(2)}</td>

                                            <td className="py-2 px-4 text-yellow-600">{order.orderStatus}</td>
                                            <td className="py-2 px-4">{order.amount}</td>
                                            {/* <td className="py-2 px-4"><button type="button" className="">view</button></td> */}
                                            <td className="py-2 px-4">
                                                <button
                                                    onClick={() => showOrder(order._id)}
                                                    className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition"
                                                >
                                                    View Order
                                                </button>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}


                {isModalOpen && selectedOrder && (
                    <div className="w-10/12 flex justify-center items-center p-5">
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="ml-60 bg-white rounded-lg shadow-lg w-11/12 max-w-5xl p-5 overflow-auto">
                                <h2 className="text-xl font-semibold mb-4">Orders</h2>
                                <table className="table-auto w-full border-collapse border border-gray-300">
                                    <thead>
                                        <tr className="bg-gray-100 text-gray-700">
                                            <th className="px-4 py-2 border">Customer Name</th>
                                            <th className="px-4 py-2 border">Order No.</th>
                                            <th className="px-4 py-2 border">Order Time</th>
                                            <th className="px-4 py-2 border">Delivery Address</th>
                                            <th className="px-4 py-2 border">Items</th>
                                            <th className="px-4 py-2 border">Order Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <React.Fragment key={selectedOrder._id}>
                                            <tr key={selectedOrder.rzp_order_id} className="text-gray-600">
                                                <td className="px-4 py-2 border">{selectedOrder.customerName}</td>
                                                <td className="px-4 py-2 border">{selectedOrder.order_number}</td>
                                                {/* <td className="px-4 py-2 border">{new Date(selectedOrder.createdAt).toLocaleString()}</td> */}
                                                <td className="px-4 py-2 border">
                                                    {new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>


                                                <td className="px-4 py-2 border">{selectedOrder.deliveryAddress}</td>
                                                <td className="px-4 py-2 border">
                                                    <ul>
                                                        {selectedOrder.items.map((item, itemIndex) => (
                                                            <li key={itemIndex}>
                                                                {item.item_name} (x{item.quantity})
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </td>
                                                <td className="px-4 py-2 border">{selectedOrder.orderStatus}</td>
                                            </tr>
                                        </React.Fragment>
                                    </tbody>
                                </table>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="mt-4 bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 transition"
                                >
                                    Close
                                </button>


                                {tab1 && (<button
                                    onClick={() => updateOrderStatus(selectedOrder._id, selectedOrder.customerId, "Approved")}
                                    className="ml-4 bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition"
                                >
                                    Approve Order
                                </button>)}

                                {tab2 && (<button
                                    onClick={() => updateOrderStatus(selectedOrder._id, selectedOrder.customerId, "Ready for pickup")}
                                    className="ml-4 bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition"
                                >
                                    Send to Outlet
                                </button>)}


                                {tab3 && (
                                    <div className="mt-4">
                                        <label htmlFor="deliveryAgentSelect" className="block text-sm font-medium text-gray-700 mb-2">
                                            Assign Delivery Agent
                                        </label>
                                        <select
                                            id="deliveryAgentSelect"
                                            value={selectedAgentId}
                                            onChange={(e) => setSelectedAgentId(e.target.value)}
                                            className="block w-full sm:w-60 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="" disabled>
                                                Select Delivery Agent
                                            </option>
                                            {deliveryAgents.map((agent) => (
                                                <option key={agent._id} value={agent._id}>
                                                    {agent.first_name + ' ' + agent.last_name}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => handlePickup(selectedOrder._id, selectedOrder.customerId, selectedAgentId)}
                                            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition"
                                        >
                                            Complete Pickup
                                        </button>
                                    </div>
                                )}


                            </div>
                        </div>
                    </div>
                )}
            </div>


            {/* Success Modal */}
            <Success
                show={isModalVisible}
                message={modalMessage}
                onClose={closeModal}
            />

            {/* Error Modal */}
            <Failed
                show={isErrorModalVisible}
                message={errorModalMessage}
                onClose={closeErrorModal}
            />

        </div>
    );
};

export default Orders;
