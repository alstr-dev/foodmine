import React, { useState, useEffect } from "react";
import Breadcrumbs from "../components/Breadcrumbs";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../AdminContext";

const Home = () => {
    const navigate = useNavigate();
    const { isLoggedIn, setIsLoggedIn } = useAdmin();
    let intervalId = null;

    if (isLoggedIn) {
        // navigate("/");
        navigate("/orders");
    }

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


    const [pOrders, setPOrders] = useState([]);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [approvedOrders, setApprovedOrders] = useState([]);
    const [readyOrders, setReadyOrders] = useState([]);
    const [outOrders, setOutOrders] = useState([]);

    const [ttlAmount, setTtlAmount] = useState(0);


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

        let amnt = 0;
        allProcessedOrders.forEach((order) => {
            amnt = amnt + order.amount;
        })

        setTtlAmount(amnt);

        setPOrders(allProcessedOrders);

        setPendingOrders(pndngOrders);
        setApprovedOrders(apvdOrders);
        setReadyOrders(rdOrders);
        setOutOrders(ofdOrders);
    }


    useEffect(() => {
        fetchOrders();
    }, []);


    return (
        <div>
            <Breadcrumbs />
            <div className="font-[sans-serif] bg-gray-100 min-h-screen px-2 ml-1">

                <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[
                        { title: "Total Orders", value: `${pOrders.length}`, color: "bg-blue-500" },
                        { title: "Earnings (₹)", value: `${ttlAmount}`, color: "bg-green-500" },
                        { title: "Pending Orders", value: `${pendingOrders.length}`, color: "bg-yellow-500" },
                    ].map((stat, index) => (
                        <div
                            key={index}
                            className={`p-6 rounded-lg shadow text-white ${stat.color}`}
                        >
                            <h3 className="text-lg font-medium">{stat.title}</h3>
                            <p className="text-3xl font-bold">{stat.value}</p>
                        </div>
                    ))}
                </section>


                {/* Recent Orders */}
                {/* <section>
                <h2 className="text-2xl font-bold text-gray-700 mb-4">Recent Orders</h2>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-200 text-gray-700">
                                <th className="px-6 py-3">Order ID</th>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Total</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { id: "12345", customer: "John Doe", total: "₹500", status: "Delivered" },
                                { id: "12346", customer: "Jane Smith", total: "₹350", status: "Pending" },
                                { id: "12347", customer: "Sam Wilson", total: "₹450", status: "Cancelled" },
                            ].map((order, index) => (
                                <tr
                                    key={index}
                                    className="border-b hover:bg-gray-100 transition"
                                >
                                    <td className="px-6 py-4">{order.id}</td>
                                    <td className="px-6 py-4">{order.customer}</td>
                                    <td className="px-6 py-4">{order.total}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-2 py-1 rounded-lg text-white ${order.status === "Delivered"
                                                ? "bg-green-500"
                                                : order.status === "Pending"
                                                    ? "bg-yellow-500"
                                                    : "bg-red-500"
                                                }`}
                                        >
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-blue-500 hover:underline">View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section> */}
            </div>
        </div>
    );
};

export default Home;
