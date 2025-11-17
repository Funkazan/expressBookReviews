const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js"); 
const regd_users = express.Router();

// WICHTIG: Dieser Schlüssel MUSS mit dem in index.js verwendeten Schlüssel übereinstimmen.
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
        }, jwtSecret, { expiresIn: '1h' }); // Token expires in 1 hour
        
        // WICHTIG: Die Session-Speicherung (req.session.authorization = ...) wurde entfernt, um den Fehler zu beheben.
        
        // 5. Send success response (return the token)
        return res.status(200).json({
            message: "Customer successfully logged in",
            token: token // Der Client muss dieses Token im "Authorization: Bearer <token>" Header senden.
        });
    } else {
        // Invalid login credentials
        return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
});

// Add a book review (Protected route: Requires JWT in Authorization header)
regd_users.put("/auth/review/:isbn", (req, res) => {
    //1. Get ISBN from URL parameters and review text from query parameter
    const isbn = req.params.isbn;
    const review = req.query.review;

    //2. Get the username from the authenticated JWT payload (gespeichert in req.user durch Middleware)
    // req.user ist der entschlüsselte Payload { data: username, iat: ..., exp: ... }
    const username = req.user.data; 
    
    // Einfache Überprüfung, ob der Review-Text gesendet wurde
    if (!review) {
         return res.status(400).json({message: `Review text not provided in query parameter 'review'.`});
    }

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
            message: `Review for ISBN ${isbn} by user ${username} added/modified successfully.`,
            review: book.reviews[username] //Show the new review
        });
    } else {
        return res.status(404).json({message: `Book with ISBN ${isbn} not found.`});
    }
});

// Delete a book review (Protected route: Requires JWT in Authorization header)
regd_users.delete("/auth/review/:isbn", (req, res) => {
    // 1. Get ISBN from URL parameters
    const isbn = req.params.isbn;
    
    // 2. Get the username from the authenticated JWT payload
    const username = req.user.data;

    // Check if the book exists
    if (books[isbn]) {
        let book = books[isbn];
        
        // Check if the user has a review for this book
        if (book.reviews && book.reviews[username]) {
            // Delete the review using the user's username as the key
            delete book.reviews[username]; 
            return res.status(200).json({
                message: `Review for ISBN ${isbn} by user ${username} deleted successfully.`
            });
        } else {
            return res.status(404).json({
                message: `No review found for ISBN ${isbn} by user ${username}.`
            });
        }
    } else {
        return res.status(404).json({message: `Book with ISBN ${isbn} not found.`});
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;