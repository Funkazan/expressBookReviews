const express = require('express');
const jwt = require('jsonwebtoken');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Authorization Middleware: Schützt alle Routen unter /customer/auth/*
app.use("/customer/auth/*", function auth(req,res,next){
    // 1. Token aus dem Header extrahieren (z.B. "Bearer <token>")
    let token = req.headers.authorization; 
    
    // Prüfen, ob der Header vorhanden ist und mit "Bearer " beginnt
    if (token && token.startsWith('Bearer ')) { 
        // Präfix entfernen ("Bearer")
        token = token.split(' ')[1]; 

        // 2. JWT direkt verifizieren mit dem geheimen Schlüssel "access"
        jwt.verify(token, "access", (err, user) => { 
            if (!err) {
                // Den entschlüsselten Payload (inkl. username in user.data) in req.user speichern
                req.user = user;
                next();
            } else {
                return res.status(403).json({ message: "User not authenticated (Token invalid)" });
            }
        });
    } else {
        // Wenn kein Token gesendet wurde
        return res.status(403).json({ message: "User not logged in (No token provided)" });
    }
});
 
const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running on port " + PORT));