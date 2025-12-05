import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";


const ResRegistrationForm = () => {
    const [darkMode, setDarkMode] = useState(false);

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
                items: [{ name: '', description: '', diet: '', imageSrc: '', imageFile: '' }]
            }],
        },
    });


    const [imagePreview, setImagePreview] = useState(''); // Only for showing restaurant image preview
    const [item, setItem] = useState('');


    const [isMenuDetailsVisible, setIsMenuDetailsVisible] = useState(false);
    const [isFormHidden, setIsFormHidden] = useState(false);




    // const [temCategories, setTempCategories] = useState([
    //     { name: '', items: [{ name: '', description: '', diet: '', imageSrc: null }], imageSrc: null }, // Default category with one item
    // ]);

    // const tempAddCategory = () => {
    //     setTempCategories([...categories, { name: '', items: [{ name: '', description: '', diet: '', imageSrc: null }], imageSrc: null }]);
    // };

    // const removeTempCategory = (index) => {
    //     const newCategories = categories.filter((_, i) => i !== index);
    //     setTempCategories(newCategories);
    // };

    // const addItem = (index) => {
    //     const newCategories = [...categories];
    //     newCategories[index].items.push({ name: '', description: '', diet: '', imageSrc: null });
    //     setCategories(newCategories);
    // };

    // const removeItem = (categoryIndex, itemIndex) => {
    //     const newCategories = [...categories];
    //     newCategories[categoryIndex].items.splice(itemIndex, 1);
    //     setCategories(newCategories);
    // };

    // const handleCategoryChange = (index, value) => {
    //     const newCategories = [...categories];
    //     newCategories[index].name = value;
    //     setCategories(newCategories);
    // };

    // const handleItemChange = (categoryIndex, itemIndex, value) => {
    //     const newCategories = [...categories];
    //     newCategories[categoryIndex].items[itemIndex].name = value;
    //     setCategories(newCategories);
    // };

    // const handleDescriptionChange = (categoryIndex, itemIndex, value) => {
    //     const newCategories = [...categories];
    //     newCategories[categoryIndex].items[itemIndex].description = value;
    //     setCategories(newCategories);
    // };

    // const handleDietChange = (categoryIndex, itemIndex, diet) => {
    //     const newCategories = [...categories];
    //     newCategories[categoryIndex].items[itemIndex].diet = diet;
    //     setCategories(newCategories);
    // };

    // const handleImageChangeForDish = (event, categoryIndex, itemIndex) => {
    //     const file = event.target.files[0];
    //     if (file) {
    //         const reader = new FileReader();
    //         reader.onload = (e) => {
    //             const newCategories = [...categories];
    //             newCategories[categoryIndex].items[itemIndex].imageSrc = e.target.result;
    //             setCategories(newCategories);
    //         };
    //         reader.readAsDataURL(file);
    //     } else {
    //         // Clear the image source if the file selection is canceled
    //         const newCategories = [...categories];
    //         newCategories[categoryIndex].items[itemIndex].imageSrc = null;
    //         setCategories(newCategories);
    //     }
    // };

    const handleImageChangeForDish = (e, categoryIndex, itemIndex) => {

        const file = e.target.files[0];

        console.log(categoryIndex + "_" + itemIndex);


        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newFileName = `${categoryIndex}_${itemIndex}_${file.name}`;

                const newFile = new File([file], newFileName, { type: file.type });

                console.log(newFile);

                categories[categoryIndex].items[itemIndex].imageSrc = reader.result; // Update image source
                categories[categoryIndex].items[itemIndex].imageFile = file; // Update image source

                trigger(categories[categoryIndex].items[itemIndex].imageSrc);

                console.log(file.name);
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

        const newItem = category.items.push({ name: '', description: '', diet: '', imageSrc: '', imageFile: '' });

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
        addCategory({ name: '', items: [{ name: '', description: '', diet: '', imageSrc: '', imageFile: '' }] });
    };


    // Updated removeCategory function
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


    // const handleInputChange = (e) => {
    //     const { name, value } = e.target;
    //     setFormData((prevData) => ({ ...prevData, [name]: value }));
    // };


    const handleNextClick = () => {
        setIsMenuDetailsVisible(true);
        setIsFormHidden(true);
    };

    const handleBackClick = () => {
        setIsFormHidden(false);
        setIsMenuDetailsVisible(false);
    };

    // Handle image change and update preview using getValues
    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result); // Set the preview
                setValue("resImagePreview", file); // Update the file in react-hook-form
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDiscardImage = () => {
        setImagePreview(''); // Remove the preview
        setValue("resImagePreview", null); // Clear the file in react-hook-form
    };


    // Submit form
    const onSubmit = async (data) => {

        const formData = new FormData();

        formData.append("resImagePreview", data.resImagePreview);

        const json = {
            resName: data.resName,
            resPhone: data.resPhone,
            resEmail: data.resEmail,
            resAddress: data.resAddress,
            resState: data.resState,
            resDistrict: data.resDistrict,
            resCity: data.resCity,
            resPincode: data.resPincode,
            resPassword: data.resPassword,
            resCPassword: data.resCPassword,
            categories: data.categories.map((category) => ({
                name: category.name,
                items: category.items.map((item) => ({
                    name: item.name,
                    description: item.description,
                    diet: item.diet,
                    // imageSrc: item.imageSrc ? item.imageSrc.name : null, // Sending image name as a placeholder
                })),
            })),
        };

        // Append the JSON data as a Blob to FormData
        formData.append("data", new Blob([JSON.stringify(json)], { type: "application/json" }));

        // Append individual dish images
        categories.forEach((category) => {
            category.items.forEach((item, index) => {
                if (item.imageFile) {
                    formData.append(`dishImage_${category.name}_${index}_${item.name}`, item.imageFile);
                    console.log(item.imageFile);

                }
            });
        });

        // Make API request using Fetch
        try {
            const response = await fetch("http://localhost:5000/restaurant/register", {
                method: "POST",
                body: formData
            });

            if (response.ok) {
                console.log("Form submitted successfully!");
            } else {
                console.error("Form submission failed.");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };




    return (
        // <div className="flex flex-col justify-center items-center w-full h-[100vh] bg-[#282D2D] px-5">
        <div className="flex flex-col justify-center items-center w-full bg-[#eff4f4] px-5">
            <div className=" flex flex-col items-end justify-start  overflow-hidden mb-2 xl:max-w-3xl w-full">
                <div className="flex">

                    {/* For enabling dark mode */}
                    {/* <h3 className="text-white">Dark Mode : &nbsp;</h3>
                    <label class="inline-flex relative items-center mr-5 cursor-pointer">
                        <input
                        value={formData.resImagePreview}
              onChange={handleInputChange}
                            type="checkbox"
                            className="sr-only peer"
                            checked={darkMode}
                            readOnly
                        />
                        <div
                            onClick={() => {
                                setDarkMode(!darkMode);
                            }}
                            className="w-11 h-6 bg-gray-200 rounded-full peer  peer-focus:ring-green-300  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"
                        ></div>
                    </label> */}
                </div>
            </div>
            <div className={`mb-8 mt-8 xl:max-w-3xl ${darkMode ? "bg-black" : "bg-white"}  w-full p-5 sm:p-10 rounded-md`}>
                <h1 className={`text-center text-xl sm:text-3xl font-semibold ${darkMode ? "text-white" : "text-black"}`}>
                    Register your restaurant
                </h1>
                <div className="w-full mt-8">
                    <form action="/restaurant/register" method="post" className="mx-auto max-w-xs sm:max-w-md md:max-w-lg flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>

                        {!isFormHidden && (
                            <div className="">

                                <div className="my-8 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-neutral-300 after:mt-0.5 after:flex-1 after:border-t after:border-neutral-300">
                                    <p className="mx-4 text-center">
                                        Restaurant Details
                                    </p>
                                </div>


                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        className={`w-full px-5 py-3 font-medium border-b-2 border-gray-300 outline-none text-sm ${darkMode
                                            ? "bg-[#302E30] text-white focus:border-white"
                                            : "bg-white focus:border-blue-500"
                                            }`}
                                        type="text"
                                        placeholder="Restaurant name"

                                        {...register("resName",
                                            {
                                                required: { value: true, message: "First name must not be empty" },
                                                minLength: { value: 3, message: "First name must be 3 characters long" },
                                                maxLength: { value: 50, message: "First name must be under length of 50 characters" }
                                            })
                                        }
                                    />
                                    {errors.resName && <p class="text-xs text-red-500 flex items-center mt-2">{errors.resName.message}</p>}
                                    <input
                                        className={`w-full px-5 py-3 font-medium border-b-2 border-gray-300 outline-none text-sm ${darkMode
                                            ? "bg-[#302E30] text-white focus:border-white"
                                            : "bg-white focus:border-blue-500"
                                            }`}
                                        type="text"
                                        placeholder="Phone number"
                                        {...register("resPhone",
                                            {
                                                required: { value: true, message: "First name must not be empty" },
                                                minLength: { value: 3, message: "First name must be 3 characters long" },
                                                maxLength: { value: 50, message: "First name must be under length of 50 characters" }
                                            })
                                        }
                                    />
                                    {errors.resPhone && <p class="text-xs text-red-500 flex items-center mt-2">{errors.resPhone.message}</p>}
                                </div>
                                <input
                                    className={`w-full px-5 py-3 font-medium border-b-2 border-gray-300 outline-none text-sm ${darkMode
                                        ? "bg-[#302E30] text-white focus:border-white"
                                        : "bg-white focus:border-blue-500"
                                        }`}
                                    type="email"
                                    placeholder="Email id"
                                    {...register("resEmail",
                                        {
                                            required: { value: true, message: "First name must not be empty" },
                                            minLength: { value: 3, message: "First name must be 3 characters long" },
                                            maxLength: { value: 50, message: "First name must be under length of 50 characters" }
                                        })
                                    }
                                />
                                {errors.resEmail && <p class="text-xs text-red-500 flex items-center mt-2">{errors.resEmail.message}</p>}
                                <input
                                    className={`w-full px-5 py-3 font-medium border-b-2 border-gray-300 outline-none text-sm ${darkMode
                                        ? "bg-[#302E30] text-white focus:border-white"
                                        : "bg-white focus:border-blue-500"
                                        }`}
                                    type="text"
                                    placeholder="Address, city, street, locality..."
                                    {...register("resAddress",
                                        {
                                            required: { value: true, message: "First name must not be empty" },
                                            minLength: { value: 3, message: "First name must be 3 characters long" },
                                            maxLength: { value: 50, message: "First name must be under length of 50 characters" }
                                        })
                                    }
                                />
                                {errors.resAddress && <p class="text-xs text-red-500 flex items-center mt-2">{errors.resAddress.message}</p>}

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        className={`w-full px-5 py-3 font-medium border-b-2 border-gray-300 outline-none text-sm ${darkMode
                                            ? "bg-[#302E30] text-white focus:border-white"
                                            : "bg-white focus:border-blue-500"
                                            }`}
                                        type="text"
                                        placeholder="State"
                                        {...register("resState",
                                            {
                                                required: { value: true, message: "First name must not be empty" },
                                                minLength: { value: 3, message: "First name must be 3 characters long" },
                                                maxLength: { value: 50, message: "First name must be under length of 50 characters" }
                                            })
                                        }
                                    />
                                    {errors.resState && <p class="text-xs text-red-500 flex items-center mt-2">{errors.resState.message}</p>}
                                    <input
                                        className={`w-full px-5 py-3 font-medium border-b-2 border-gray-300 outline-none text-sm ${darkMode
                                            ? "bg-[#302E30] text-white focus:border-white"
                                            : "bg-white focus:border-blue-500"
                                            }`}
                                        type="text"
                                        placeholder="District"
                                        {...register("resDistrict",
                                            {
                                                required: { value: true, message: "First name must not be empty" },
                                                minLength: { value: 3, message: "First name must be 3 characters long" },
                                                maxLength: { value: 50, message: "First name must be under length of 50 characters" }
                                            })
                                        }
                                    />
                                    {errors.resDistrict && <p class="text-xs text-red-500 flex items-center mt-2">{errors.resDistrict.message}</p>}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        className={`w-full px-5 py-3 font-medium border-b-2 border-gray-300 outline-none text-sm ${darkMode
                                            ? "bg-[#302E30] text-white focus:border-white"
                                            : "bg-white focus:border-blue-500"
                                            }`}
                                        type="text"
                                        placeholder="City"
                                        {...register("resCity",
                                            {
                                                required: { value: true, message: "First name must not be empty" },
                                                minLength: { value: 3, message: "First name must be 3 characters long" },
                                                maxLength: { value: 50, message: "First name must be under length of 50 characters" }
                                            })
                                        }
                                    />
                                    {errors.resCity && <p class="text-xs text-red-500 flex items-center mt-2">{errors.resCity.message}</p>}
                                    <input
                                        className={`w-full px-5 py-3 font-medium border-b-2 border-gray-300 outline-none text-sm ${darkMode
                                            ? "bg-[#302E30] text-white focus:border-white"
                                            : "bg-white focus:border-blue-500"
                                            }`}
                                        type="text"
                                        placeholder="Pincode"
                                        {...register("resPincode",
                                            {
                                                required: { value: true, message: "First name must not be empty" },
                                                minLength: { value: 3, message: "First name must be 3 characters long" },
                                                maxLength: { value: 50, message: "First name must be under length of 50 characters" }
                                            })
                                        }
                                    />
                                    {errors.resPincode && <p class="text-xs text-red-500 flex items-center mt-2">{errors.resPincode.message}</p>}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        className={`w-full px-5 py-3 font-medium border-b-2 border-gray-300 outline-none text-sm ${darkMode
                                            ? "bg-[#302E30] text-white focus:border-white"
                                            : "bg-white focus:border-blue-500"
                                            }`}
                                        type="password"
                                        placeholder="Password"
                                        {...register("resPassword",
                                            {
                                                required: { value: true, message: "First name must not be empty" },
                                                minLength: { value: 3, message: "First name must be 3 characters long" },
                                                maxLength: { value: 50, message: "First name must be under length of 50 characters" }
                                            })
                                        }
                                    />
                                    {errors.resPassword && <p class="text-xs text-red-500 flex items-center mt-2">{errors.resPassword.message}</p>}
                                    <input
                                        className={`w-full px-5 py-3 font-medium border-b-2 border-gray-300 outline-none text-sm ${darkMode
                                            ? "bg-[#302E30] text-white focus:border-white"
                                            : "bg-white focus:border-blue-500"
                                            }`}
                                        type="password"
                                        placeholder="Confirm Password"
                                        {...register("resCPassword",
                                            {
                                                required: { value: true, message: "First name must not be empty" },
                                                minLength: { value: 3, message: "First name must be 3 characters long" },
                                                maxLength: { value: 50, message: "First name must be under length of 50 characters" }
                                            })
                                        }
                                    />
                                    {errors.resCPassword && <p class="text-xs text-red-500 flex items-center mt-2">{errors.resCPassword.message}</p>}
                                </div>


                                <div className="relative">
                                    {imagePreview ? (
                                        <>
                                            <img
                                                src={imagePreview}
                                                alt="Dish Preview"
                                                className="w-32 h-32 mt-2 object-cover rounded-md border-2 border-gray-300"
                                                style={{ objectFit: 'contain' }}
                                            />
                                            <button
                                                onClick={() => handleDiscardImage()}
                                                className="absolute top-0 left-28 bg-red-500 text-white rounded-full p-1"
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
                                        <label className="flex items-center text-center justify-center w-32 h-32 mt-2 bg-gray-200 rounded-md cursor-pointer hover:bg-gray-300 p-3">
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                {...register("resImagePreview", {
                                                    required: { value: true, message: "Image is required" },
                                                    onChange: (e) => {
                                                        handleImageChange(e);
                                                    }
                                                })}
                                            />
                                            <span className="text-gray-500 text-sm">Select restaurant Image</span>
                                        </label>
                                    )}
                                    {errors.resImagePreview && <p class="text-xs text-red-500 flex items-center mt-2">{errors.resImagePreview.message}</p>}
                                </div>



                                <div className="relative mb-8">
                                    {!isFormHidden && (
                                        <button
                                            type="button"
                                            onClick={handleNextClick}
                                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-1 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 w-32 absolute right-0"
                                        >
                                            Next
                                            <svg
                                                className="rtl:rotate-180 w-36 h-3 ms-2"
                                                aria-hidden="true"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 14 10"
                                            >
                                                <path
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M1 5h12m0 0L9 1m4 4L9 9"
                                                />
                                            </svg>
                                        </button>
                                    )}
                                </div>

                            </div>
                        )}



                        {/* section 2 */}
                        {/* Menu Details and AddMenu component */}
                        {isMenuDetailsVisible && (
                            <>
                                <div className="my-8 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-neutral-300 after:mt-0.5 after:flex-1 after:border-t after:border-neutral-300">
                                    <p className="mx-4 text-center">Menu Details</p>
                                </div>

                                {/* <AddMenu /> */}

                                <div className="">
                                    {categories.map((category, categoryIndex) => (
                                        <div key={categoryIndex} className="border border-gray-300 rounded-lg p-5 bg-white shadow-md my-2">
                                            <div className="flex items-center justify-between mb-4">
                                                <input
                                                    type="text"
                                                    placeholder="Category Name"
                                                    {...register(`categories.${categoryIndex}.name`, { required: true })}
                                                    className="w-2/3 p-2 border-b-2 border-gray-300 focus:border-blue-500 outline-none text-lg font-semibold"
                                                />
                                                <button
                                                    type='button'
                                                    onClick={() => handleRemoveCategory(categoryIndex)} // Call updated function
                                                    className="text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-2 py-2 text-center me-0 mb-2 ms-4 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900"
                                                >
                                                    Remove Category
                                                </button>
                                            </div>

                                            {category.items.map((item, itemIndex) => (

                                                <div key={itemIndex} className='p-5 bg-white shadow-md my-2'>
                                                    <div className="flex items-start mb-3">
                                                        <div className="flex-1 pr-3">
                                                            <input
                                                                type="text"
                                                                placeholder="Dish Name"
                                                                {...register(`categories.${categoryIndex}.items.${itemIndex}.name`, { required: true })}
                                                                className="w-full p-2 mb-1 border-b-2 border-gray-300 focus:border-blue-500 outline-none text-sm"
                                                            />
                                                            <input
                                                                type='text'
                                                                placeholder="Dish Description"
                                                                {...register(`categories.${categoryIndex}.items.${itemIndex}.description`)}
                                                                className="w-full p-2 mb-1 border-b-2 border-gray-300 focus:border-blue-500 outline-none text-sm"
                                                            />
                                                            <select
                                                                {...register(`categories.${categoryIndex}.items.${itemIndex}.diet`)}
                                                                className="w-full mb-1 border-b-2 border-gray-300 focus:border-blue-500 outline-none p-1 bg-white text-sm mt-4"
                                                            >
                                                                <option value="">Select Diet</option>
                                                                <option value="veg">Veg</option>
                                                                <option value="non-veg">Non-Veg</option>
                                                                <option value="vegan">Vegan</option>
                                                            </select>
                                                        </div>
                                                        <div className="relative">
                                                            {item.imageSrc ? (

                                                                <>
                                                                    <img
                                                                        src={item.imageSrc}
                                                                        alt="Dish Preview"
                                                                        className="w-32 h-32 object-cover rounded-md border-2 border-gray-300"
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

                                                                <label className="flex items-center justify-center w-32 h-32 bg-gray-200 rounded-md cursor-pointer hover:bg-gray-300">
                                                                    <input
                                                                        type="file"
                                                                        id={`item_file_input_${categoryIndex}_${itemIndex}`}
                                                                        onInput={(e) => {
                                                                            handleImageChangeForDish(e, categoryIndex, itemIndex); // Call your custom handler
                                                                        }}

                                                                        className="hidden"
                                                                        accept="image/*"
                                                                        {...register(`categories.${categoryIndex}.items.${itemIndex}.imageFile`, {
                                                                            required: { value: true, message: "Image is required" }
                                                                        })}
                                                                    />
                                                                    <span className="text-gray-500 text-sm">Select dish Image</span>
                                                                </label>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <button
                                                        type='button'
                                                        onClick={() => handleRemoveItem(categoryIndex, itemIndex)}
                                                        className="text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900"
                                                    >
                                                        Remove Item
                                                    </button>
                                                </div>
                                            ))}

                                            <button
                                                type='button'
                                                onClick={() => handleAddItem(categoryIndex)}
                                                className="w-full py-2 mt-2 text-sm text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition"
                                            >
                                                + Add Item
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type='button'
                                        onClick={handleAddCategory}
                                        className="w-full py-3 mt-4 bg-green-500 text-white font-semibold rounded-lg shadow-lg hover:bg-green-600 transition duration-200"
                                    >
                                        + Add Category
                                    </button>

                                </div>




                                {isMenuDetailsVisible && (
                                    <div className="relative mb-8">
                                        <button
                                            type="button"
                                            onClick={handleBackClick}
                                            className="mt-5 text-white bg-gray-500 hover:bg-gray-600 focus:ring-1 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-gray-700 dark:hover:bg-gray-800 dark:focus:ring-gray-800 w-32"
                                        >
                                            Back
                                            <svg
                                                className="rtl:rotate-180 w-3.5 h-3.5 ms-2"
                                                aria-hidden="true"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 14 10"
                                            >
                                                <path
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M13 5H1m0 0L5 9m-4-4L5 1"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                )}

                                <button type="submit" className="mt-5 tracking-wide font-semibold bg-[#E9522C] text-gray-100 w-full py-4 rounded-lg hover:bg-[#E9522C]/90 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none">
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
                                    <span className="ml-3">Register</span>
                                </button>
                            </>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};
export default ResRegistrationForm;
