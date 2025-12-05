import React from "react";
import { useState, useEffect } from 'react';

const HomePage = () => {
    const [menu, setMenu] = useState([]);

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


    useEffect(() => {
        fetchFoodItems();
    }, []);


    return (
        <div className="bg-gray-50 text-gray-800 min-h-screen">

            <div className="relative w-full h-screen bg-gradient-to-br from-yellow-100 via-orange-200 to-pink-300 flex flex-col items-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute w-40 h-40 bg-[#FFC34A] rounded-full top-10 left-16 animate-bounce-slow opacity-80 shadow-lg"></div>
                    <div className="absolute w-36 h-36 bg-[#FF924A] rounded-full top-28 right-24 animate-float opacity-70 shadow-lg"></div>
                    <div className="absolute w-44 h-44 bg-[#FF6347] rounded-full bottom-16 left-1/3 animate-spin-slow opacity-50"></div>
                </div>

                <div className="relative flex flex-col items-center w-full mx-auto z-10">
                    <div className="relative flex flex-col md:flex-row items-center justify-between w-full">
                        <div className="max-w-xl text-center md:text-left space-y-6 ml-6 mt-32 md:mt-48">
                            <h2 className="text-6xl md:text-8xl font-extrabold text-gray-900 mt-2 tracking-wide leading-tight drop-shadow-lg">
                                FOOD DELIVERY
                            </h2>
                            <p className="text-gray-700 mt-6 text-lg font-light md:max-w-lg">
                                Discover the finest dishes from the best restaurant. Freshly made and delivered right to your door.
                            </p>
                            <button className="bg-orange-500 text-white px-8 py-3 rounded-full font-semibold shadow-md hover:bg-orange-600 transform hover:scale-105 transition duration-300">
                                Explore Menu
                            </button>
                        </div>

                        <div className="relative h-screen w-6/12 m-0"
                            style={{
                                clipPath: 'polygon(0% 0%, 36% 100%, 100% 100%, 100% 0%)',
                            }}
                        >
                            <div className="relative overflow-hidden shadow-2xl animate-zoom-in h-screen">
                                <img
                                    src="http://localhost:5000/restaurant/items/dishImage-1732784072780-412809931.jpg"
                                    alt="Food"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-white/50"></div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>


            {/* Featured Dishes Section */}
            <section className="py-16 px-6 bg-gray-50">
                <h2 className="text-3xl font-bold text-center mb-10">
                    Our Featured Dishes
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Dish Card */}
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
            </section>


            {/* How It Works Section */}
            <section className="py-16 px-6 bg-gradient-to-br from-orange-100 to-yellow-200">
                <h2 className="text-3xl font-bold text-center mb-10">
                    How It Works
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
                    {/* Step 1 */}
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-4 bg-orange-300 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                            1
                        </div>
                        <h3 className="text-lg font-semibold">Browse Menu</h3>
                        <p className="text-gray-600">
                            Explore our curated menu filled with amazing dishes.
                        </p>
                    </div>
                    {/* Step 2 */}
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-4 bg-orange-300 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                            2
                        </div>
                        <h3 className="text-lg font-semibold">Place Order</h3>
                        <p className="text-gray-600">
                            Add your favorite items to the cart and place your order.
                        </p>
                    </div>
                    {/* Step 3 */}
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

            {/* Footer */}
            <footer className="py-10 bg-gray-900 text-gray-200">
                <div className="text-center">
                    <h4 className="text-lg font-semibold mb-4">Your Restaurant Name</h4>
                    <p>
                        Fresh and delicious food delivered to your door. Made with love, for food lovers.
                    </p>
                    <div className="mt-6">
                        <a
                            href="#"
                            className="text-orange-500 hover:underline mx-2"
                        >
                            Privacy Policy
                        </a>
                        |
                        <a
                            href="#"
                            className="text-orange-500 hover:underline mx-2"
                        >
                            Terms of Service
                        </a>
                    </div>
                </div>
            </footer>
        </div >
    );
};

export default HomePage;