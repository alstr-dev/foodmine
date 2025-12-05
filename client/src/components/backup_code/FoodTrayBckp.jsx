import React, { useState, useEffect } from 'react';
import { useUser } from '../../UserContext';
import LocationSelector from '../../LocationSelector';
import { useNavigate } from "react-router-dom";

const FoodTrayBckp = () => {
    const navigate = useNavigate();

    const [menu, setMenu] = useState([]);
    const [cartItems, setCartItems] = useState([]);

    const { setUserName, setUserId, setUserType, setItemCount, setEmailId, setUserPhone } = useUser();
    const { userId, userName, userType, itemCount, emailId, userPhone } = useUser();

    const [paymentMethod, setPaymentMethod] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);
    const [totalDiscount, setTotalDiscount] = useState(0);
    const [selectedItems, setSelectedItems] = useState([]);

    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const [selectedLocation, setSelectedLocation] = useState(null);
    const [isLocationSelectorVisible, setLocationSelectorVisible] = useState(false); // To control visibility
    const [formattedAddress, setFormattedAddress] = useState(null);

    // Handler to update the selected location
    const handleLocationSelect = async (location) => {
        setSelectedLocation(location);

        console.log(location);

        // setLocationSelectorVisible(false); // Hide the LocationSelector after selection

        // const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.lat},${location.lng}&key=YOUR_GMAP_API_KEY`;
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.lat},${location.lng}&key={import.meta.env.VITE_GMAP_API}`;


        try {
            const response = await fetch(geocodeUrl);

            const data = await response.json();

            if (data.status === "OK" && data.results.length > 0) {
                const fmtdAddress = data.results[0].formatted_address;
                console.log(fmtdAddress); // Set the address in state

                setFormattedAddress(fmtdAddress)
            } else {
                console.error("No results found for this location.");
            }
        } catch (error) {
            console.log("Faild: " + error);

        }

    };

    // Toggle the visibility of the LocationSelector
    const toggleLocationSelector = () => {
        setLocationSelectorVisible(!isLocationSelectorVisible);
    };

    const totalSelectedItems = cartItems.filter(item => item.selected).length;

    const fetchCartItems = async () => {
        try {
            const response = await fetch('http://localhost:5000/customer/cart-items', {
                credentials: "include"
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            let count = 0;
            data.menu.forEach((category) => {
                count = count + category.item.length;
            })

            setItemCount(count);

            setMenu(data.menu);

            // Process cartItems once the menu data is set
            const itemsFromMenu = data.menu.reduce((acc, category) => {
                return [...acc, ...category.item];  // Flatten items from all categories
            }, []);

            setCartItems(itemsFromMenu);

        } catch (error) {
            console.error('Failed to fetch data and images:', error);
        }
    };

    useEffect(() => {
        fetchCartItems();
    }, []);


    const toggleItemSelection = (cart_item, id) => {
        setCartItems((prevCartItems) =>
            prevCartItems.map((item) => {
                if (item.itemId === id) {
                    const itemTotal = (item.itemPrice - item.discount) * item.quantity;
                    const itemDiscount = item.discount * item.quantity;

                    if (item.selected) {
                        // Deselect: Subtract item price and discount
                        setTotalPrice((prevTotalPrice) => prevTotalPrice - itemTotal);
                        setTotalDiscount((prevTotalDiscount) => prevTotalDiscount - itemDiscount);
                    } else {
                        // Select: Add item price and discount
                        setTotalPrice((prevTotalPrice) => prevTotalPrice + itemTotal);
                        setTotalDiscount((prevTotalDiscount) => prevTotalDiscount + itemDiscount);
                    }

                    return { ...item, selected: !item.selected };
                }
                return item;
            })
        );
    };

    const decreaseQuantity = (itemId) => {
        setCartItems((prevCartItems) =>
            prevCartItems.map((item) => {
                if (item.itemId === itemId) {
                    const newQuantity = Math.max(1, item.quantity - 1);
                    const diffQuantity = item.quantity - newQuantity;

                    if (item.selected) {
                        setTotalPrice((prevTotalPrice) =>
                            prevTotalPrice - diffQuantity * (item.itemPrice - item.discount)
                        );
                        setTotalDiscount((prevTotalDiscount) =>
                            prevTotalDiscount - diffQuantity * item.discount
                        );
                    }

                    return { ...item, quantity: newQuantity };
                }
                return item;
            })
        );
    };

    const increaseQuantity = (itemId) => {
        setCartItems((prevCartItems) =>
            prevCartItems.map((item) => {
                if (item.itemId === itemId) {
                    const newQuantity = item.quantity + 1;

                    if (item.selected) {
                        setTotalPrice((prevTotalPrice) =>
                            prevTotalPrice + (item.itemPrice - item.discount)
                        );
                        setTotalDiscount((prevTotalDiscount) =>
                            prevTotalDiscount + item.discount
                        );
                    }

                    return { ...item, quantity: newQuantity };
                }
                return item;
            })
        );
    };


    useEffect(() => {
        setSelectedItems(cartItems.filter(item => item.selected));
    }, [cartItems]);



    const removeItem = async (item_id) => {
        const itemData = {
            itemId: item_id
        };

        try {
            const response = await fetch('http://localhost:5000/customer/api/delete/cart-items', {
                method: 'POST',
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(itemData)
            });

            if (!response.ok) {
                throw new Error('Failed to delete the item');
            }

            const data = await response.json();

            // Show the modal message
            setModalMessage('Item removed from the cart successfully!');
            setShowModal(true);

            // Reload the page after a short delay
            setTimeout(() => {
                setShowModal(false);
                window.location.reload();
            }, 1000);

        } catch (error) {
            console.error('Error:', error);
            setModalMessage('Failed to remove the item. Please try again.');
            setShowModal(true);

            // Hide the modal after a short delay
            setTimeout(() => setShowModal(false), 2000);
        }
    };



    const applyCoupon = () => {
        // Logic to apply coupon
        alert(`Coupon code ${couponCode} applied!`);
    };


    useEffect(() => {
        // Dynamically load the Razorpay script
        const loadRazorpayScript = () => {
            return new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.onload = () => resolve(true);
                script.onerror = () => resolve(false);
                document.body.appendChild(script);
            });
        };

        loadRazorpayScript();
    }, []);


    const handlePlaceOrder = async () => {
        if (userId && userType === "customer") {
            try {
                // Order placement logic

                const copiedItems = selectedItems.map(({ imageSrc, ...rest }) => rest);

                // console.log(copiedItems);
                // console.log(selectedItems);

                const orderData = {
                    u_id: userId,
                    u_name: userName,
                    items: copiedItems,
                    discount: totalDiscount,
                    price: totalPrice,
                    coupon: couponCode,
                    deliveryLocation: selectedLocation,
                    deliveryAddress: formattedAddress
                }

                const response = await fetch("http://localhost:5000/customer/orders", {
                    method: 'POST',
                    credentials: "include",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(orderData)
                })

                const data = await response.json();

                console.log(data.amount);


                const options = {
                    // key: "YOUR_RAZORPAY_ID", // Your Razorpay Key ID
                    key: import.meta.env.VITE_RAZORPAY_KEY, // Your Razorpay Key ID
                    amount: data.amount,
                    currency: "INR",
                    name: "Food Delivery",
                    description: "Payment for Order",
                    order_id: data.orderId,
                    handler: async (response) => {
                        // Handle the payment success response
                        console.log("Payment successful", response);

                        copiedItems.forEach((item) => {
                            console.log(`Deleting item with id: ${item.id}`);
                            removeItem(item.id)
                        })

                        localStorage.setItem("navigateAfterReload", true);
                        window.location.reload();

                        // navigate("/customer/orders");

                        const orderDetails = { ...orderData, ...response }

                        const res = await fetch("http://localhost:5000/customer/payment/receipt", {
                            method: 'POST',
                            credentials: "include",
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(orderDetails)
                        })

                        const payData = await res.json();

                        console.log(response.order_id);
                        console.log(payData);
                    },
                    prefill: {
                        name: userName,
                        email: emailId,
                        contact: userPhone,
                    },
                    theme: {
                        color: "#3399cc",
                    },
                };

                const rzp = new window.Razorpay(options);
                rzp.open();

                // alert('Order placed successfully!');
            } catch (error) {
                console.log(error);
            }
        } else {
            navigate("/customer/login");
        }
    };


    useEffect(() => {
        // Check if navigation flag is set in localStorage
        const shouldNavigate = localStorage.getItem("navigateAfterReload");

        if (shouldNavigate) {
            localStorage.removeItem("navigateAfterReload"); // Clean up
            navigate("/customer/orders");
        }
    }, [navigate]);



    return (
        <div className="min-h-screen bg-gray-100 p-5">


            {cartItems.length === 0 ? (
                <p className="text-center py-4 text-gray-500 text-lg font-semibold bg-gray-100 border border-gray-300 rounded-lg shadow-md">
                    Start adding items to cart.
                </p>

            ) : (
                <div className="container mx-auto max-w-4xl bg-white p-6 rounded-lg shadow-lg">
                    <h1 className="text-3xl font-bold mb-4 text-center">Your Cart</h1>


                    <div className="space-y-4 mb-6">
                        {cartItems.map((item, index) => (
                            <div
                                key={item.itemId}
                                className="flex items-center bg-white p-4 rounded-lg shadow-lg border border-gray-200"
                            >
                                <img
                                    src={item.imageSrc}
                                    alt={item.itemName}
                                    className="w-32 h-32 rounded-lg mr-4 object-cover border"
                                />
                                <div className="flex-grow">
                                    <h3 className="text-lg font-semibold text-gray-800">{item.itemName}</h3>
                                    <p className="text-gray-500 text-sm mb-2">{item.itemDescription}</p>
                                    <div className="text-lg font-medium text-gray-700 mb-2">

                                        <span className="relative inline-block text-lg font-medium text-gray-700">
                                            &#8377;
                                            <span
                                                className="relative z-10"
                                            >
                                                {item.itemPrice}
                                            </span>
                                            <span
                                                className=" absolute inset-0 bg-black"
                                                style={{
                                                    height: '1px',
                                                    top: '50%',
                                                    left: '20%',
                                                    right: '-5%',
                                                    transform: 'rotate(-12deg)',
                                                    zIndex: '5',
                                                }}
                                            ></span>
                                        </span>

                                        <span className="ml-2 text-green-600 text-sm">
                                            &#8377;
                                            {item.itemPrice - item.discount}
                                        </span>

                                        {item.discount && (
                                            <span className="ml-2 text-green-600 text-sm">
                                                {item.discount} off
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => decreaseQuantity(item.itemId)}
                                            className="text-lg w-8 h-8 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center justify-center font-semibold"
                                        >
                                            -
                                        </button>

                                        <input
                                            type="number"
                                            value={item.quantity}
                                            className="w-16 pl-3 h-8 text-center border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                                            disabled
                                        />

                                        <button
                                            onClick={() => increaseQuantity(item.itemId)}
                                            className="text-lg w-8 h-8 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center justify-center font-semibold"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center justify-center space-y-2">
                                    <input
                                        type="checkbox"
                                        checked={item.selected}
                                        onChange={() => toggleItemSelection(item, item.itemId)}
                                        className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeItem(item.id)}
                                        className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>



                    {/* Price Breakdown */}
                    <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                        <div className="flex justify-between mb-2">
                            <span className="text-lg">Total Items:</span>
                            <span className="text-lg">{totalSelectedItems}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className="text-lg">Offers Applied:</span>
                            <span className="text-lg">-&#8377;{totalDiscount}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <input
                                type="text"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                placeholder="Enter coupon code"
                                className="w-2/3 p-2 border rounded-lg"
                            />
                            <button
                                onClick={applyCoupon}
                                className="ml-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
                            >
                                Apply Coupon
                            </button>
                        </div>
                    </div>

                    {/* Total Price */}
                    <div className="flex justify-between items-center bg-yellow-100 p-4 rounded-lg mb-6">
                        <span className="text-xl font-bold">Total:</span>
                        <span className="text-xl font-bold">&#8377;{totalPrice}</span>
                    </div>

                    {/* Address Selection */}
                    {/* <div className="mb-6">
                    <label htmlFor="address" className="block font-semibold mb-2">Select Address:</label>
                    <select
                        id="address"
                        value={address}
                        onChange={handleAddressChange}
                        className="w-full p-3 border border-gray-300 rounded-lg shadow"
                    >
                        {addresses.map((addr, index) => (
                            <option key={index} value={addr}>{addr}</option>
                        ))}
                        <option value="new">Add New Address</option>
                    </select>
                </div> */}


                    {selectedLocation && (
                        <p className="mt-4 text-sm font-medium text-gray-700 bg-gray-100 p-4 rounded-lg shadow-md">
                            <strong className="block text-blue-500">Selected Address:</strong>
                            <span className="block text-gray-900">{formattedAddress}</span>
                        </p>
                    )}


                    {/* Button to show the LocationSelector */}
                    <button
                        onClick={toggleLocationSelector}
                        className="mt-4 px-4 py-2 text-lg font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                    >
                        Select Delivery Location
                    </button>


                    <div>
                        {/* Conditionally render the LocationSelector component */}
                        {isLocationSelectorVisible && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
                                <div
                                    className="absolute w-2/3 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg"
                                >
                                    <h2 className="text-xl font-semibold mb-4">Select Your Delivery Location</h2>
                                    <LocationSelector onLocationSelect={handleLocationSelect} />
                                    {selectedLocation && (
                                        <p className="mt-4 text-sm font-medium text-gray-700 bg-gray-100 p-4 rounded-lg shadow-md">
                                            <strong className="block text-blue-500">Selected Address:</strong>
                                            <span className="block text-gray-900">{formattedAddress}</span>
                                        </p>
                                    )}


                                    <button
                                        onClick={toggleLocationSelector}
                                        className="my-4 px-4 py-2 w-full text-lg font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>


                    <div className="flex justify-center">
                        <button
                            onClick={handlePlaceOrder}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-10 rounded-full shadow-lg transition-transform hover:scale-105"
                            disabled={!formattedAddress || totalPrice === 0}
                        >
                            Place Order
                        </button>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-4 shadow-lg text-center">
                        <p className="text-gray-800">{modalMessage}</p>
                    </div>
                </div>
            )}

        </div>
    );
};

export default FoodTrayBckp;
