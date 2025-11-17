const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// ----------------------------------------------------------------------
// Hilfsfunktionen (Tasks 10, 11, 12, 13: Implementierung mit Promises)
// ----------------------------------------------------------------------

// Task 10: Simuliert asynchronen Abruf aller Bücher
const getBooksAsync = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (books) {
                resolve(books);
            } else {
                reject(new Error("Keine Bücher gefunden."));
            }
        }, 300); 
    });
};

// Task 11: Simuliert asynchronen Abruf nach ISBN
const getBookByISBNAsync = (isbn) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const book = books[isbn];
            if (book) {
                resolve(book);
            } else {
                reject(new Error("Book not found"));
            }
        }, 300);
    });
};

// Task 12: Simuliert asynchrone Suche nach Autor
const getBooksByAuthorAsync = (author) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const matchingBooks = Object.values(books).filter(book => 
                book.author.toLowerCase() === author.toLowerCase()
            );

            if (matchingBooks.length > 0) {
                resolve(matchingBooks);
            } else {
                reject(new Error(`No books found for author ${author}`));
            }
        }, 300);
    });
};

// Task 13: Simuliert asynchrone Suche nach Titel
const getBooksByTitleAsync = (title) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const matchingBooks = Object.values(books).filter(book => 
                book.title.toLowerCase() === title.toLowerCase()
            );

            if (matchingBooks.length > 0) {
                resolve(matchingBooks);
            } else {
                reject(new Error(`No books found with title ${title}`));
            }
        }, 300);
    });
};


// ----------------------------------------------------------------------
// Routen (Implementierung mit async/await)
// ----------------------------------------------------------------------


public_users.post("/customer/register", (req, res) => {
    const { username, password } = req.body;

    // Check if username or password is missing
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if username already exists
    const userExists = users.some(user => user.username === username);
    if (userExists) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Register user
    users.push({ username, password });
    return res.status(200).json({ message: "User registered successfully" });
  });

// Task 10: Get the book list available in the shop (Async/Await)
public_users.get('/', async (req, res) => {
    try {
        const bookList = await getBooksAsync();
        return res.status(200).send(JSON.stringify(bookList, null, 4));
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
});

// Task 11: Get book details based on ISBN (Async/Await)
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        const book = await getBookByISBNAsync(isbn);
        return res.status(200).send(JSON.stringify(book, null, 4));
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
});
 
// Task 12: Get book details based on author (Async/Await)
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;
    try {
        const booksByAuthor = await getBooksByAuthorAsync(author);
        return res.status(200).send(JSON.stringify(booksByAuthor, null, 4));
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
});

// Task 13: Get all books based on title (Async/Await)
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;
    try {
        const booksByTitle = await getBooksByTitleAsync(title);
        return res.status(200).send(JSON.stringify(booksByTitle, null, 4));
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
});

//  Get book review (Keine Änderung erforderlich, da nicht Teil der Async-Aufgaben)
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
 
    if (book) {
      return res.status(200).send(JSON.stringify(book.reviews, null, 4));
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  });

module.exports.general = public_users;