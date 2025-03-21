const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }))

app.use("/customer/auth/*", function auth(req, res, next) {
    const token = req.headers['authorization'];
    console.log(token)
    if (!token) {
        return res.status(401).json({ message: "Falta el token de autenticación." });
    }
 
    const bearerToken = token.split(' ')[1]; // Espera "Bearer <token>"

    jwt.verify(bearerToken, "clave_secreta", (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Token inválido o expirado." });
        }

        req.session.authorization = { username: decoded.username, accessToken: bearerToken };
        next();
    });
});

const PORT = 5001;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
