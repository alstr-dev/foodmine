const schema = require('./schema.js');
require("dotenv").config({ path: "../.env" });
const { Schema } = require("mongoose");


const deleteOrder = async (userId, orderId) => {
    try {
        const result = await schema.Order.updateOne(
            { customerId: userId }, // Match the user by customerId
            { $pull: { allOrders: { _id: orderId } } } // Remove the specific order by rzp_order_id
        );

        if (result.modifiedCount > 0) {
            console.log("Order deleted successfully");
        } else {
            console.log("No order found for the given user and order ID");
        }
    } catch (error) {
        console.error("Error deleting the order:", error.message);
    }
};

// deleteOrder("67053f0132a43314288b7c1e", "67363986f69f3b3e253fd36a");

const updateOrderStatus = async (customerId, orderId, newStatus) => {
    try {
        const updatedOrder = await schema.Order.findOneAndUpdate(
            {
                customerId: customerId, // Find by customerId
                "allOrders.rzp_order_id": orderId, // Find the order with the specified orderId
            },
            {
                $set: {
                    "allOrders.$.orderStatus": newStatus, // Update the status of the matched order
                },
            },
            { new: true } // Return the updated document
        );

        if (!updatedOrder) {
            console.log("Order not found or no updates were made.");
        } else {
            console.log("Order updated successfully:", updatedOrder);
        }
    } catch (error) {
        console.error("Error updating order status:", error);
    }
};

// Usage Example
// updateOrderStatus("673b8a1ca87ae77825183bd9", "order_PMsGfvYb4qYGw4", "Pending");


const updateOrderTimestamp = async (customerId, orderId) => {
    try {
        const updatedOrder = await schema.Order.findOneAndUpdate(
            {
                customerId: customerId, // Match the customer
                "allOrders.rzp_order_id": orderId, // Match the order
            },
            {
                $set: {
                    "allOrders.$.createdAt": Date.now(), // Set createdAt to yesterday's date
                },
            },
            { new: true } // Return the updated document
        );

        if (!updatedOrder) {
            console.log("Order not found or no updates were made.");
        } else {
            console.log("Order's createdAt updated to yesterday:", updatedOrder);
        }
    } catch (error) {
        console.error("Error updating createdAt:", error);
    }
};

// Usage Example
// updateOrderTimestamp("673b8a1ca87ae77825183bd9", "order_PMsGfvYb4qYGw4");



const menuData = new schema.Menu({
    categoryName: "European",
    categoryId: 1,
    item: [
        {
            itemName: "Pizza",
            itemId: 101,
            itemDescription: "Normal pizza",
            itemPrice: 299,
            itemImage: "food-1.jpg",
            discount: 25
        },
        {
            itemName: "Meat ball",
            itemId: 102,
            itemDescription: "Fresh chicken meat ball",
            itemPrice: 239,
            itemImage: "food-2.jpg",
            discount: 30
        },
        {
            itemName: "Burger",
            itemId: 103,
            itemDescription: "Ham burger with two meat paties",
            itemPrice: 299,
            itemImage: "food-3.jpg",
            discount: 50
        },
        {
            itemName: "French fries",
            itemId: 104,
            itemDescription: "Crispy potato fries",
            itemPrice: 249,
            itemImage: "food-4.jpg",
            discount: 40
        },
        {
            itemName: "Soup",
            itemId: 105,
            itemDescription: "Boiled chicken soup",
            itemPrice: 199,
            itemImage: "food-5.jpg",
            discount: 30
        },
        {
            itemName: "Pizza",
            itemId: 106,
            itemDescription: "Extra cheese burst",
            itemPrice: 399,
            itemImage: "food-6.jpg",
            discount: 50
        }
    ]
});

// menuData.save();