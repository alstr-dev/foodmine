import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PlusIcon } from "@heroicons/react/24/outline";
import Breadcrumbs from "../components/Breadcrumbs";

import Success from "../components/Success";
import Failed from "../components/Failed";

import EditItemModal from "./EditItemModal";

import { useAdmin } from "../AdminContext";

const Menu = () => {
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


    const [menu, setMenu] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredMenu, setFilteredMenu] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [currentCategory, setCurrentCategory] = useState(null);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    const [isErrorModalVisible, setIsErrorModalVisible] = useState(false); // Renamed for clarity
    const [errorModalMessage, setErrorModalMessage] = useState("");

    const [showItemDetail, setShowItemDetail] = useState(false);
    const [selectedItemToShow, setSelectedItemToShow] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');


    const fetchMenu = async () => {
        try {
            const response = await fetch("http://localhost:5000/admin/dashboard/menu");
            const menu = await response.json();
            setMenu(menu);
            setFilteredMenu(menu);
        } catch (error) {
            console.error("Error fetching menu:", error);
        }
    };

    const filterItems = (e) => {
        const value = e.target.value;
        setSearchQuery(value);

        const fltrdMenu = menu
            .map((category) => ({
                ...category,
                item: category.item.filter(
                    (item) =>
                        category.categoryName.toLowerCase().includes(value.toLowerCase()) ||
                        item.itemName.toLowerCase().includes(value.toLowerCase()) ||
                        item.itemDescription.toLowerCase().includes(value.toLowerCase())
                ),
            }))
            .filter((category) => category.item.length > 0);

        setFilteredMenu(fltrdMenu);
    };

    const openEditModal = (category, item) => {
        setCurrentCategory(category);
        setCurrentItem(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
        setCurrentCategory(null);
        setShowItemDetail(false);
    };

    const handleSave = async (updatedItem) => {

        try {
            const data = new FormData();

            data.append("item_id", updatedItem.item_id);
            data.append("category_id", updatedItem.category_id);
            data.append("itemName", updatedItem.itemName);
            data.append("itemDescription", updatedItem.itemDescription);
            data.append("itemDiet", updatedItem.itemDiet);
            data.append("itemPrice", updatedItem.itemPrice);
            data.append("discount", updatedItem.discount);
            data.append("categoryName", updatedItem.categoryName);

            if (updatedItem.dishImage) {
                data.append("dishImage", updatedItem.dishImage);
            }

            const response = await fetch("http://localhost:5000/admin/dashboard/update-item", {
                method: "POST",
                body: data,
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const result = await response.json();
            console.log("Success:", result);

            if (result) {
                closeModal();
                setShowItemDetail(false);

                setModalMessage("Item updated successfully");
                setIsModalVisible(true);

                fetchMenu();
            }

            return result;
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };


    const closeSuccessModal = () => {
        setModalMessage("");
        setIsModalVisible(false);
    }

    const showSuccess = (msg) => {
        setModalMessage(msg);
        setIsModalVisible(true);

        closeModal();

        fetchMenu();
    }

    const showFailure = (msg) => {
        setErrorModalMessage(msg);
        setIsErrorModalVisible(true);
    }

    const closeErrorModal = () => {
        setErrorModalMessage('');
        setIsErrorModalVisible(false);
    };

    useEffect(() => {
        fetchMenu();
    }, []);


    const showItemDetails = (category, itemSelected) => {
        setShowItemDetail(true);
        setSelectedCategory(category);
        setSelectedItemToShow(itemSelected);

        console.log(category, itemSelected);
    }

    return (
        <div>
            <Breadcrumbs />
            <div className="p-4 bg-gray-100 min-h-screen ml-1">
                {/* Search Bar */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search by category or item name..."
                        value={searchQuery}
                        onChange={filterItems}
                        className="w-full p-3 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg"
                    />

                    <Link
                        to="/menu/add-menu"
                        className="flex items-center gap-3 hover:bg-gray-700 p-3 rounded-md transition-all duration-200 group w-1/6 mt-2"
                    >
                        <PlusIcon className="h-6 w-6 text-gray-800 group-hover:text-white font-medium" />
                        <span className="text-gray-800 group-hover:text-white font-medium">
                            Add New Item
                        </span>
                    </Link>
                </div>

                {/* Menu Display */}
                {filteredMenu.length > 0 ? (
                    filteredMenu.map((category, index) => (
                        <div key={index} className="mb-8">
                            <h2 className="text-xl font-semibold mb-4 border-b-2 border-blue-500 pb-2">
                                {category.categoryName}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {category.item.map((item, itemIndex) => (
                                    <div key={itemIndex} className="bg-white rounded-lg shadow-md overflow-hidden hover:cursor-pointer"
                                        onClick={() => showItemDetails(category, item)}
                                    >
                                        <img
                                            src={`http://localhost:5000/restaurant/items/${item.itemImage}`}
                                            alt={item.itemName}
                                            className="w-full h-40 object-cover"
                                        />
                                        <div className="p-4">
                                            <h3 className="text-lg font-bold mb-2">{item.itemName}</h3>
                                            {/* <p className="text-gray-600 text-sm mb-2">{item.itemDescription}</p> */}

                                            <span className="bg-none block">
                                                {item.itemDescription.length > 25
                                                    ? item.itemDescription.slice(0, 25) + "..."
                                                    : item.itemDescription}
                                            </span>
                                            <div className="flex items-center text-sm mb-2">
                                                {/* <span className="font-semibold text-green-600">₹{item.itemPrice}</span> */}

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

                                                <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-md ml-24 w-20">
                                                    {item.discount}% OFF
                                                </span>
                                            </div>
                                            <button
                                                className="mt-2 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
                                                onClick={() => openEditModal(category, item)}
                                            >
                                                Edit Item
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-600">No items found.</p>
                )}


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
                                    Category: {selectedCategory.categoryName} | Diet: {selectedItemToShow.itemDiet}
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
                                            setShowItemDetail(false);
                                            openEditModal(selectedCategory, selectedItemToShow);
                                        }}
                                    >
                                        Edit Item
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                }


                {/* Modal */}
                {isModalOpen && (
                    <EditItemModal
                        item={currentItem}
                        category={currentCategory}
                        onClose={closeModal}
                        onSave={handleSave}
                        onSuccess={showSuccess}
                        onFailure={showFailure}
                    />
                )}


                {/* Success Modal */}
                <Success
                    show={isModalVisible}
                    message={modalMessage}
                    onClose={closeSuccessModal}
                />

                {/* Error Modal */}
                <Failed
                    show={isErrorModalVisible}
                    message={errorModalMessage}
                    onClose={closeErrorModal}
                />
            </div>
        </div>
    );
};


export default Menu;