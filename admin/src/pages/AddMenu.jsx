import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import Success from "../components/Success";
import Failed from "../components/Failed";
import { useAdmin } from "../AdminContext";


const AddMenu = () => {
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


    const [darkMode, setDarkMode] = useState(false);

    const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
    const [successModalMessage, setSuccessModalMessage] = useState('');

    const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
    const [errorModalMessage, setErrorModalMessage] = useState('');

    const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);

    const {
        register,
        handleSubmit,
        getValues,
        control,
        trigger,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            categories: [{
                name: '',
                newName: '',
                items: [{ name: '', description: '', diet: '', imageSrc: '', imageFile: '', itemPrice: '', discount: '' }]
            }],
        },
    });

    const [item, setItem] = useState('');


    const [exstngCategories, setExistingCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newCategory, setNewCategory] = useState("");

    const handleCategoryChange = (e) => {
        const value = e.target.value;

        if (value === "add_new") {
            e.target.value = "";

            setSelectedCategory("");
            setIsAddingNew(true);
        } else {
            setSelectedCategory(value);
        }
    };


    const handleImageChangeForDish = (e, categoryIndex, itemIndex) => {

        const file = e.target.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newFileName = `${categoryIndex}_${itemIndex}_${file.name}`;

                const newFile = new File([file], newFileName, { type: file.type });

                categories[categoryIndex].items[itemIndex].imageSrc = reader.result; // Update image source
                categories[categoryIndex].items[itemIndex].imageFile = file; // Update image source

                trigger(categories[categoryIndex].items[itemIndex].imageSrc);
            };

            reader.readAsDataURL(file);
        }
    };



    const { fields: categories, append: addCategory, remove: removeCategory } = useFieldArray({
        control,
        name: 'categories',
    });


    const handleAddItem = (categoryIndex) => {
        const category = categories[categoryIndex];

        const newItem = category.items.push({ name: '', description: '', diet: '', imageSrc: '', imageFile: '', itemPrice: '', discount: '' });

        setItem(newItem);
    };


    const handleRemoveItem = (categoryIndex, itemIndex) => {
        const category = categories[categoryIndex];

        if (categoryIndex === 0 && category.items.length === 1) {
            alert("At least one item must be under the first category.");
            return;
        }

        const newItem = category.items.splice(itemIndex, 1);
        setItem(newItem);
    };


    const handleAddCategory = () => {
        addCategory({ name: '', items: [{ name: '', description: '', diet: '', imageSrc: '', imageFile: '', itemPrice: '', discount: '' }] });
    };


    // RemoveCategory function
    const handleRemoveCategory = (index) => {
        if (categories.length > 1) {
            removeCategory(index);
        } else {
            alert("At least one category is required."); // Notify user
        }
    };


    const handleDiscardImageForDish = (categoryIndex, itemIndex) => {
        categories[categoryIndex].items[itemIndex].imageSrc = '';
        categories[categoryIndex].items[itemIndex].imageFile = '';

        trigger(categories[categoryIndex].items[itemIndex].imageSrc);
    };


    // Fetching existing category names
    const fetchCtgyNames = async () => {
        try {
            const response = await fetch("http://localhost:5000/admin/dashboard/menu-categories");

            const avlCategories = await response.json();

            setExistingCategories(avlCategories);

        } catch (error) {

        }
    }


    useEffect(() => {
        fetchCtgyNames();
    }, []);


    // Submit form
    const onSubmit = async (data) => {

        setIsSubmitDisabled(true);

        const formData = new FormData();

        let cName = "";
        data.categories.forEach((category) => {
            if (category.newName !== '') {
                cName = category.newName;
            } else {
                cName = category.name;
            }
        })

        const json = {
            categories: data.categories.map((category) => ({
                name: cName,
                items: category.items.map((item) => ({
                    name: item.name,
                    description: item.description,
                    diet: item.diet,
                    price: item.itemPrice,
                    discount: item.discount,
                })),
            })),
        };

        formData.append("data", JSON.stringify(json));

        categories.forEach((category) => {
            category.items.forEach((item, index) => {
                if (item.imageFile) {
                    formData.append(`dishImage`, item.imageFile);
                }
            });
        });

        try {
            const response = await fetch("http://localhost:5000/admin/dashboard/add-item", {
                method: "POST",
                body: formData
            });

            const isAdded = await response.json();

            if (isAdded.value === 1) {
                setSuccessModalMessage(isAdded.message);
                setIsSuccessModalVisible(true);
            } else if (isAdded.value === 2) {
                setErrorModalMessage(isAdded.message);
                setIsErrorModalVisible(true);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };


    const closeSuccessModal = () => {
        setSuccessModalMessage('');
        setIsSuccessModalVisible(false);

        navigate("/menu");
    }

    const closeErrorModal = () => {
        setErrorModalMessage('');
        setIsErrorModalVisible(false);
    }


    return (
        <div className="">
            <Breadcrumbs />

            <div className="flex flex-col justify-center items-center h-screen w-full px-5">

                <form action="/restaurant/register" method="post" className="mt-6 mb-6 mx-auto w-7/12 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>

                    <div className="">

                        {categories.map((category, categoryIndex) => (
                            <div key={categoryIndex} className="border rounded-lg p-5 bg-white shadow-md my-2">

                                <div className="mb-3 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-neutral-300 after:mt-0.5 after:flex-1 after:border-t after:border-neutral-300">
                                    <p className="mx-4 text-center">Add new item</p>
                                </div>


                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-2/3">
                                        {!isAddingNew ? (
                                            <div>
                                                <select
                                                    value={selectedCategory}
                                                    onInput={handleCategoryChange}
                                                    {...register(`categories.${categoryIndex}.name`,
                                                        {
                                                            required: { value: true, message: "Category name must not be empty" },
                                                            minLength: { value: 3, message: "Category name must be 3 characters long" },
                                                            maxLength: { value: 50, message: "Category name must be under length of 50 characters" }
                                                        })
                                                    }
                                                    className="w-full p-2 border-b-2 border-gray-300 focus:border-blue-500 outline-none text-sm font-semibold"
                                                >
                                                    <option value="" disabled>
                                                        Select Category
                                                    </option>
                                                    {exstngCategories.map((category, index) => (
                                                        <option key={index} value={category._id}>
                                                            {category.name}
                                                        </option>
                                                    ))}
                                                    <option value="add_new">+ Add New Category</option>
                                                </select>

                                                {errors.categories &&
                                                    errors.categories[categoryIndex] &&
                                                    errors.categories[categoryIndex].name ? (
                                                    <p className="text-xs text-red-500 flex items-center mt-2">
                                                        {errors.categories[categoryIndex].name.message}
                                                    </p>
                                                ) : (
                                                    <p className="text-xs mt-1 h-4"></p>
                                                )}
                                            </div>

                                        ) : (
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="New Category Name"
                                                        value={newCategory}
                                                        onInput={(e) => {
                                                            setNewCategory(e.target.value)
                                                        }}
                                                        className="flex-1 p-2 border-b-2 border-gray-300 focus:border-blue-500 outline-none text-sm"
                                                        {...register(`categories.${categoryIndex}.newName`,
                                                            {
                                                                validate: { notEmpty: value => value.trim() !== "" || "Category name must not be empty" },
                                                                required: { value: true, message: "Category name must not be empty" },
                                                                minLength: { value: 3, message: "Category name must be 3 characters long" },
                                                                maxLength: { value: 50, message: "Category name must be under length of 50 characters" }
                                                            }
                                                        )}
                                                    />
                                                </div>

                                                {errors.categories &&
                                                    errors.categories[categoryIndex] &&
                                                    errors.categories[categoryIndex].newName ? (
                                                    <p className="text-xs text-red-500 flex items-center mt-2">
                                                        {errors.categories[categoryIndex].newName.message}
                                                    </p>
                                                ) : (
                                                    <p className="text-xs mt-1 h-4"></p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>


                                {category.items.map((item, itemIndex) => (

                                    <div key={itemIndex} className='p-5 bg-white shadow-md my-2'>
                                        <div className="flex items-start mb-3">
                                            <div className="flex-1 pr-3">
                                                <div>
                                                    <input
                                                        type="text"
                                                        placeholder="Dish Name"
                                                        {...register(`categories.${categoryIndex}.items.${itemIndex}.name`,
                                                            {
                                                                pattern: { value: /^[a-zA-Z0-9 .,-]*$/, message: "Invalid dish name" },
                                                                required: { value: true, message: "Dish name must not be empty" },
                                                                minLength: { value: 3, message: "Dish name must be 3 characters long" },
                                                                maxLength: { value: 50, message: "Dish name must be under 3 to 50 characters" }
                                                            }
                                                        )}
                                                        className="w-full p-2 mb-1 border-b-2 border-gray-300 focus:border-blue-500 outline-none text-sm"
                                                    />

                                                    {errors.categories &&
                                                        errors.categories[categoryIndex] &&
                                                        errors.categories[categoryIndex].items &&
                                                        errors.categories[categoryIndex].items[itemIndex] &&
                                                        errors.categories[categoryIndex].items[itemIndex].name ? (
                                                        <p className="text-xs text-red-500 mt-1">
                                                            {errors.categories[categoryIndex].items[itemIndex].name.message}
                                                        </p>
                                                    ) : (
                                                        <p className="text-xs mt-1 h-4"></p>
                                                    )}
                                                </div>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder="Dish Description"
                                                        {...register(`categories.${categoryIndex}.items.${itemIndex}.description`,
                                                            {
                                                                pattern: { value: /^[a-zA-Z0-9 ,.-]*$/, message: "Invalid dish description" },
                                                                required: { value: true, message: "Dish description must not be empty" },
                                                                minLength: { value: 3, message: "Dish description must be 3 characters long" },
                                                                maxLength: { value: 150, message: "Dish description must be under 3 to 50 characters" }
                                                            }
                                                        )}
                                                        className="w-full p-2 mb-1 border-b-2 border-gray-300 focus:border-blue-500 outline-none text-sm"
                                                    />

                                                    {errors.categories &&
                                                        errors.categories[categoryIndex] &&
                                                        errors.categories[categoryIndex].items &&
                                                        errors.categories[categoryIndex].items[itemIndex] &&
                                                        errors.categories[categoryIndex].items[itemIndex].description ? (
                                                        <p className="text-xs text-red-500 mt-1">
                                                            {errors.categories[categoryIndex].items[itemIndex].description.message}
                                                        </p>
                                                    ) : (
                                                        <p className="text-xs mt-1 h-4"></p>
                                                    )}
                                                </div>
                                                <div>
                                                    <select
                                                        {...register(`categories.${categoryIndex}.items.${itemIndex}.diet`,
                                                            {
                                                                required: { value: true, message: "Diet is required" }
                                                            }
                                                        )}
                                                        className="w-full mb-1 border-b-2 border-gray-300 focus:border-blue-500 outline-none p-1 bg-white text-sm mt-4"
                                                    >
                                                        <option value="" className="">Select Diet</option>
                                                        <option value="veg">Veg</option>
                                                        <option value="non-veg">Non-Veg</option>
                                                        <option value="vegan">Vegan</option>
                                                    </select>

                                                    {errors.categories &&
                                                        errors.categories[categoryIndex] &&
                                                        errors.categories[categoryIndex].items &&
                                                        errors.categories[categoryIndex].items[itemIndex] &&
                                                        errors.categories[categoryIndex].items[itemIndex].diet ? (
                                                        <p className="text-xs text-red-500 mt-1">
                                                            {errors.categories[categoryIndex].items[itemIndex].diet.message}
                                                        </p>
                                                    ) : (
                                                        <p className="text-xs mt-1 h-4"></p>
                                                    )}
                                                </div>



                                                <div className="flex space-x-6">
                                                    <div>
                                                        <input
                                                            type="number"
                                                            placeholder="Dish Price"
                                                            {...register(`categories.${categoryIndex}.items.${itemIndex}.itemPrice`,
                                                                {
                                                                    required: { value: true, message: "Item price is required" },
                                                                    validate: {
                                                                        minValue: (value) =>
                                                                            value >= 30 || "Item price must be at least 30 rupees",
                                                                    },
                                                                }
                                                            )}
                                                            className="flex-1 p-2 border-b-2 border-gray-300 focus:border-blue-500 outline-none text-sm appearance-none input-no-spinner"
                                                        />

                                                        {errors.categories &&
                                                            errors.categories[categoryIndex] &&
                                                            errors.categories[categoryIndex].items &&
                                                            errors.categories[categoryIndex].items[itemIndex] &&
                                                            errors.categories[categoryIndex].items[itemIndex].itemPrice ? (
                                                            <p className="text-xs text-red-500 mt-1">
                                                                {errors.categories[categoryIndex].items[itemIndex].itemPrice.message}
                                                            </p>
                                                        ) : (
                                                            <p className="text-xs mt-1 h-4"></p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <input
                                                            type="number"
                                                            placeholder="Discount"
                                                            {...register(`categories.${categoryIndex}.items.${itemIndex}.discount`,
                                                                {
                                                                    required: { value: true, message: "Item discount must be from 0 to n" },
                                                                    validate: {
                                                                        minValue: (value) =>
                                                                            value >= 0 || "Item discount must be from 0 to n",
                                                                    },
                                                                }
                                                            )}
                                                            className="flex-1 p-2 border-b-2 border-gray-300 focus:border-blue-500 outline-none text-sm appearance-none input-no-spinner"
                                                        />

                                                        {errors.categories &&
                                                            errors.categories[categoryIndex] &&
                                                            errors.categories[categoryIndex].items &&
                                                            errors.categories[categoryIndex].items[itemIndex] &&
                                                            errors.categories[categoryIndex].items[itemIndex].discount ? (
                                                            <p className="text-xs text-red-500 mt-1">
                                                                {errors.categories[categoryIndex].items[itemIndex].discount.message}
                                                            </p>
                                                        ) : (
                                                            <p className="text-xs mt-1 h-4"></p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="relative">
                                                {item.imageSrc ? (
                                                    <>
                                                        <img
                                                            src={item.imageSrc}
                                                            alt="Dish Preview"
                                                            className="w-56 h-56 object-cover rounded-md border-2 border-gray-300"
                                                            style={{ objectFit: 'contain' }}
                                                        />
                                                        <button
                                                            onClick={() => handleDiscardImageForDish(categoryIndex, itemIndex)}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                                            aria-label="Remove Image"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="h-4 w-4"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                            >
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </>
                                                ) : (

                                                    <label className="flex items-center justify-center w-56 h-56 bg-gray-200 rounded-md cursor-pointer hover:bg-gray-300">

                                                        <input
                                                            type="file"
                                                            id={`item_file_input_${categoryIndex}_${itemIndex}`}
                                                            className="hidden"
                                                            accept=".jpg,.jpeg"
                                                            onInput={(e) => {
                                                                const file = e.target.files[0];
                                                                if (file && !["image/jpeg", "image/jpg"].includes(file.type)) {
                                                                    alert("Only JPG and JPEG files are allowed.");
                                                                    e.target.value = "";
                                                                    return;
                                                                }
                                                                handleImageChangeForDish(e, categoryIndex, itemIndex);
                                                            }}
                                                            {...register(`categories.${categoryIndex}.items.${itemIndex}.imageFile`, {
                                                                required: { value: true, message: "Dish image is required" },
                                                                validate: {
                                                                    validSize: (value) => {
                                                                        const file = value[0];
                                                                        return (
                                                                            file && file.size <= 5 * 1024 * 1024
                                                                        ) || "File size must be less than 5MB";
                                                                    },
                                                                },
                                                            })}
                                                        />

                                                        <span className="text-gray-500 text-sm">Select dish Image</span>
                                                    </label>
                                                )}

                                                {errors.categories?.[categoryIndex]?.items?.[itemIndex]?.imageFile ? (
                                                    <p className="ml-1 mt-1 text-xs text-red-500">
                                                        *{errors.categories[categoryIndex].items[itemIndex].imageFile.message}
                                                    </p>
                                                ) : (
                                                    <p className="text-xs mt-1 h-4"></p>
                                                )}
                                            </div>
                                        </div>


                                        <button
                                            type="submit"
                                            className={`mt-5 tracking-wide font-semibold w-full py-4 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none ${isSubmitDisabled ? "bg-gray-400 text-gray-200 cursor-not-allowed" : "bg-[#E9522C] text-gray-100 hover:bg-[#E9522C]/90"}`}
                                            disabled={isSubmitDisabled}
                                        >
                                            <svg
                                                className="w-6 h-6 -ml-2"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                                <circle cx="8.5" cy="7" r="4" />
                                                <path d="M20 8v6M23 11h-6" />
                                            </svg>
                                            <span className="ml-3">Add item</span>
                                        </button>

                                    </div>
                                ))}
                            </div>
                        ))}

                    </div>

                </form>
            </div>


            {/* Success Modal */}
            <Success
                show={isSuccessModalVisible}
                message={successModalMessage}
                onClose={closeSuccessModal}
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
export default AddMenu;
