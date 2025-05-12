/* eslint-disable no-undef */
const express = require('express');
const bcrypt = require('bcrypt'); // for hashing passwords
const db = require('../db');  // For my database. 
const router = express.Router(); // handles routes 
const nodemailer = require('nodemailer');// used for email

// node mailer info
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'noreplycodescanner@gmail.com',
        pass: 'msxx jvvm nfaf ahrl',
    },
});

// Sign-Up Route
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if the email already exists in the database
        db.query('SELECT * FROM user_db WHERE email = ?', [email], async (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Database error');
            }
            if (results.length > 0) {
                return res.status(400).send('Email already in use'); // response if email exsists 
            }

            // Hashes password before saved in db
            const hashedPassword = await bcrypt.hash(password, 10);

            // signup/adds new user to db 
            db.query(
                'INSERT INTO user_db (name, email, password) VALUES (?, ?, ?)',
                [name, email, hashedPassword],
                (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Database error');
                    }
                    res.redirect('/'); // Redirect to login page after signup
                }
            );
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error'); 

    }
});

// Login Route
router.post('/login', (req, res) => {
    console.log('Request body:', req.body); 

    const { email, password } = req.body; //
    
    
    // checks to see if user is in the database
    db.query('SELECT * FROM user_db WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error'); // if it cant connect to database thhat message appears
        }
        if (results.length === 0) {
            console.log('No user found with the given email');
            return res.status(401).send('Invalid email or password'); // message if no user are found
        }

        console.log('User found in DB:', results[0].email);
        // compares the hash password with regular password in db 
        const match = await bcrypt.compare(password, results[0].password);
        if (!match) {
            console.log('Password does not match');
            return res.status(401).send('Invalid email or password');// message if password doesnt match 
        }
        // creates a session for users that are logged in
        req.session.user = { id: results[0].id, name: results[0].name, email: results[0].email };
        res.redirect('/index');
    });
});

// Reset Password Request Route
router.post('/reset-password-request', async (req, res) => {
    const { email } = req.body;

    // user gets this link when email is sent. 
    const resetLink = `http://localhost:3000/resetPasswordPage.html?email=${encodeURIComponent(email)}`;

    const mailOptions = {
        from: 'noreplycodescanner@gmail.com',
        to: email,
        subject: 'Reset Your Password',
        html: `<p>Click the link below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`,
    };

    try {
        // sends the reset email message
        await transporter.sendMail(mailOptions);
        res.send('Reset link sent to your email!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error sending email. Please try again.');// message if email fails. 
    }
});
// Reset Password Route (POST)
router.post('/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
        return res.status(400).send('Missing email or password');// message if email fails
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        // updates user passwords in the database
        db.query(
            'UPDATE user_db SET password = ? WHERE email = ?',
            [hashedPassword, email],
            (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Database error');// database error message 
                }

                if (results.affectedRows === 0) {
                    console.log('No user found with that email');
                    return res.status(404).send('No user found');// error message if no user
                }

                console.log(`Password successfully reset for: ${email}`);
                // Redirect to login page after resetting password
                res.redirect('/login.html');  // This should correctly redirect to login.html
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).send('Error resetting password');// export the router for use in app. 
    }
});

module.exports = router;
