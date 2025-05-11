const express = require('express');
const session = require('express-session');
const path = require('path');
const authRoutes = require('./routes/auth'); 
const scanRoutes = require('./routes/scan'); 

const app = express();

// Middleware for parsing form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware for managing user sessions
app.use(session({
    secret: 'your_secret_key', // Replace with a strong, secure secret key
    resave: false,
    saveUninitialized: false,
}));

// Static HTML files for login, signup, and main index
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));
app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, 'views', 'signup.html')));
app.get('/index', (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, 'views', 'index.html'));
    } else {
        res.redirect('/');
    }
});

// Logout route to destroy session and redirect to login
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Could not log out.');
        }
        res.clearCookie('connect.sid'); // Optional: clears the session cookie
        res.redirect('/');
    });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'views')));

// Routes for authentication and scanning
app.use(authRoutes);
app.use(scanRoutes);

// Error handling middleware for unmatched routes
app.use((req, res, next) => {
    res.status(404).send('Page not found');
});

app.get('/scan-history', (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, 'views', 'scan-history.html'));
    } else {
        res.redirect('/');
    }
});

// Start server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
