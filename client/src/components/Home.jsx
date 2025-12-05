import React from "react";
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();
    const [menu, setMenu] = useState([]);

    let intervalId = null;
    const user_id = JSON.parse(localStorage.getItem("user_id")) || false;

    function checkLoggedInStatus() {
        if (!intervalId && user_id) {
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

                        localStorage.removeItem("user_id");

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


    const fetchFoodItems = async () => {
        try {
            const response = await fetch('http://localhost:5000/restaurant/items-data');
            if (!response.ok) {
                console.log(response);

                throw new Error('Network response was not ok');
            }

            const data = await response.json();


            if (!Array.isArray(data.menu)) {
                console.error("menuData must be an array");
                return [];
            }


            const flattenedItems = data.menu.flatMap(category => {
                if (!Array.isArray(category.item)) {
                    console.warn(`Category '${category.categoryName}' has no valid items.`);
                    return [];
                }

                return category.item.map(item => ({
                    ...item,
                    categoryName: category.categoryName,
                    categoryId: category.categoryId,
                    category_id: category._id
                }));
            });


            setMenu(flattenedItems);
        } catch (error) {
            console.error('Failed to fetch data and images:', error);
        }
    };


    const goToMenu = () => {
        navigate("/customer/ordernow");
    }


    useEffect(() => {
        fetchFoodItems();
    }, []);


    return (
        <div className="bg-gray-50 text-gray-800 min-h-screen">

            <div className="w-full flex justify-end content-center bg-cover bg-center bg-[url('http://localhost:5000/restaurant/items/bg-image-1.png')]"
                style={{ height: "550px" }}
            >
            </div>


            {/* Featured Dishes Section */}
            {/* <section className="py-16 px-6 bg-gray-50">
                <h2 className="text-3xl font-bold text-center mb-10">
                    Most Ordered Dishes
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {menu.map((dish, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-lg shadow-lg ov erflow-hidden hover:scale-105 transform transition"
                        >
                            <img
                                src={`http://localhost:5000/restaurant/items/${dish.itemImage}`}
                                alt={dish.itemName}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                                <h3 className="text-lg font-semibold">{dish.itemName}</h3>
                                <p className="text-gray-600">
                                    A delicious {dish.itemName.toLowerCase()} to satisfy your cravings.
                                </p>
                                <button className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg font-medium shadow-md hover:bg-orange-600 transition">
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section> */}


            {/* How It Works Section */}
            <section className="py-16 px-6 bg-gradient-to-br from-orange-100 to-yellow-200">
                <h2 className="text-3xl font-bold text-center mb-10 text-orange-500">
                    How It Works
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-4 bg-orange-300 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                            1
                        </div>
                        <h3 className="text-lg font-semibold">Browse Menu</h3>
                        <p className="text-gray-600">
                            Explore our curated menu filled with amazing dishes.
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-4 bg-orange-300 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                            2
                        </div>
                        <h3 className="text-lg font-semibold">Place Order</h3>
                        <p className="text-gray-600">
                            Add your favorite items to the cart and place your order.
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-4 bg-orange-300 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                            3
                        </div>
                        <h3 className="text-lg font-semibold">Enjoy Your Meal</h3>
                        <p className="text-gray-600">
                            Sit back and relax while we deliver fresh food to your doorstep.
                        </p>
                    </div>
                </div>
            </section>

        </div >
    );
};

export default Home;