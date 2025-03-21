const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
}

regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Falta el nombre de usuario o la contraseña." });
    }

    if (authenticatedUser(username, password)) {
        const accessToken = jwt.sign({ username }, 'clave_secreta', { expiresIn: '1h' });

        req.session.authorization = { accessToken, username };

        return res.status(200).json({ message: "Inicio de sesión exitoso.", token: accessToken });
    } else {
        return res.status(401).json({ message: "Credenciales inválidas." });
    }
});

regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization?.username;

    if (!username) {
        return res.status(403).json({ message: "No estás autenticado." });
    }

    if (!review) {
        return res.status(400).json({ message: "No se proporcionó reseña." });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Libro no encontrado." });
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: "Reseña añadida o modificada exitosamente." });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization?.username;

    if (!username) {
        return res.status(403).json({ message: "No estás autenticado." });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Libro no encontrado." });
    }

    if (books[isbn].reviews[username]) {
        delete books[isbn].reviews[username];
        return res.status(200).json({ message: "Reseña eliminada correctamente." });
    } else {
        return res.status(404).json({ message: "No tienes reseñas en este libro." });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
