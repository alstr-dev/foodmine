import React from 'react';
import { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import { useUser } from '../../UserContext';
import { useNavigate } from "react-router-dom";
import SmallSuccess from '../SmallSuccess';


const OrderNow = () => {
    const navigate = useNavigate();

    const { setUserName, setUserId, setUserType, setItemCount } = useUser();
    const { userId, userName, userType, itemCount } = useUser();

    let intervalId = null;

    function checkLoggedInStatus() {
        if (!intervalId && userId) {
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


    const [menu, setMenu] = useState([]);

    const [searchQuery, setSearchQuery] = useState("");
    const [filteredItems, setFilteredItems] = useState([]);

    const [isVisible, setIsVisible] = useState(false);
    const [smlSccssMsg, setSmlSccssMsg] = useState('');

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
            setFilteredItems(flattenedItems);
        } catch (error) {
            console.error('Failed to fetch data and images:', error);
        }
    };


    const fetchCartItems = async () => {
        try {
            const response = await fetch('http://localhost:5000/customer/cart-items', {
                credentials: "include"
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            // console.log(data.menu);

            let count = 0;
            data.menu.forEach((category) => {
                category.item.forEach((item) => {
                    count = count + 1;
                })
            })

            setItemCount(count);

        } catch (error) {
            console.error('Failed to fetch data and images:', error);
        }
    };


    useEffect(() => {
        fetchFoodItems();
        fetchCartItems();
    }, []);


    const addItemToCart = async (itemId) => {
        if (!userId) {
            navigate("/customer/login");
        }

        const data = {
            item_id: itemId,
            customer_id: userId
        }

        try {
            const response = await fetch('http://localhost:5000/customer/add-cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.statusText}`);
            }

            const responseData = await response.json();
            console.log('Response from server:', responseData.message);

            if (responseData.message !== "exist") {
                setItemCount(itemCount + 1);

                setSmlSccssMsg(<span>
                    Item added to cart...{" "}
                    <NavLink to="/customer/tray" className="text-blue-500 underline">
                        View Cart
                    </NavLink>
                </span>);
                setIsVisible(true);
                // setTimeout(() => setIsVisible(false), 2000);
            } else if (responseData.message === "exist") {
                setSmlSccssMsg(<span>
                    Item already in cart...{" "}
                    <NavLink to="/customer/tray" className="text-blue-500 underline">
                        View Cart
                    </NavLink>
                </span>);
                setIsVisible(true);
                // setTimeout(() => setIsVisible(false), 2000);
            }

        } catch (error) {
            console.error('Error sending data:', error);
        }
    }


    // For search bar
    const filterMenuItems = (searchQuery) => {
        const query = searchQuery.toLowerCase();

        if (!Array.isArray(menu)) {
            console.error("menu must be an array");
            return [];
        }

        const filteredItems = menu.filter(item =>
            item.itemName.toLowerCase().includes(query) ||
            item.itemDescription.toLowerCase().includes(query)
        );

        return filteredItems;
    };


    const handleSearch = (e) => {
        const query = e.target.value;

        setSearchQuery(query);
        const results = filterMenuItems(query);

        setFilteredItems(results);
    };


    const [showItemDetail, setShowItemDetail] = useState(false);
    const [selectedItemToShow, setSelectedItemToShow] = useState(null);

    const showItemDetails = (itemSelected) => {
        setShowItemDetail(true);
        setSelectedItemToShow(itemSelected);

        console.log(itemSelected);
    }


    return (
        <div className="min-h-screen bg-gradient-to-b text-gray-900">
            <div className="container mx-auto py-10">

                {/* Search Bar */}
                <div className="flex justify-center mb-10">
                    <div className="relative w-3/4 lg:w-1/2">
                        <input
                            type="text"
                            placeholder="Search for food..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full p-4 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-gray-100"
                        />
                        <FaSearch className="absolute right-4 top-4 text-gray-500" />
                    </div>
                </div>

                {/* Famous Food Items Section */}
                <div className="mb-16">
                    {/* <h2 className="text-3xl font-bold text-center mb-8">Famous Food Items</h2> */}
                    <div className="flex flex-wrap justify-center gap-8">
                        {filteredItems.map((item, index) => (
                            <div className='w-48 h-60 bg-white shadow-lg flex-row items-center justify-center rounded-lg transform hover:scale-105 transition-transform duration-300 hover:cursor-pointer'
                                onClick={() => showItemDetails(item)}
                            >
                                <div
                                    key={index}
                                    className="my-2 mx-auto w-44 h-44 bg-white rounded-lg flex items-center justify-center"
                                    style={{
                                        backgroundImage: `url(http://localhost:5000/restaurant/items/${item.itemImage})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                    }}
                                >
                                </div>

                                <div
                                    key={index + 1}
                                    className="w-44 h-10 flex items-center justify-center"
                                >
                                    <div className='flex-row items-center justify-center absolute left-2'>
                                        {/* <span className="bg-none block">{item.itemName}</span> */}
                                        <span className="bg-none block">
                                            {item.itemName.length > 13
                                                ? item.itemName.slice(0, 13) + "..."
                                                : item.itemName}
                                        </span>

                                        <div className='flex items-center justify-start'>
                                            &#8377;
                                            <span className="relative inline-block text-lg font-medium text-gray-700">
                                                <span
                                                    className="relative z-10"
                                                >
                                                    {item.itemPrice}
                                                </span>
                                                <span
                                                    className="absolute inset-0 bg-black"
                                                    style={{
                                                        height: '1px',
                                                        top: '50%',
                                                        left: '-10%',
                                                        right: '-10%',
                                                        transform: 'rotate(-12deg)',
                                                        zIndex: '5',
                                                    }}
                                                ></span>
                                            </span>

                                            <span className="mx-2 bg-none block">
                                                &#8377;
                                                {Math.round(item.itemPrice - (item.itemPrice * item.discount) / 100)}
                                            </span>

                                            <span className="mx-0 mt-1 bg-none block text-xs text-green-600 font-bold">
                                                {item.discount}% off
                                            </span>
                                        </div>
                                    </div>

                                    <button type='button' className="bg-none absolute right-2 bottom-2 text-orange-600" onClick={() => addItemToCart(item._id)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-cart-plus" viewBox="0 0 16 16">
                                            <path d="M9 5.5a.5.5 0 0 0-1 0V7H6.5a.5.5 0 0 0 0 1H8v1.5a.5.5 0 0 0 1 0V8h1.5a.5.5 0 0 0 0-1H9z" />
                                            <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1zm3.915 10L3.102 4h10.796l-1.313 7zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0m7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>


            {/* Modal to show item details */}
            {showItemDetail &&
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg max-w-lg w-full">
                        <img
                            src={`http://localhost:5000/restaurant/items/${selectedItemToShow.itemImage}`}
                            alt={selectedItemToShow.itemName}
                            className="w-full h-64 object-cover rounded-t-lg"
                        />
                        <div className="p-4">
                            <h2 className="text-2xl font-bold mb-2">{selectedItemToShow.itemName}</h2>
                            <p className="text-sm text-gray-500 mb-4">
                                Category: {selectedItemToShow.categoryName} | Diet: {selectedItemToShow.itemDiet}
                            </p>
                            <p className="text-gray-700 mb-4">{selectedItemToShow.itemDescription}</p>
                            <div className="text-lg font-semibold mb-4 flex">
                                <span className="relative inline-block text-lg font-medium text-gray-700">
                                    <span
                                        className="relative z-10"
                                    >
                                        Price: ₹{selectedItemToShow.itemPrice}{" "}
                                    </span>
                                    <span
                                        className="absolute inset-0 bg-black"
                                        style={{
                                            height: '1px',
                                            top: '50%',
                                            left: '60%',
                                            right: '-1%',
                                            transform: 'rotate(-12deg)',
                                            zIndex: '5',
                                        }}
                                    ></span>
                                </span>

                                <span className="mx-2 bg-none block text-green-600">
                                    &#8377;
                                    {Math.round(selectedItemToShow.itemPrice - (selectedItemToShow.itemPrice * selectedItemToShow.discount) / 100)}
                                </span>

                                {selectedItemToShow.discount > 0 && (
                                    <span className="text-sm text-green-600 mt-1">
                                        (Discount: {selectedItemToShow.discount}%)
                                    </span>
                                )}
                            </div>

                            <div className='flex'>
                                <button
                                    className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-white hover:bg-red-500 border border-gray-300 rounded-lg transition duration-300 ease-in-out"
                                    onClick={() => setShowItemDetail(false)}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                        stroke="currentColor"
                                        className="w-5 h-5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                    Close
                                </button>


                                <button
                                    className="ml-36 w-6/12 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg"
                                    onClick={() => {
                                        addItemToCart(selectedItemToShow._id);
                                        setShowItemDetail(false);
                                    }}
                                >
                                    Add to Cart
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            }


            <SmallSuccess
                message={smlSccssMsg}
                isVisible={isVisible}
                onClose={() => setIsVisible(false)}
            />

        </div>
    );
};

export default OrderNow;