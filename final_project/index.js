const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

const sessionSecret = "fingerprint_customer"; //Define secret once

//Authorization Middleware
app.use("/customer/auth/*", function auth(req,res,next){
    // 1. Extract token from header (i.E. "Bearer <token>")
    let token = req.headers.authorization; 
    
    if (token) {
        // Remove präfix ("Bearer")
        token = token.split(' ')[1]; 

        // 2. verify JWT directly
        jwt.verify(token, "access", (err, user) => { 
            if (!err) {
                req.user = user;
                // Optional: Write user in session (for other Middleware)
                //req.session.authorization = {
                //    accessToken: token,
                //    username: user.data // if username is in data field
                //}
                next();
            } else {
                return res.status(403).json({ message: "User not authenticated (Token invalid)" });
            }
        });
    } else {
        // Fallback: if header hasn't been sent or no session
        return res.status(403).json({ message: "User not logged in (No token provided)" });
    }
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running on port " + PORT));
