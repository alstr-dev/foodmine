import React, { useState } from 'react';

function AddMenu() {
    const [categories, setCategories] = useState([
        { name: '', items: [{ name: '', description: '', diet: '', imageSrc: null }], imageSrc: null }, // Default category with one item
    ]);

    const addCategory = () => {
        setCategories([...categories, { name: '', items: [{ name: '', description: '', diet: '', imageSrc: null }], imageSrc: null }]);
    };

    const removeCategory = (index) => {
        const newCategories = categories.filter((_, i) => i !== index);
        setCategories(newCategories);
    };

    const addItem = (index) => {
        const newCategories = [...categories];
        newCategories[index].items.push({ name: '', description: '', diet: '', imageSrc: null });
        setCategories(newCategories);
    };

    const removeItem = (categoryIndex, itemIndex) => {
        const newCategories = [...categories];
        newCategories[categoryIndex].items.splice(itemIndex, 1);
        setCategories(newCategories);
    };

    const handleCategoryChange = (index, value) => {
        const newCategories = [...categories];
        newCategories[index].name = value;
        setCategories(newCategories);
    };

    const handleItemChange = (categoryIndex, itemIndex, value) => {
        const newCategories = [...categories];
        newCategories[categoryIndex].items[itemIndex].name = value;
        setCategories(newCategories);
    };

    const handleDescriptionChange = (categoryIndex, itemIndex, value) => {
        const newCategories = [...categories];
        newCategories[categoryIndex].items[itemIndex].description = value;
        setCategories(newCategories);
    };

    const handleDietChange = (categoryIndex, itemIndex, diet) => {
        const newCategories = [...categories];
        newCategories[categoryIndex].items[itemIndex].diet = diet;
        setCategories(newCategories);
    };

    const handleImageChangeForDish = (event, categoryIndex, itemIndex) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const newCategories = [...categories];
                newCategories[categoryIndex].items[itemIndex].imageSrc = e.target.result;
                setCategories(newCategories);
            };
            reader.readAsDataURL(file);
        } else {
            // Clear the image source if the file selection is canceled
            const newCategories = [...categories];
            newCategories[categoryIndex].items[itemIndex].imageSrc = null;
            setCategories(newCategories);
        }
    };

    const handleDiscardImageForDish = (categoryIndex, itemIndex) => {
        const newCategories = [...categories];
        newCategories[categoryIndex].items[itemIndex].imageSrc = null;
        setCategories(newCategories);
        document.getElementById(`item_file_input_${categoryIndex}_${itemIndex}`).value = '';
    };

    return (
        // p-6 space-y-6 bg-gray-100 rounded-lg max-w-2xl
        <div className="">
            <form action="/restaurant/add-menu">
                {categories.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="border border-gray-300 rounded-lg p-5 bg-white shadow-md my-2">
                        <div className="flex items-center justify-between mb-4">
                            <input
                                type="text"
                                placeholder="Category Name"
                                value={category.name}
                                onChange={(e) => handleCategoryChange(categoryIndex, e.target.value)}
                                className="w-2/3 p-2 border-b-2 border-gray-300 focus:border-blue-500 outline-none text-lg font-semibold"
                            />
                            <button
                                type='button'
                                onClick={() => removeCategory(categoryIndex)}
                                className="button" class="text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-2 py-2 text-center me-0 mb-2 ms-4 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900"
                            >
                                Remove Category
                            </button>
                        </div>

                        {category.items.map((item, itemIndex) => (
                            <div className='p-5 bg-white shadow-md my-2'>
                                <div key={itemIndex} className="flex items-start mb-3">
                                    <div className="flex-1 pr-3">
                                        <input
                                            type="text"
                                            placeholder="Dish Name"
                                            value={item.name}
                                            onChange={(e) => handleItemChange(categoryIndex, itemIndex, e.target.value)}
                                            className="w-full p-2 mb-1 border-b-2 border-gray-300 focus:border-blue-500 outline-none text-sm"
                                        />
                                        <input
                                            type='text'
                                            placeholder="Dish Description"
                                            value={item.description}
                                            onChange={(e) => handleDescriptionChange(categoryIndex, itemIndex, e.target.value)}
                                            className="w-full p-2 mb-1 border-b-2 border-gray-300 focus:border-blue-500 outline-none text-sm"
                                        />
                                        <select
                                            value={item.diet}
                                            onChange={(e) => handleDietChange(categoryIndex, itemIndex, e.target.value)}
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
                                                    onChange={(e) => handleImageChangeForDish(e, categoryIndex, itemIndex)}
                                                    className="hidden"
                                                    accept="image/*"
                                                />
                                                <span className="text-gray-500 text-sm">Select dish Image</span>
                                            </label>
                                        )}


                                    </div>

                                </div>

                                <button
                                    type='button'
                                    onClick={() => removeItem(categoryIndex, itemIndex)}
                                    className="text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900"
                                >
                                    Remove Item
                                </button>
                            </div>
                        ))}




                        <button
                            type='button'
                            onClick={() => addItem(categoryIndex)}
                            className="w-full py-2 mt-2 text-sm text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition"
                        >
                            + Add Item
                        </button>
                    </div>
                ))}

                <button
                    type='button'
                    onClick={addCategory}
                    className="w-full py-3 mt-4 bg-green-500 text-white font-semibold rounded-lg shadow-lg hover:bg-green-600 transition duration-200"
                >
                    + Add Category
                </button>

            </form>
        </div>
    );
}

export default AddMenu;
