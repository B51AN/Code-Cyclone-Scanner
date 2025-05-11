const express = require('express');
const session = require('express-session');
const path = require('path');
const authRoutes = require('./routes/auth');  // Authentication routes (login, signup, logout)
const scanRoutes = require('./routes/scan');  // Code scanning functionality routes

const app = express();

// === Middleware Configuration ===

// Parse URL-encoded form data (for login/signup forms)
app.use(express.urlencoded({ extended: true }));
// Parse JSON bodies (for API endpoints)
app.use(express.json());

// Configure session management for user login state
app.use(session({
    secret: 'your_secret_key', // Replace with a secure, random key in production
    resave: false,             // Don't save session if unmodified
    saveUninitialized: false,  // Don't create session until something stored
}));

// === Route Definitions ===

// Root route: serve the login page
app.get('/', (req, res) =>
    res.sendFile(path.join(__dirname, 'views', 'login.html'))
);

// Signup page route
app.get('/signup', (req, res) =>
    res.sendFile(path.join(__dirname, 'views', 'signup.html'))
);

// Main index route: only accessible if the user is logged in
app.get('/index', (req, res) => {
    if (req.session.user) {
        // If session contains a user, show the scanner UI
        res.sendFile(path.join(__dirname, 'views', 'index.html'));
    } else {
        // Otherwise, redirect back to login
        res.redirect('/');
    }
});

// Logout route: destroys the session and clears the cookie
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            // Handle potential error during session destroy
            return res.status(500).send('Could not log out.');
        }
        res.clearCookie('connect.sid');  // Remove session cookie from browser
        res.redirect('/');               // Redirect to login page
    });
});

// Serve static assets (CSS, client-side JS, images) from the 'views' folder
app.use(express.static(path.join(__dirname, 'views')));

// Attach custom route modules
app.use(authRoutes);  // Handles /login, /signup POST requests
app.use(scanRoutes);  // Handles /scan endpoint and results storage

// 404 handler: catch any unmatched routes
app.use((req, res, next) => {
    res.status(404).send('Page not found');
});

// Scan history page: displays a logged-in user's past scans
app.get('/scan-history', (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, 'views', 'scan-history.html'));
    } else {
        res.redirect('/');
    }
});

// === Server Startup ===

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
