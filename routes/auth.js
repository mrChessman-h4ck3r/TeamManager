const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db');

// Login page
router.get(['/', '/login'], (req, res) => {
    if (req.session.userId) {
        return res.redirect('/dashboard');
    }
    res.render('login', { error: null });
});

// Handle login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
        const user = stmt.get(username);

        if (user && await bcrypt.compare(password, user.password)) {
            // Setup session
            req.session.userId = user.id;
            req.session.role = user.role;
            req.session.username = user.username;
            return res.redirect('/dashboard');
        } else {
            return res.render('login', { error: 'Invalid username or password' });
        }
    } catch (error) {
        console.error(error);
        return res.render('login', { error: 'An error occurred during login' });
    }
});

// Handle logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

module.exports = router;
