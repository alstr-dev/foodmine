const express = require("express");
require("dotenv").config({ path: "../.env" });
const cors = require("cors");
const multer = require("multer");
const fs = require('fs');
const mongoose = require('mongoose');

const Razorpay = require('razorpay');
const crypto = require("crypto");

const schema = require('./schema.js');
const auth = require("./auth.js");
const bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { stringify } = require('querystring');
const { log } = require("console");
const { Schema } = require("mongoose");

const nodemailer = require('nodemailer');

const app = express();

const allowedOrigins = ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'dishImage') {
            const uploadPath = path.join(__dirname, "../public/restaurant/items/");

            cb(null, uploadPath);
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});


const upload = multer({ storage }).any();


app.use(express.static('./public'));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));


app.use(express.static(path.join(__dirname, '../public')));


const razorpay = new Razorpay({
    key_id: "rzp_test_dSzrof9qab9FSG",
    key_secret: "x6T88yFTrFXPS7U8ofTB5FN3"
})


const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.GMAIL_ID,
        pass: process.env.GMAIL_PASS
    }
});


/**
 * Function to generate a secure, unique password
 * @param {number} length - Desired length of the password (default: 12)
 * @returns {string} - Generated password
 */


app.get('/restaurant/items-data', async (req, res) => {
    try {
        const menuData = await schema.Menu.find();

        const responseData = {
            menu: menuData,
        };

        res.json(responseData);

    } catch (error) {
        console.error("Error:", error);

        res.send("An error ocured");
    };

});


app.get("/adminlogout", auth, async (req, res) => {
    res.clearCookie("jwtAuth");
    res.redirect("./adminlogin");
});


app.get('/auth/iscustomer', (req, res) => {
    const token = req.cookies.jwtAuth; // Retrieve the token from the httpOnly cookie

    if (!token) {
        return res.status(401).json({ loggedIn: false });
    }

    // Verify token (replace 'yourSecretKey' with your actual secret)
    jwt.verify(token, process.env.SECRET_KEY, async (err, userDecoded) => {
        try {
            const user = await schema.User.findOne({ _id: userDecoded._id });
            // console.log(user);

            if (err) {
                return res.status(401).json({ loggedIn: false });
            }
            res.send(user);
        } catch (err) {
            console.log(err);
        }
    });
});


app.post("/customer/loggedin-status", async (req, res) => {
    const token = req.cookies.jwtAuth;

    if (!token) {
        res.send(false);
    } else {
        res.send(true);
    }
})


app.post("/usersignup", async (req, res) => {
    const { fname, lname, email, phone, password } = req.body;

    try {
        const isEmailExist = await schema.User.findOne({ email });
        const isCustomerPhone = await schema.User.findOne({ phone });

        let msg = "";

        if (isEmailExist && isCustomerPhone)
            msg = "Email id and phone number is already registered"
        else if (isEmailExist)
            msg = "This email id is already registered"
        else if (isCustomerPhone)
            msg = "This phone number is already registered"


        if (!isEmailExist && !isCustomerPhone) {
            console.log("Registering a new user");

            const hashedPassword = await bcrypt.hash(password, 12);

            const user = new schema.User({
                fname,
                lname,
                email,
                phone,
                password: hashedPassword,
            });

            await user.save();

            const token = await user.generateAuthToken();

            res.cookie("authToken", token, {
                httpOnly: true,
                maxAge: 60 * 60 * 1000
            });

            return res.status(201).send({
                value: 1,
                message: "User registered successfully",
            });
        } else {
            return res.status(200).send({
                value: 2,
                message: msg,
            });
        }
    } catch (error) {
        console.error("Error during user registration:");

        return res.status(200).send({
            value: 3,
            message: "An error occurred while registering the user",
        });
    }
});


app.post("/customerlogin", (req, res) => {
    const { email, password } = req.body;

    schema.User.findOne({ email: email }, async (err, user) => {
        try {
            if (user) {
                const passMatch = await bcrypt.compare(password, user.password);
                if (passMatch) {
                    const token = await user.generateAuthToken();

                    res.cookie("jwtAuth", token, {
                        httpOnly: true,
                        maxAge: 60 * 60 * 1000
                    });

                    res.send({
                        value: 1,
                        name: user.fname + ' ' + user.lname,
                        id: user._id
                    });
                } else {
                    res.send({
                        value: 2
                    });
                }
            } else {
                res.send({
                    value: 2
                });
            }
        } catch (error) {
            res.send({
                value: 3
            });
            console.log(error);
        }
    });
});


app.post('/customerlogout', (req, res) => {
    res.clearCookie('jwtAuth', {
        httpOnly: true
    });
    res.status(200).json({ message: 'Logout successful' });
});


app.post("/admin/dashboard/add-item", upload, async (req, res) => {
    try {
        const jsonData = JSON.parse(req.body.data);

        for (const category of jsonData.categories) {
            for (const item of category.items) {
                const isValidObjectId = mongoose.Types.ObjectId.isValid(category.name);

                if (isValidObjectId) {
                    const newItem = {
                        itemName: item.name,
                        itemDescription: item.description,
                        itemDiet: item.diet,
                        itemPrice: item.price,
                        discount: item.discount,
                        itemImage: req.files[0].filename,
                    };

                    await saveNewItem(category.name, newItem);
                } else {
                    const newCategoryWithItem = new schema.Menu({
                        categoryName: category.name,
                        item: [
                            {
                                itemName: item.name,
                                itemDescription: item.description,
                                itemDiet: item.diet,
                                itemPrice: item.price,
                                discount: item.discount,
                                itemImage: req.files[0].filename,
                            },
                        ],
                    });

                    await saveNewCategoryWithItem(newCategoryWithItem);
                }
            }
        }

        async function saveNewCategoryWithItem(newCategoryWithItem) {
            try {
                const result = await newCategoryWithItem.save();
                console.log("New category created:", result);

                res.json({ value: 1, message: `New item added to the new category: ${result.categoryName}` });
            } catch (error) {
                console.log("Error saving new category:", error);

                res.json({ value: 2, message: `Failed to add new item to the new category. Please try after sometime` });
            }
        }

        async function saveNewItem(categoryId, newItem) {
            try {
                console.log("Saving new item to category:", categoryId);

                const updatedMenu = await schema.Menu.findByIdAndUpdate(
                    categoryId,
                    { $push: { item: newItem } },
                    { new: true, runValidators: true }
                );

                console.log("Menu updated:", updatedMenu);

                if (updatedMenu) {
                    res.json({ value: 1, message: `New item added successfully` });
                }

            } catch (error) {
                console.log("Error saving new item:", error);

                res.json({ value: 2, message: `Failed to add new item. Please try after sometime` });
            }
        }
    } catch (error) {
        console.log("Error processing request:", error);
        res.json({ value: 2, message: `Failed to add new item. Please try after sometime` });
    }
});


app.post('/customer/add-cart', async (req, res) => {
    if (req.body.customer_id) {
        try {
            const customerExist = await schema.Cart.findOne({ 'customer.customerId': req.body.customer_id });

            if (!customerExist) {
                // Create a new cart for the customer if it doesn't exist
                const item = new schema.Cart({
                    customer: {
                        customerId: req.body.customer_id,
                        item: [{
                            itemId: req.body.item_id,
                            quantity: 1
                        }]
                    }
                });

                await item.save();
                res.status(201).json({ message: "Cart created and item added" });
            } else {
                // Check if the item already exists in the cart
                const existingItem = customerExist.customer.item.find(cartItem => cartItem.itemId === req.body.item_id);

                if (existingItem) {
                    // If item exists, update its quantity
                    // await schema.Cart.updateOne(
                    //     { 'customer.customerId': req.body.customer_id, 'customer.item.itemId': req.body.item_id },
                    //     { $inc: { 'customer.item.$.quantity': 1 } }
                    // );
                    res.status(200).json({ message: "exist" });
                } else {
                    // If item doesn't exist, add it to the cart
                    const newItem = {
                        itemId: req.body.item_id,
                        quantity: 1
                    };

                    await schema.Cart.updateOne(
                        { 'customer.customerId': req.body.customer_id },
                        { $push: { 'customer.item': newItem } }
                    );
                    res.status(200).json({ message: "New item added to cart" });
                }
            }
        } catch (error) {
            console.error("Error updating cart:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    } else {
        res.status(400).json({ error: "Customer ID is required" });
    }
});


app.get('/customer/cart-items', async (req, res) => {
    const token = req.cookies.jwtAuth;

    if (!token) {
        return res.status(401).json({ loggedIn: false });
    }

    jwt.verify(token, process.env.SECRET_KEY, async (err, userDecoded) => {
        try {
            const user = await schema.User.findOne({ _id: userDecoded._id });

            if (err) {
                return res.status(401).json({ loggedIn: false });
            }

            sendCartData(user);
        } catch (err) {
            console.log(err);
        }
    });


    async function sendCartData(user) {
        const userCart = await schema.Cart.findOne({ 'customer.customerId': user._id });
        let itemIds = '';
        let menuItems = '';

        if (userCart) {
            itemIds = userCart.customer.item.map(item => item.itemId);
            menuItems = await schema.Menu.find({ 'item._id': { $in: itemIds } });
        }


        const imagesDir = path.join(__dirname, '../public/restaurant/items');
        const imageFiles = fs.readdirSync(imagesDir);

        let cartMenu = [];
        let image = '';
        let qntty = 0;


        for (let j = 0; j < menuItems.length; j++) {
            let category = {
                name: menuItems[j].categoryName,
                category_id: menuItems[j].categoryId,
                id: menuItems[j]._id.toString(),
                item: []
            };

            menuItems[j].item.forEach((item) => {
                if (itemIds.includes(item._id.toString())) {

                    imageFiles.map(file => {
                        if (file === item.itemImage) {
                            const imagePath = path.join(imagesDir, file);
                            const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' });

                            image = `data:image/jpeg;base64,${imageBase64}`;
                        }
                    }).filter(Boolean);

                    userCart.customer.item.forEach((itm) => {
                        if (itm.itemId === item._id.toString()) {
                            qntty = itm.quantity;
                        }
                    })

                    const matchedItem = {
                        itemName: item.itemName,
                        itemId: item.itemId,
                        itemDescription: item.itemDescription,
                        itemPrice: item.itemPrice,
                        itemImage: item.itemImage,
                        discount: item.discount,
                        id: item._id.toString(),
                        imageSrc: image,
                        quantity: qntty
                    };

                    category.item.push(matchedItem);
                }
            });

            cartMenu.push(category);
        }


        const responseData = {
            menu: cartMenu
        };

        res.json(responseData);
    }

});


app.post('/customer/api/delete/cart-items', async (req, res) => {
    const token = req.cookies.jwtAuth;

    if (!token) {
        return res.status(401).json({ loggedIn: false });
    }

    jwt.verify(token, process.env.SECRET_KEY, async (err, userDecoded) => {
        try {
            const user = await schema.User.findOne({ _id: userDecoded._id });

            if (err) {
                return res.status(401).json({ loggedIn: false });
            }

            console.log(req.body);


            const result = await schema.Cart.updateOne(
                { 'customer.customerId': user._id.toString() },
                { $pull: { 'customer.item': { itemId: req.body.itemId } } }
            );

            if (result) {
                res.send({
                    msg: "Deleted"
                });
            }

        } catch (err) {
            console.log(err);
        }
    });
});


app.post('/customer/orders', async (req, res) => {
    // const razorpay = new Razorpay({
    //     key_id: "rzp_test_dSzrof9qab9FSG",
    //     key_secret: "x6T88yFTrFXPS7U8ofTB5FN3"
    // })

    const amount = req.body.price;

    console.log(amount);

    const options = {
        amount: amount * 100,  // Razorpay expects amount in paise
        currency: "INR",
        receipt: "order_rcptid_11",
        payment_capture: 1
    };

    try {
        const order = await razorpay.orders.create(options);

        res.json({
            orderId: order.id,
            amount: order.amount
        });
    } catch (error) {
        res.status(500).json({ error: "Error creating Razorpay order" });
    }
})


app.post("/customer/payment/receipt", async (req, res) => {
    // const razorpay = new Razorpay({
    //     key_id: "rzp_test_dSzrof9qab9FSG",
    //     key_secret: "x6T88yFTrFXPS7U8ofTB5FN3"
    // })

    try {
        const receipt = await razorpay.payments.fetch(req.body.razorpay_payment_id);

        const itemsArray = [];

        req.body.items.forEach((item) => {
            const pdAmt = Math.round((item.itemPrice - ((item.itemPrice * item.discount) / 100)) * item.quantity);
            const dscnt = Math.round(((item.itemPrice * item.discount) / 100) * item.quantity);

            itemsArray.push({
                item_id: item.id,
                item_name: item.itemName,
                ogPrice: item.itemPrice,
                discount: dscnt,
                paidAmount: pdAmt,
                item_desc: item.itemDescription,
                imageFileName: item.itemImage,
                quantity: item.quantity
            });
        });


        const isCustomerExist = await schema.Order.findOne({ 'customerId': req.body.u_id })


        if (!isCustomerExist) {
            const newOrder = new schema.Order({
                customerId: req.body.u_id,
                allOrders: [{
                    rzp_pay_id: req.body.razorpay_payment_id,
                    rzp_order_id: req.body.razorpay_order_id,
                    rzp_sign: req.body.razorpay_signature,
                    amount: req.body.price,
                    email_id: receipt.email,
                    phone: receipt.contact,
                    customerName: req.body.u_name,
                    couponCode: req.body.coupon,
                    orderStatus: "Pending",
                    deliveryCoords: req.body.deliveryLocation,
                    deliveryAddress: req.body.deliveryAddress,
                    items: itemsArray
                }]
            })

            const result = await newOrder.save();

            if (result) {
                res.status(201).json({ msg: "Data saved successfully" });
            } else {
                res.status(200).json({ msg: "Data couldn't be saved" });
            }
        } else {
            const updateResult = await schema.Order.updateOne(
                { customerId: req.body.u_id },
                {
                    $push: {
                        allOrders: {
                            rzp_pay_id: req.body.razorpay_payment_id,
                            rzp_order_id: req.body.razorpay_order_id,
                            rzp_sign: req.body.razorpay_signature,
                            amount: req.body.price,
                            email_id: receipt.email,
                            phone: receipt.contact,
                            customerName: req.body.u_name,
                            couponCode: req.body.coupon,
                            orderStatus: "Pending",
                            deliveryCoords: req.body.deliveryLocation,
                            deliveryAddress: req.body.deliveryAddress,
                            items: itemsArray
                        }
                    }
                }
            );

            if (updateResult) {
                res.status(201).json({ msg: "Data svaed successfully" });
            } else {
                res.status(200).json({ msg: "Data couldn't be saved" });
            }
        }
    } catch (error) {
        res.status(500).json({ msg: "Internal server error" });
    }
})


app.get("/customer/order-history/:user_id", async (req, res) => {
    const user_id = req.params.user_id;

    try {
        const orders = await schema.Order.findOne({ 'customerId': user_id });

        if (orders && orders.allOrders) {
            orders.allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        res.json(orders);
    } catch (error) {
        res.status(500).json({ msg: "Internal server error" });
    }
})


app.post("/customer/orders/cancel", async (req, res) => {

    const rzp_pay_id = req.body.rzp_pay_id;
    const customerId = req.body.customer_id;
    const paid_amount = req.body.price * 100;

    try {
        const refund = await razorpay.payments.refund(rzp_pay_id, {
            amount: paid_amount,
        });

        console.log('Partial Refund Successful:', refund);


        if (refund) {
            const result = await schema.Order.updateOne(
                {
                    customerId: customerId,
                    "allOrders.rzp_pay_id": rzp_pay_id
                },
                {
                    $set: {
                        "allOrders.$[order].orderStatus": "Canceled",
                        "allOrders.$[order].refund": refund
                    }
                },
                {
                    arrayFilters: [
                        { "order.rzp_pay_id": rzp_pay_id }
                    ]
                }
            );

            res.send(true);
        } else {
            res.send(false);
        }

    } catch (error) {
        console.log("Error updating item:", error);

        res.send(false);
    }

})


app.get("/admin/dashboard/orders", async (req, res) => {
    try {
        const orders = await schema.Order.find();

        res.status(200).send(orders);
    } catch (error) {
        console.log(error);

        res.status(400).semd({ message: "Orders not found" });
    }
})


app.post("/admin/dashboard/orders/approve", async (req, res) => {
    try {

        const updatedOrder = await schema.Order.findOneAndUpdate(
            {
                customerId: req.body.customer_id,
                "allOrders._id": req.body.order_id,
            },
            {
                $set: {
                    "allOrders.$.orderStatus": req.body.status,
                },
            },
            { new: true }
        );

        if (!updatedOrder) {
            res.status(200).send({ message: "unsuccessful" });
        } else {
            res.status(200).send({ message: "success" });
        }

    } catch (error) {
        res.status(400).send({ message: "Internal server error" });
    }
})


app.post("/admin/dashboard/register/deliveryboy", async (req, res) => {
    try {

        const generateSecurePassword = (length = 12) => {
            const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$&*-_';

            let password = '';
            const charactersLength = characters.length;

            for (let i = 0; i < length; i++) {
                const randomIndex = crypto.randomInt(0, charactersLength);
                password += characters[randomIndex];
            }

            return password;
        };

        const securePassword = generateSecurePassword(8);

        const result = await schema.Dpaccount.findOne({ dp_email: req.body.email });
        const isPhone = await schema.Dpaccount.findOne({ dp_phone: req.body.phone });

        if (result === null && isPhone === null) {
            const hassPassword = await bcrypt.hash(securePassword, 12);

            const dpAcc = new schema.Dpaccount({
                first_name: req.body.fname,
                last_name: req.body.lname,
                dp_email: req.body.email,
                dp_phone: req.body.phone,
                password: hassPassword
            })

            const isDpSaved = await dpAcc.save();

            if (isDpSaved) {
                const to = req.body.email;
                const subject = "Your password for delivery account"
                const text = `Your password is: ${securePassword}\nUser id: ${req.body.phone}\n\nUse these credentials to login to your delivery account.\n\n\nThis is a system generated email, no need to reply.`;

                const mailOptions = {
                    from: '"Online Food Delivery App" <aliasteruzir12@gmail.com>',
                    to,
                    subject,
                    text,
                };

                const info = await transporter.sendMail(mailOptions);
                // console.log('Email sent: %s', info);

                res.json({ value: 1 });
            } else {
                res.json({ value: 3 });
            }
        } else {
            res.json({ value: 2 });
        }
    } catch (error) {
        console.log('Server error');

        res.json({ value: 3 });
    }
})


app.post("/delivery/login/request-otp", async (req, res) => {
    const { email } = req.body;

    try {
        const user = await schema.Dpaccount.findOne({ dp_email: email });
        if (!user) {
            return res.status(404).send({
                value: 2,
                message: "Invalid email or password",
            });
        }

        const newOtp = Math.floor(1000 + Math.random() * 9000);

        const to = email;
        const subject = "OTP for login to delivery account"
        const text = `Your OTP is: ${newOtp}\nOTP will expire in 10 minutes`;

        const mailOptions = {
            from: '"Online Food Delivery App" <aliasteruzir12@gmail.com>',
            to,
            subject,
            text,
        };

        const info = await transporter.sendMail(mailOptions);

        const token = await user.generateDpAuthToken();

        res.cookie("dpLoginToken", token, {
            httpOnly: true,
            maxAge: 10 * (1000 * 60), // 10 minute
        })

        res.json({ value: true, otp: newOtp });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).send({
            value: 3, // Internal server error
            message: "Something went wrong. Please try again later.",
        });
    }
});


app.post("/delivery/login/submit-otp", async (req, res) => {
    const dpLoginToken = req.cookies.dpLoginToken;

    try {
        if (dpLoginToken) {
            res.clearCookie("dpLoginToken");

            const dpAcc = jwt.verify(dpLoginToken, process.env.SECRET_KEY);

            const user = await schema.Dpaccount.findOne({ _id: dpAcc._id });

            const token = await user.generateDpAuthToken();

            res.cookie("dpAuthToken", token, {
                httpOnly: true,
                maxAge: 30 * 60 * 1000, // 1 hour
            });

            return res.status(200).send({
                value: 1,
                name: `${user.first_name} ${user.last_name}`,
                tkn: token,
                id: user._id
            });
        } else {
            return res.status(404).send({
                value: 2,
                message: "OTP expired",
            });
        }
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).send({
            value: 3,
            message: "Something went wrong. Please try again later.",
        });
    }
})


app.post("/delivery-partner/logout", async (req, res) => {
    const token = req.cookies.dpAuthToken;

    try {
        if (token) {
            res.clearCookie('dpAuthToken', {
                httpOnly: true
            });

            res.status(200).send(true);
        } else {
            res.status(200).send(true);
        }
    } catch (error) {
        res.send(false);
    }
})


app.get("/admin/dashboard/delivery-agents", async (req, res) => {
    try {
        const dAgents = await schema.Dpaccount.find();

        if (dAgents)
            res.send(dAgents);
        else
            res.send([])

    } catch (error) {
        console.log(error);

        res.send([]);
    }
})


app.post("/admin/dashboard/orders/pickup", async (req, res) => {

    try {
        const updatedOrder = await schema.Order.findOneAndUpdate(
            {
                customerId: req.body.customer_id,
                "allOrders._id": req.body.orderId,
            },
            {
                $set: {
                    "allOrders.$.orderStatus": "Out for delivery",
                    "allOrders.$.da_id": req.body.agent_id,
                    "allOrders.$.da_name": req.body.agent_name,
                    "allOrders.$.ofd_time": Date.now(),
                    "allOrders.$.da_phone": req.body.agent_phone,
                },
            },
            { new: true }
        );

        if (!updatedOrder) {
            console.log("Order not found or no updates were made.");
        } else {
            res.send({
                value: 1 // Picup successful
            })
        }
    } catch (error) {
        res.send({
            value: 2 // Pickup unsuccessful
        })
    }
})


app.post("/delivery/initiate", async (req, res) => {

    const token = req.body.dp_auth_token;

    if (!token) {
        return res.status(401).send(false);
    }

    try {
        const result = jwt.verify(token, process.env.SECRET_KEY);
        if (result) {
            const dAgent = await schema.Dpaccount.findOne({ _id: result._id });

            const order = await schema.Order.findOne(
                {
                    customerId: req.body.customer_id,
                    "allOrders._id": req.body.order_id,
                },
                {
                    allOrders: { $elemMatch: { _id: req.body.order_id } }
                }
            );

            if (order) {

                const dlvryCode = Math.floor(1000 + Math.random() * 9000);
                const now = new Date();
                const expTime = now.getTime() + 10 * 60 * 1000;

                const orderCreds = {
                    code: dlvryCode,
                    custId: req.body.customer_id,
                    oId: order.allOrders[0]._id,
                    daId: dAgent._id.toString(),
                    expiry: expTime
                }

                const to = order.allOrders[0].email_id;
                const subject = "OTP for delivery"
                const text = `Your OTP is: ${dlvryCode}\nFor order id: ${order.allOrders[0].rzp_order_id}\nContaining items of Rupees ${order.allOrders[0].amount}\n\nShare this OTP with the delivery agent`;

                const mailOptions = {
                    from: '"Online Food Delivery App" <aliasteruzir12@gmail.com>',
                    to,
                    subject,
                    text,
                };

                const info = await transporter.sendMail(mailOptions);

                res.send(orderCreds);

            } else {
                res.send(false);
            }

        } else {
            res.status(401).send(false);
        }

    } catch (err) {
        console.log(err);
        res.status(401).send(false);
    }
})


app.get("/admin/dashboard/menu-categories", async (req, res) => {
    try {
        const menu = await schema.Menu.find();

        const menuCategories = [];

        menu.forEach((ctgory) => {
            menuCategories.push({ name: ctgory.categoryName, _id: ctgory._id });
        })

        res.send(menuCategories);
    } catch (error) {
        res.send([]);
    }
})


app.get("/admin/dashboard/menu", async (req, res) => {
    try {
        const menuData = await schema.Menu.find();

        res.send(menuData);
    } catch (error) {

    }
})


app.post("/admin/dashboard/update-item", upload, async (req, res) => {

    try {
        const { category_id, item_id, ...fieldsToUpdate } = req.body;
        const uploadedImageName = req.files[0] ? req.files[0].filename : null;


        const validFields = Object.entries(fieldsToUpdate).reduce((acc, [key, value]) => {
            if (
                value !== null &&
                value !== undefined &&
                !(typeof value === "string" && value.trim() === "") &&
                !(typeof value === "number" && isNaN(value))
            ) {
                acc[`item.$.${key}`] = value;
            }
            return acc;
        }, {});


        if (uploadedImageName) {
            validFields["item.$.itemImage"] = uploadedImageName;
        }


        if (Object.keys(validFields).length === 0) {
            console.log("No valid fields to update");
        }


        const result = await schema.Menu.updateOne(
            {
                _id: category_id,
                "item._id": item_id
            },
            {
                $set: validFields
            }
        );

        if (result.nModified === 0) {
            console.log("No items updated. Check if IDs are correct.");
        }

        if (result) {
            res.send(true);
        } else {
            res.send(false);
        }
    } catch (error) {
        console.log("Error updating item:", error.message);
    }

})


app.post("/admin/dashboard/delete-item", async (req, res) => {
    try {
        const result = await schema.Menu.updateOne(
            { _id: req.body.ctgyId },
            { $pull: { item: { _id: req.body.itemId } } }
        );

        if (result.modifiedCount > 0) {
            res.send(true);
        } else {
            console.log("Item not found or already deleted.");

            res.send(false);
        }

    } catch (error) {
        console.log("Error deleting item:", error);
        res.send(false);
    }
})

const registerAdmin = async (aName, aEmail, aPhone) => {
    console.log(aName, aEmail, aPhone);

    try {
        const admin = new schema.Admin({
            name: aName,
            email: aEmail,
            phone: aPhone
        })

        const isAdminSaved = await admin.save();

        if (isAdminSaved) {
            console.log(isAdminSaved);
        } else {
            console.log("Failed to save admin");
        }
    } catch (error) {
        console.log(error);
    }
}

// registerAdmin("Aliaster Uzir", "aliasteruzir12@gmail.com", 6001647204);

app.post("/admin/dashboard/login/step-1", async (req, res) => {
    const { email } = req.body;

    try {
        const admin = await schema.Admin.findOne({ email: email });
        if (!admin) {
            return res.status(200).send({
                value: 2,
                message: "Invalid email or password",
            });
        }

        const token = await admin.generateAdminAuthToken();

        await schema.OTP.deleteMany();

        const newOtp = Math.floor(1000 + Math.random() * 9000);

        const adminOtp = new schema.OTP({
            otp: newOtp,
            identifier: token
        })

        const isOtpSaved = await adminOtp.save();

        if (isOtpSaved) {
            const to = admin.email;
            const subject = "OTP for login to admin dashboard"
            const text = `Your OTP is: ${newOtp}\nOTP will expire in 10 minutes`;

            const mailOptions = {
                from: '"Online Food Delivery App" <aliasteruzir12@gmail.com>',
                to,
                subject,
                text,
            };

            const info = await transporter.sendMail(mailOptions);

            res.cookie("adminLoginToken", token, {
                httpOnly: true,
                maxAge: 60 * 60 * 1000,
            });

            return res.status(200).send({
                value: 1,
                message: "OTP sent"
            });
        } else {
            return res.status(200).send({
                value: 3,
                message: "Something went wrong. Please try again later."
            });
        }
    } catch (error) {
        console.log("Error during login:", error);
        return res.status(500).send({
            value: 3,
            message: "Something went wrong. Please try again later.",
        });
    }
})


app.post("/admin/dashboard/login/step-2", async (req, res) => {
    const token = req.cookies.adminLoginToken;

    try {
        if (!token) {
            res.send(false);
        }

        const receivedTknData = jwt.verify(token, process.env.SECRET_KEY);

        const otpData = await schema.OTP.find();

        if (Array.isArray(otpData)) {

            const data = otpData[0];
            const storedToken = data.identifier;

            const storedTknData = jwt.verify(storedToken, process.env.SECRET_KEY);

            if (receivedTknData._id === storedTknData._id) {

                if (data.otp === req.body.otp) {
                    res.clearCookie('adminLoginToken', {
                        httpOnly: true
                    });

                    res.cookie("adminAuthToken", token, {
                        httpOnly: true,
                        maxAge: 30 * 60 * 1000,
                    });

                    res.status(200).send({
                        value: 1,
                        message: "Successfully logged in"
                    });

                } else {
                    res.status(200).send({
                        value: 2,
                        message: "Incorrect OTP"
                    });
                }
            } else {
                res.status(200).send({
                    value: 2,
                    message: "Incorrect OTP"
                });
            }

        }
    } catch (error) {
        console.log(error);

        return res.status(200).send({
            value: 3,
            message: "Server error"
        });
    }
})


app.post("/admin/dashboard/loggedin-status", async (req, res) => {
    const token = req.cookies.adminAuthToken;
    try {
        if (!token) {
            res.send(false);
        } else {
            res.send(true);
        }
    } catch (error) {
        res.send(false);
    }
})


app.post("/admin/dashboard/logout", async (req, res) => {
    const token = req.cookies.adminAuthToken;
    try {
        if (token) {
            res.clearCookie('adminAuthToken', {
                httpOnly: true
            });

            res.status(200).send(true);
        } else {
            res.status(200).send(true);
        }
    } catch (error) {
        res.send(false);
    }
})


app.post("/admin/dashboard/delivery-partners/delete", async (req, res) => {
    try {
        const result = await schema.Dpaccount.findOneAndDelete({ _id: req.body.dpId });

        if (result) {
            res.json({ value: 1, name: `${result.first_name} ${result.last_name}` });
        } else {
            res.json({ value: 2, message: "Delivery partner not found" });
        }
    } catch (error) {
        console.log(error);

        res.json({ value: 2, message: "Internal server error" });
    }
})


const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Listening on port http://localhost:${port}`);
});