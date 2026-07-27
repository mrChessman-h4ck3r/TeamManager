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

// Handle change password for logged-in user
router.post('/change-password', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.session.userId;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return res.redirect('/dashboard?error=' + encodeURIComponent('All password fields are required'));
    }

    if (newPassword !== confirmPassword) {
        return res.redirect('/dashboard?error=' + encodeURIComponent('New passwords do not match'));
    }

    if (newPassword.length < 6) {
        return res.redirect('/dashboard?error=' + encodeURIComponent('New password must be at least 6 characters long'));
    }

    try {
        const stmt = db.prepare('SELECT password FROM users WHERE id = ?');
        const user = stmt.get(userId);

        if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
            return res.redirect('/dashboard?error=' + encodeURIComponent('Current password is incorrect'));
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        const updateStmt = db.prepare('UPDATE users SET password = ? WHERE id = ?');
        updateStmt.run(hashed, userId);

        return res.redirect('/dashboard?success=' + encodeURIComponent('Password changed successfully'));
    } catch (error) {
        console.error(error);
        return res.redirect('/dashboard?error=' + encodeURIComponent('An error occurred while updating password'));
    }
});

module.exports = router;
