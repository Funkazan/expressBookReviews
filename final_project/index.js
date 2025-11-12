const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

const sessionSecret = "fingerprint_customer"; //Define secret once
app.use("/customer", session({
    secre: sessionSecret,
    resave: true, 
    saveUninitialized: true
}));

//Authorization Middleware
app.use("/customer/auth/*", function auth(req,res,next){
    //Check if authorization exists in the session
    if (req.session.authorization) {
        let token = req.session.authorization['accessToken'];
        //Verify the token using the secret key "access" (must match the one used in auth_users.js)
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                //If verified, proceed to the next ha
                //We keep the username in req.session.authorization, so setting req.user here is optional
                req.user = user;
                next();
            } else {
                return res. status(403).json({ message: "User not authenticated (Token invalid)" });
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in (No session/token found)" });
    }
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running on port " + PORT));
