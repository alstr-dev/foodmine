import React, { useEffect, useState } from 'react';
import { useUser } from '../../UserContext';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { jsPDF } from "jspdf";

function Orders() {
    const navigate = useNavigate();

    const { userId, userName } = useUser();

    let intervalId = null;

    function checkLoggedInStatus() {
        if (!intervalId) {
            intervalId = setInterval(async () => {

                try {
                    const response = await fetch("http://localhost:5000/customer/loggedin-status", {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                        }
                    })

                    const isLoggedIn = await response.json();

                    if (!isLoggedIn) {
                        stopCheckingLoggedIn();

                        window.location.reload();
                    }
                } catch (error) {
                    console.log(error);
                }

            }, 10000);
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


    const [cancelableItems, setCancelableItems] = useState({});

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rzpId, setRzpId] = useState(null);
    const [amount, setAmount] = useState(null);

    const [isViewOrderModalOpen, setIsViewOrderModalOpen] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);

    const handleViewOrder = (order) => {
        setCurrentOrder(order);
        setIsViewOrderModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsViewOrderModalOpen(false);
    };


    if (userId === null && userName === null) {
        navigate('/customer/login');
    }


    const [orders, setOrders] = useState(null);

    async function fetchOrders() {
        try {
            const response = await fetch(`http://localhost:5000/customer/order-history/${userId}`);
            const data = await response.json();

            setOrders(data);

        } catch (error) {
            console.log(error);
            setOrders(null);
        }
    }

    useEffect(() => {
        fetchOrders();
    }, []);


    useEffect(() => {
        const timer = setInterval(() => {
            fetchOrders();

            const updatedCancelableItems = {};

            orders?.allOrders.forEach(order => {
                const timePassed = dayjs().diff(dayjs(order.createdAt), 'hour') >= 1;

                if (order.orderStatus === "Pending" && !timePassed) {
                    updatedCancelableItems[order._id.toString()] = true;
                } else {
                    updatedCancelableItems[order._id.toString()] = false;
                }
            });

            setCancelableItems(updatedCancelableItems);
        }, 1000);

        return () => clearInterval(timer);
    }, [orders]);


    const truncateText = (text, maxLength) => text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;

    const handleCancel = async (rzp_id, amount) => {

        const details = {
            rzp_pay_id: rzp_id,
            customer_id: userId,
            price: amount
        }


        const response = await fetch("http://localhost:5000/customer/orders/cancel", {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(details)
        })

        const data = await response.json();

        window.location.reload();
    };


    const handleCancelClick = (rzp_id, amount) => {
        setRzpId(rzp_id);
        setAmount(amount);
        setIsModalOpen(true);
    };

    const confirmCancel = () => {
        handleCancel(rzpId, amount);
        setIsModalOpen(false);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };


    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Order History</h1>
            {orders ? (
                <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
                    <div className="space-y-6">
                        {orders.allOrders.map((singleOrder, singleOrderIndex) => (
                            <div key={singleOrder.rzp_order_id || singleOrderIndex} className="border-b pb-4 mb-4">
                                <h3 className="text-lg font-semibold text-blue-700 mb-2">Order ID: {singleOrder.rzp_order_id}</h3>
                                <p className="text-gray-600">Date: <span className="font-medium">{dayjs(singleOrder.createdAt).format('DD-MM-YYYY [ ] h:mm A')}</span></p>
                                <p className="text-gray-600">Delivery Address: <span className="font-medium">{singleOrder.deliveryAddress}</span></p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
                                    {singleOrder.items.map(item => (
                                        <div key={item.item_id} className="bg-gray-50 p-4 rounded-lg shadow">
                                            <img
                                                src={`http://localhost:5000/restaurant/items/${item.imageFileName}`}
                                                alt={item.item_name}
                                                className="w-full h-32 object-cover rounded mb-2"
                                            />
                                            <p className="text-gray-800 font-semibold">{item.item_name}</p>
                                            <p className="text-sm text-gray-600 truncate">{truncateText(item.item_desc, 50)}</p>
                                            <div className="flex justify-between mt-2 text-gray-700">
                                                <span>Paid: &#8377;{item.paidAmount}</span>
                                                <span>Quantity: {item.quantity}</span>
                                            </div>

                                        </div>
                                    ))}
                                </div>

                                <div className='flex flex-col items-center justify-center'>
                                    <a className="mt-2 block w-full text-center text-blue-600 font-semibold py-2 rounded hover:underline cursor-pointer"
                                        onClick={() => handleViewOrder(singleOrder)}
                                    >
                                        View Order
                                    </a>

                                    {singleOrder.orderStatus && !cancelableItems[singleOrder._id] && (
                                        <p
                                            className="flex items-center justify-center mt-4 w-full text-white font-semibold py-2 rounded bg-gray-500"
                                        >
                                            {singleOrder.orderStatus}
                                        </p>
                                    )}


                                    {cancelableItems[singleOrder._id] && (
                                        <button
                                            onClick={() => handleCancelClick(singleOrder.rzp_pay_id, singleOrder.amount)}
                                            className="mt-4 w-full text-white font-semibold py-2 rounded bg-red-500 hover:bg-red-600"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <p className="text-center text-gray-500">No orders available or failed to fetch orders.</p>
            )}


            <div>
                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800">Confirm Cancellation</h2>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to cancel this order? This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={closeModal}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                                >
                                    No, Keep It
                                </button>
                                <button
                                    onClick={confirmCancel}
                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                >
                                    Yes, Cancel Order
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>


            {/* Modal for Order Details */}
            <OrderDetailsModal
                isOpen={isViewOrderModalOpen}
                order={currentOrder}
                onClose={handleCloseModal}
                onDownload={() => { }}
            />
        </div>
    );
}

export default Orders;





// Modal Component
const OrderDetailsModal = ({ isOpen, order, onClose, onDownload }) => {
    if (!isOpen) return null; // Don't render if the modal is closed

    // Format currency with proper INR symbol
    const formattedAmount = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(order.amount);



    const generatePDF = () => {
        const doc = new jsPDF();

        // Add a border around the document
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.rect(5, 5, 200, 287); // Border 5mm from edges

        // Add Blob-like Decorative Graphics
        doc.setFillColor(240, 240, 255); // Light purple
        doc.circle(30, 30, 20, "F");
        doc.setFillColor(255, 240, 240); // Light pink
        doc.circle(180, 50, 15, "F");
        doc.setFillColor(240, 255, 240); // Light green
        doc.circle(60, 260, 25, "F");

        // Add Header with Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(40, 40, 40);
        doc.text("FoodMine", 105, 15, { align: "center" });

        doc.setFontSize(14);
        doc.text("Order Receipt", 105, 25, { align: "center" });

        // Order Details Section
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);

        const detailsStartY = 35;
        const detailsSpacing = 8;

        // Add order fields with word wrapping
        let currentY = detailsStartY;

        doc.text(`Order ID: ${order.rzp_order_id || "N/A"}`, 10, currentY);
        currentY += detailsSpacing;

        doc.text(`Customer Name: ${order.customerName || "N/A"}`, 10, currentY);
        currentY += detailsSpacing;

        doc.text(`Email: ${order.email_id || "N/A"}`, 10, currentY);
        currentY += detailsSpacing;

        doc.text(`Phone: ${order.phone.toString().slice(2) || "N/A"}`, 10, currentY);
        currentY += detailsSpacing;

        // doc.text(`Delivery Charge: ${order.deliveryCharge || 0}`, 10, currentY);
        // currentY += detailsSpacing;

        // Handle word-wrapping for the delivery address
        const deliveryAddress = `Delivery Address: ${order.deliveryAddress || "N/A"}`;
        const wrappedAddress = doc.splitTextToSize(deliveryAddress, 190); // Ensures content stays within the border
        doc.text(wrappedAddress, 10, currentY);
        currentY += wrappedAddress.length * 6;

        doc.text(`Total Amount: ${order.amount || 0}`, 10, currentY);
        currentY += detailsSpacing;

        // Items Section Heading
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.text("Items in the Order", 10, currentY);
        currentY += 8;

        // Items Details Section
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);

        order.items.forEach((item, index) => {
            if (currentY > 270) {
                doc.addPage(); // Add new page if content exceeds page height
                currentY = 10;
            }

            // Item Details
            doc.text(`${index + 1}. ${item.item_name || "N/A"}:`, 10, currentY);
            doc.text(`Qty: ${item.quantity || 0}`, 110, currentY);
            doc.text(`Price: ${item.paidAmount || 0}`, 160, currentY);
            currentY += 8;

            if (item.item_desc) {
                doc.setFontSize(10);
                doc.setTextColor(100, 100, 100);
                const wrappedDesc = doc.splitTextToSize(`Description: ${item.item_desc}`, 190);
                doc.text(wrappedDesc, 15, currentY);
                currentY += wrappedDesc.length * 6;
            }

            doc.setFontSize(12);
            doc.setTextColor(60, 60, 60);
        });

        // Footer Section
        const pageHeight = doc.internal.pageSize.height;
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);

        doc.text(`Order Created At: ${new Date(order.createdAt).toLocaleString() || "N/A"}`, 10, currentY + 10);
        doc.text(
            "Thank you for your order! For any issues, contact our support at support@foodmine.com.",
            105,
            pageHeight - 10,
            { align: "center" }
        );

        // Save the PDF
        doc.save("order-receipt.pdf");
    };




    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 w-11/12 max-w-2xl shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-semibold text-gray-800">Order Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-600 hover:text-gray-800 font-semibold"
                        aria-label="Close"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <p className="text-lg text-gray-700">Order ID:</p>
                        <p className="text-lg font-semibold text-gray-900">{order.rzp_order_id}</p>
                    </div>

                    <div className="flex justify-between items-center">
                        <p className="text-lg text-gray-700">Customer Name:</p>
                        <p className="text-lg font-semibold text-gray-900">{order.customerName}</p>
                    </div>

                    <div className="flex justify-between items-center">
                        <p className="text-lg text-gray-700">Email:</p>
                        <p className="text-lg font-semibold text-gray-900">{order.email_id}</p>
                    </div>

                    <div className="flex justify-between items-center">
                        <p className="text-lg text-gray-700">Phone:</p>
                        <p className="text-lg font-semibold text-gray-900">{order.phone}</p>
                    </div>

                    <div className="flex justify-between items-center">
                        <p className="text-lg text-gray-700">Coupon Code:</p>
                        <p className="text-lg font-semibold text-gray-900">{order.couponCode || "N/A"}</p>
                    </div>

                    <div className="flex justify-between items-center">
                        <p className="text-lg text-gray-700">Total Amount:</p>
                        <p className="text-lg font-semibold text-gray-900">{formattedAmount}</p>
                    </div>

                    <div className="space-y-2">
                        <p className="text-lg text-gray-700">Items Ordered:</p>
                        <ul className="space-y-2">
                            {order.items.map((item, index) => (
                                <li key={index} className="flex justify-between">
                                    <p className="text-gray-600">{item.item_name}</p>
                                    <p className="font-semibold text-gray-900">
                                        ₹{item.paidAmount} (Qty: {item.quantity})
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex justify-between items-center mt-6">
                        <button
                            onClick={onClose}
                            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700"
                        >
                            Close
                        </button>
                        <button
                            onClick={generatePDF}
                            className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700"
                        >
                            Download Receipt
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
