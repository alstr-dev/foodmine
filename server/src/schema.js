require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });


const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true
    },
    lname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    }
});


const otpSchema = new mongoose.Schema({
    otp: { type: String, required: true },
    identifier: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 600 },
});



const menuSchema = new mongoose.Schema({
    categoryName: {
        type: String
    },
    item: [{
        itemName: {
            type: String
        },
        itemDescription: {
            type: String
        },
        itemDiet: {
            type: String
        },
        itemPrice: {
            type: Number
        },
        discount: {
            type: Number
        },
        itemImage: {
            type: String
        }
    }]
})


const cartSchema = new mongoose.Schema({
    customer: {
        customerId: {
            type: String,
            required: true
        },
        item: [{
            itemId: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }]
    }
})


const orders = new mongoose.Schema({
    customerId: {
        type: String,
        required: true
    },
    allOrders: [{
        rzp_pay_id: {
            type: String,
            required: true
        },
        rzp_order_id: String,
        rzp_sign: String,
        amount: Number,
        email_id: String,
        phone: Number,
        customerName: String,
        couponCode: String,
        deliveryCharge: Number,
        orderStatus: String,
        deliveryCoords: {
            lat: Number,
            lng: Number
        },
        deliveryAddress: String,
        items: [{
            item_id: {
                type: String,
                required: true
            },
            item_name: String,
            ogPrice: Number,
            discount: Number,
            paidAmount: Number,
            item_desc: String,
            imageFileName: String,
            quantity: Number,
            status: String
        }],
        da_id: { type: String, default: null },
        da_name: { type: String, default: null },
        ofd_time: { type: Date, default: null },
        dvy_time: { type: Date, default: null },
        da_code: { type: String, default: null },
        da_phone: { type: Number, default: null },
        createdAt: { type: Date, default: Date.now },
        refund: {
            type: Object
        }
    }]
})


const dpaccount = new mongoose.Schema({
    first_name: String,
    last_name: String,
    dp_email: String,
    dp_phone: Number,
    password: String
})


userSchema.methods.generateAuthToken = function () {
    try {
        const SECRET_KEY = process.env.SECRET_KEY;
        const token = jwt.sign({ _id: this._id }, `${SECRET_KEY}`);
        return token;
    } catch (error) {
        console.log(`Error from token generation function ${error}`);
    }
}


dpaccount.methods.generateDpAuthToken = function () {
    const token = jwt.sign(
        { _id: this._id },
        process.env.SECRET_KEY
    );
    return token;
};


adminSchema.methods.generateAdminAuthToken = function () {
    const token = jwt.sign(
        { _id: this._id, email: this.email },
        process.env.SECRET_KEY
    );
    return token;
};


const User = new mongoose.model("User", userSchema);
const Admin = new mongoose.model("Admin", adminSchema);
const OTP = new mongoose.model("OTP", otpSchema);

const Menu = new mongoose.model("Menu", menuSchema);
const Cart = new mongoose.model("Cart", cartSchema);
const Order = new mongoose.model("Order", orders);

const Dpaccount = new mongoose.model("Dpaccount", dpaccount);

module.exports.User = User;
module.exports.Admin = Admin;
module.exports.OTP = OTP;

module.exports.Menu = Menu;
module.exports.Cart = Cart;
module.exports.Order = Order;

module.exports.Dpaccount = Dpaccount;