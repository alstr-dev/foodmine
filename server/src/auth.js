require("dotenv").config({path: "../.env"});
const jwt = require("jsonwebtoken");
const schema = require("./schema.js");

// Middleware function for authenticating user
const auth = async (req, res, next) => {
    try {
        const token = req.cookies.jwtAuth;
        const verifyUser = await jwt.verify(token, process.env.SECRET_KEY);
        console.log(verifyUser);
        if (verifyUser) {
            const user = await schema.Student.findOne({ _id: verifyUser._id });
            req.user = user;
        } else {
            res.redirect("/adminlogin");
        }
        next();
    } catch (error) {
        res.redirect("/adminlogin");
    }
}

module.exports = auth;