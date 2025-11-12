const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

// Secret key for JWT (can be any string)
const secretKey = "fingerprint_customer";
const jwtSecret = "access";

// This array must contain users added through the registration process.
let users = []; 

// Helper function: Checks if the user exists and the password matches.
const authenticatedUser = (username, password) => { 
    // Filter the users array to find a user with a matching name AND password
    let validusers = users.filter((user) => (user.username === username && user.password === password));
    
    // If a user is found, the array is not empty (length > 0)
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

// Helper function: (Optional) Checks if the username is valid (can be simple existence check)
const isValid = (username)=>{ 
    // Check if the user already exists in the array
    let userswithsamename = users.filter((user) => user.username === username);
    if (userswithsamename.length > 0) {
        return true; // User exists
    } else {
        return false; // User does not exist
    }
}


// only registered users can login
regd_users.post("/login", (req,res) => {
    // 1. Get user data from the request body
    const username = req.body.username;
    const password = req.body.password;

    // Check if username and password were provided
    if (!username || !password) {
        return res.status(404).json({message: "Error logging in: Username or Password not provided"});
    }

    // 2. Authenticate the user
    if (authenticatedUser(username, password)) {
        // 3. Generate JWT
        let token = jwt.sign({
            data: username // Store the username in the token payload
        }, secretKey, { expiresIn: '1h' }); // Token expires in 1 hour

        // 4. Store token in session (if session/cookies are used, otherwise optional)
         req.session.authorization = {
             accessToken: token,
             username: username
         }
        
        // 5. Send success response (return the token)
        return res.status(200).json({
            message: "Customer successfully logged in",
            token: token
        });
    } else {
        // Invalid login credentials
        return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    //1. Get ISBN from URL parameters and review text from query parameter
    const isbn = req.params.isbn;
    const review = req.params.review;

    //2. Get the username from the session (set during successful login)
    //The username is guaranteed to existbecause this is an /auth/* route protected by middleware
    const username = req.session.authorization.username;

    //Check if the book exists
    if (books[isbn]) {
        let book = books[isbn];
        //Initialize the reviews object if it doesn't exist
        if (!book.reviews) {
            book.reviews = {};
        }
        //Add or modify the review: The username is used as the key
        book.reviews[username] = review;

        return res.status(200).json({
            message: 'Review for ISBN ${isbn} by user ${username} added/modyfied successfully.',
            review: book.reviews[username] //Show the new review
        });
    } else {
        return res.status(404).json({message: 'Book with ISBN ${isbn} not found.'});
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;