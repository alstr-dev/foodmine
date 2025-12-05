// import { div } from "framer-motion/m";
// import React from "react";

// const TestFile = () => {
//     <div>

//     </div>
// }

// export default TestFile;


import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";

const TestFile = () => {
    const [menu, setMenu] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredMenu, setFilteredMenu] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [currentCategory, setCurrentCategory] = useState(null);


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
            return result;
        } catch (error) {
            console.error("Error submitting form:", error);
        }


        closeModal();
    };

    useEffect(() => {
        fetchMenu();
    }, []);

    return (
        <div className="p-4 bg-gray-100 min-h-screen">
            {/* Search Bar */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search by category or item name..."
                    value={searchQuery}
                    onChange={filterItems}
                    className="w-full p-3 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg"
                />
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
                                <div key={itemIndex} className="bg-white rounded-lg shadow-md overflow-hidden">
                                    <img
                                        src={`http://localhost:5000/restaurant/items/${item.itemImage}`}
                                        alt={item.itemName}
                                        className="w-full h-40 object-cover"
                                    />
                                    <div className="p-4">
                                        <h3 className="text-lg font-bold mb-2">{item.itemName}</h3>
                                        <p className="text-gray-600 text-sm mb-2">{item.itemDescription}</p>
                                        <div className="flex items-center justify-between text-sm mb-2">
                                            <span className="font-semibold text-green-600">₹{item.itemPrice}</span>
                                            <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-md">
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

            {/* Modal */}
            {isModalOpen && (
                <EditItemModal
                    item={currentItem}
                    category={currentCategory}
                    onClose={closeModal}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};


const EditItemModal = ({ item, category, onClose, onSave }) => {
    console.log(item);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
        trigger,
        setError,
        clearErrors,
    } = useForm({
        defaultValues: {
            item_id: item._id,
            category_id: category._id,
            itemName: item.itemName,
            itemDescription: item.itemDescription,
            itemDiet: item.itemDiet,
            itemPrice: item.itemPrice,
            discount: item.discount,
            dishImage: null,
        },
    });

    const dishImage = watch("dishImage");

    const onSubmit = (data) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value);
        });

        onSave({ ...data, categoryName: category.categoryName });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setValue("dishImage", file);
        }
    };

    const handleClearImage = () => {
        setValue("dishImage", null);
    };


    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-11/12 md:w-2/3 lg:w-3/6 relative animate-fade-in">
                <h2 className="text-xl font-bold mb-4">Edit Item</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="flex space-x-4">
                        <div>
                            {/* Item Name */}
                            <input
                                {...register("itemName", {
                                    required: "Item name is required",
                                })}
                                placeholder="Item Name"
                                className="w-full p-3 border rounded-md"
                            />
                            {errors.itemName ? (
                                <p className="text-red-500 text-sm">{errors.itemName.message}</p>
                            ) : (
                                <p className="text-sm h-4 mt-1"></p>
                            )}

                            {/* Item Description */}
                            <textarea
                                {...register("itemDescription", {
                                    required: "Item description is required",
                                })}
                                placeholder="Item Description"
                                className="w-full p-3 border rounded-md mt-2"
                                rows={3}
                            />
                            {errors.itemDescription ? (
                                <p className="text-red-500 text-sm">{errors.itemDescription.message}</p>
                            ) : (
                                <p className="text-sm h-4 mt-1"></p>
                            )}

                            {/* Diet */}
                            <select
                                {...register("itemDiet", {
                                    required: "Diet selection is required",
                                })}
                                className="w-full p-3 border rounded-md mt-2"
                            >
                                <option value="">Select Diet</option>
                                <option value="veg">Veg</option>
                                <option value="non-veg">Non-Veg</option>
                                <option value="vegan">Vegan</option>
                            </select>
                            {errors.itemDiet ? (
                                <p className="text-red-500 text-sm">{errors.itemDiet.message}</p>
                            ) : (
                                <p className="text-sm h-4 mt-1"></p>
                            )}

                            {/* Price and Discount */}
                            <div className="flex gap-4 mt-2">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Item price</label>
                                    {/* Price Input */}
                                    <input
                                        {...register("itemPrice", {
                                            required: "Price should not be less than 10₹",
                                            valueAsNumber: true,
                                            min: { value: 10, message: "Price should not be less than 10₹" },
                                        })}
                                        placeholder="Price"
                                        type="number"
                                        className="w-full p-3 border rounded-md input-no-spinner"
                                        onWheel={(e) => e.target.blur()}
                                    />
                                    {errors.itemPrice ? (
                                        <p className="text-red-500 text-sm">{errors.itemPrice.message}</p>
                                    ) : (
                                        <p className="text-sm h-9 mt-1"></p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Discount percentage</label>
                                    {/* Discount Input */}
                                    <input
                                        {...register("discount", {
                                            valueAsNumber: true,
                                            required: { value: true, message: "Discount should be between 0% to 60%" },
                                            min: { value: 0, message: "Discount should be between 0% to 60%" },
                                            max: { value: 60, message: "Discount should be between 0% to 60%" },
                                        })}
                                        placeholder="Discount (%)"
                                        type="number"
                                        className="w-full p-3 border rounded-md input-no-spinner"
                                        onWheel={(e) => e.target.blur()} // Disable value change on scroll
                                    />
                                    {errors.discount ? (
                                        <p className="text-red-500 text-sm">{errors.discount.message}</p>
                                    ) : (
                                        <p className="text-sm h-9 mt-1"></p>
                                    )}

                                </div>

                                {/* Discount Amount Display */}
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Discount Amount</label>
                                    <input
                                        value={(() => {
                                            const price = watch("itemPrice") || 0;
                                            const discount = watch("discount") || 0;
                                            return `₹ ${((price * discount) / 100).toFixed(2)}`; // Calculate discount amount
                                        })()}
                                        readOnly
                                        className="w-full p-3 border rounded-md bg-gray-100 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>


                        {/* Image Section */}
                        <div className="space-y-0">
                            <div className="flex flex-col items-center ml-6">
                                {/* Current Image */}
                                <div className="flex flex-col items-center mt-0">
                                    <img
                                        src={
                                            item.itemImage
                                                ? `http://localhost:5000/restaurant/items/${item.itemImage}`
                                                : "/path/to/default-image.jpg"
                                        }
                                        alt="Current Item"
                                        className="w-40 h-40 object-contain rounded-md border-2 border-gray-300"
                                    />
                                    <p className="text-sm text-gray-600 mt-0">Current Image</p>
                                </div>

                                {/* New Image */}
                                <div className="flex flex-col items-center mt-5">
                                    {dishImage ? (
                                        <div className="relative">
                                            <img
                                                src={URL.createObjectURL(dishImage)}
                                                alt="New Item Preview"
                                                className="w-40 h-40 object-contain rounded-md border-2 border-gray-300"
                                            />
                                            <button
                                                onClick={handleClearImage}
                                                type="button"
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M6 18L18 6M6 6l12 12"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex items-center justify-center w-40 h-40 bg-gray-200 rounded-md cursor-pointer hover:bg-gray-300">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageChange}
                                            />
                                            <span className="text-gray-500 text-sm">Select new image</span>
                                        </label>
                                    )}
                                    <p className="text-sm text-gray-600 mt-0">New Image</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-between mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-400 text-white px-6 py-2 rounded-md hover:bg-gray-500 transition w-2/4 mr-4"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition w-2/4 ml-4"
                        >
                            Save changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default TestFile;