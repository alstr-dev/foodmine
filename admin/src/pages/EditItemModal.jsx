import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";


const EditItemModal = ({ item, category, onClose, onSave, onSuccess, onFailure }) => {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [tFormData, setTFormData] = useState('');

    const [showDeleteModal, setShowDeleteModal] = useState(false);

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
        setTFormData(data);
        setShowConfirmation(true);

        // const formData = new FormData();
        // Object.entries(data).forEach(([key, value]) => {
        //     formData.append(key, value);
        // });

        // onSave({ ...data, categoryName: category.categoryName });
    };

    const confirmSave = () => {
        const formData = new FormData();
        Object.entries(tFormData).forEach(([key, value]) => {
            formData.append(key, value);
        });

        onSave({ ...tFormData, categoryName: category.categoryName });

        setShowConfirmation(false);
    };

    const cancelSave = () => {
        setShowConfirmation(false);
    };

    const handleDelete = async () => {
        console.log("Deleting item");

        setShowDeleteModal(false);

        console.log(item._id);
        console.log(category._id);

        const data = {
            itemId: item._id,
            ctgyId: category._id
        }

        try {
            const res = await fetch("http://localhost:5000/admin/dashboard/delete-item", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const response = await res.json();

            console.log(response);

            if (response) {
                onSuccess(`Item: ${item.itemName} delted successfully.`);
            } else {
                onFailure(`Failed to delete item: ${item.itemName}.`);
            }

        } catch (error) {
            console.log(error);
            onFailure(`Failed to delete item: ${item.itemName}.`);
        }
    };

    const handleCancel = () => {
        setShowDeleteModal(false);
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
                            type="button"
                            onClick={() => setShowDeleteModal(true)}
                            className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 focus:ring-2 focus:ring-red-300 focus:outline-none transition w-2/4 ml-4"
                        >
                            Delete Item
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

            {/* Confirmation Popup */}
            {showConfirmation && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white w-1/4 rounded-lg shadow-lg p-4">
                        <h3 className="text-lg font-semibold mb-4">Confirm Changes</h3>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to save the changes?
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={cancelSave}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmSave}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-1/3">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirm Delete</h2>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this item? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            {/* Cancel Button */}
                            <button
                                onClick={handleCancel}
                                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                            >
                                Cancel
                            </button>

                            {/* Delete Button */}
                            <button
                                onClick={handleDelete}
                                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default EditItemModal;