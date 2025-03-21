const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    // Verificar que se hayan enviado ambos campos
    if (!username || !password) {
        return res.status(400).json({ message: "Nombre de usuario y contraseña son requeridos." });
    }

    // Verificar si el nombre de usuario ya está en uso
    const userExists = users.some(user => user.username === username);

    if (userExists) {
        return res.status(409).json({ message: "El nombre de usuario ya está registrado." });
    }

    // Registrar nuevo usuario
    users.push({ username, password });

    return res.status(200).json({ message: "Usuario registrado exitosamente." });
});

// Obtener la lista de libros disponibles en la tienda
public_users.get('/', function (req, res) {
    res.send(JSON.stringify(books, null, 4)); // Salida ordenada
});

// Obtener los detalles del libro según el ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn; // Extraer el ISBN de los parámetros de la URL

    const book = books[isbn]; // Buscar el libro en el objeto books

    if (book) {
        res.send(JSON.stringify(book, null, 4)); // Mostrar detalles del libro con formato
    } else {
        res.status(404).json({ message: "Libro no encontrado para el ISBN proporcionado." });
    }
});

// Obtener detalles de libros según el autor
public_users.get('/author/:author', function (req, res) {
    const authorName = req.params.author.toLowerCase(); // Tomamos el nombre del autor desde la URL

    let matchingBooks = [];

    // Obtenemos todas las claves del objeto 'books' y las recorremos
    for (let key in books) {
        if (books[key].author.toLowerCase() === authorName) {
            matchingBooks.push(books[key]);
        }
    }

    if (matchingBooks.length > 0) {
        res.send(JSON.stringify(matchingBooks, null, 4));
    } else {
        res.status(404).json({ message: "No se encontraron libros para ese autor." });
    }
});

// Obtener todos los libros según el título
public_users.get('/title/:title', function (req, res) {
    const titleParam = req.params.title.toLowerCase();
    let matchingBooks = [];

    for (let key in books) {
        if (books[key].title.toLowerCase().includes(titleParam)) {
            matchingBooks.push(books[key]);
        }
    }

    if (matchingBooks.length > 0) {
        res.send(JSON.stringify(matchingBooks, null, 4));
    } else {
        res.status(404).json({ message: "No se encontraron libros con ese título." });
    }
});

// Obtener las reseñas del libro según el ISBN
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        res.send(JSON.stringify(book.reviews, null, 4));
    } else {
        res.status(404).json({ message: "No se encontró ningún libro con ese ISBN." });
    }
});

module.exports.general = public_users;