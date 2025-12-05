import React from 'react';
import { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import { useUser } from '../../UserContext';
import { useNavigate } from "react-router-dom";



const OrderNowBcp = () => {
    const navigate = useNavigate();

    const { setUserName, setUserId, setUserType, setItemCount } = useUser();
    const { userId, userName, userType, itemCount } = useUser();

    const [itemImages, setitemImages] = useState([]);
    const [menu, setMenu] = useState([]);

    const [searchQuery, setSearchQuery] = useState("");
    const [filteredItems, setFilteredItems] = useState([]);

    const fetchFoodItems = async () => {
        try {
            const response = await fetch('http://localhost:5000/restaurant/items-data');
            if (!response.ok) {
                console.log(response);

                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            console.log(data.images);

            setMenu(data.menu);
            setitemImages(data.images);
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


    function getItemDetails(imageName, value) {
        for (let category of menu) {
            for (let item of category.item) {
                if (item.itemImage === imageName) {
                    if (value === "name")
                        return `${item.itemName}`;
                    else if (value === "price")
                        return `${item.itemPrice}`;
                    else if (value === "discount")
                        return `${item.discount}`;
                    else if (value === "desc")
                        return `${item.itemDescription}`;
                    else if (value === "newPrice")
                        return `${item.itemPrice - item.discount}`;
                    else if (value === "itemId")
                        return `${item._id}`;
                }
            }
        }

        return 'Item not found';
    }


    const addItemToCart = async (imageName) => {
        console.log("Add to cart called");

        if (!userId) {
            navigate("/customer/login");
        }

        const itemId = getItemDetails(imageName, "itemId")

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
            }

        } catch (error) {
            console.error('Error sending data:', error);
        }
    }


    // For search bar
    const filterMenuItems = (menuData, searchQuery) => {
        if (!Array.isArray(menuData)) {
            console.error("menuData must be an array");
            return [];
        }

        const query = searchQuery.toLowerCase();

        const flattenedItems = menuData.flatMap(category => {
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

        const filteredItems = flattenedItems.filter(item =>
            item.itemName.toLowerCase().includes(query) ||
            item.itemDescription.toLowerCase().includes(query)
        );

        return filteredItems;
    };




    const handleSearch = (e) => {
        const query = e.target.value;
        const menuData = [
            {
                _id: "672f4952811c6411dd7bf5e2",
                categoryName: "European",
                categoryId: 1,
                item: [
                    {
                        itemName: "Pizza",
                        itemId: 101,
                        itemDescription: "Normal pizza",
                        itemPrice: 299,
                        itemImage: "food-1.jpg",
                        discount: 25,
                        _id: "672f4952811c6411dd7bf5e3"
                    },
                    {
                        itemName: "Meat ball",
                        itemId: 102,
                        itemDescription: "Fresh chicken meat ball",
                        itemPrice: 239,
                        itemImage: "food-2.jpg",
                        discount: 30,
                        _id: "672f4952811c6411dd7bf5e4"
                    },
                    {
                        itemName: "Burger",
                        itemId: 103,
                        itemDescription: "Ham burger with two meat paties",
                        itemPrice: 299,
                        itemImage: "food-3.jpg",
                        discount: 50,
                        _id: "672f4952811c6411dd7bf5e5"
                    }
                ],
                __v: 0
            }
        ];

        setSearchQuery(query);
        const results = filterMenuItems(menuData, query);
        // setFilteredItems(results);
        // setMenu(results);

        console.log(results);

    };


    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-300 to-red-400 text-gray-900">
            <div className="container mx-auto py-10">

                {/* Search Bar */}
                <div className="flex justify-center mb-10">
                    <div className="relative w-3/4 lg:w-1/2">
                        <input
                            type="text"
                            placeholder="Search for food, restaurant, or location..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full p-4 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                        <FaSearch className="absolute right-4 top-4 text-gray-500" />
                    </div>
                </div>

                {/* Famous Food Items Section */}
                <div className="mb-16">
                    {/* <h2 className="text-3xl font-bold text-center mb-8">Famous Food Items</h2> */}
                    <div className="flex flex-wrap justify-center gap-8">
                        {itemImages.map((image, index) => (
                            <div className='w-48 h-60 bg-white shadow-lg flex-row items-center justify-center rounded-lg transform hover:scale-105 transition-transform duration-300'>
                                <div
                                    key={index}
                                    className="my-2 mx-auto w-44 h-44 bg-white rounded-lg flex items-center justify-center"
                                    style={{
                                        backgroundImage: `url(${image.imageBase64})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                    }}
                                >
                                    {/* <span className="bg-opacity-80 px-3 py-1 rounded-full">{getItemDetails(image.imageName, "desc")}</span> */}
                                </div>

                                <div
                                    key={index + 1}
                                    className="w-44 h-10 flex items-center justify-center"
                                >
                                    <div className='flex-row items-center justify-center absolute left-2'>
                                        <span className="bg-none block">{getItemDetails(image.imageName, "name")}</span>

                                        <div className='flex items-center justify-center'>
                                            &#8377;
                                            <span className="relative inline-block text-lg font-medium text-gray-700">
                                                <span
                                                    className="relative z-10"
                                                >
                                                    {getItemDetails(image.imageName, "price")}
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
                                                {getItemDetails(image.imageName, "newPrice")}
                                            </span>

                                            <span className="mx-0 mt-1 bg-none block text-xs">
                                                {getItemDetails(image.imageName, "discount")} off
                                            </span>
                                        </div>
                                    </div>

                                    <button type='button' className="bg-none absolute right-2 bottom-2" onClick={() => addItemToCart(image.imageName)}>
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
        </div>
    );
};

export default OrderNowBcp;