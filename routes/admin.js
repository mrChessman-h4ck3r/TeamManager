const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db');

// Middleware to ensure admin role
const requireAdmin = (req, res, next) => {
    if (req.session.userId && req.session.role === 'admin') {
        return next();
    }
    return res.status(403).send('Forbidden: Admins only');
};

router.use(requireAdmin);

// View Admin Panel
router.get('/', (req, res) => {
    const success = req.query.success || null;
    const stmt = db.prepare('SELECT id, username, role FROM users');
    const users = stmt.all();
    res.render('admin', { users, currentUserId: req.session.userId, error: null, success });
});

// Add new member
router.post('/add', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hash = await bcrypt.hash(password, 10);
        const stmt = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
        stmt.run(username, hash, 'member');
        res.redirect('/admin?success=Member added successfully');
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            res.render('admin', { users: db.prepare('SELECT id, username, role FROM users').all(), currentUserId: req.session.userId, error: 'Username already exists', success: null });
        } else {
            console.error(error);
            res.render('admin', { users: db.prepare('SELECT id, username, role FROM users').all(), currentUserId: req.session.userId, error: 'Error adding member', success: null });
        }
    }
});

// Remove member
router.post('/remove', (req, res) => {
    const { userId } = req.body;
    if (parseInt(userId) === req.session.userId) {
        return res.render('admin', { users: db.prepare('SELECT id, username, role FROM users').all(), currentUserId: req.session.userId, error: 'Cannot remove yourself', success: null });
    }
    try {
        const stmt = db.prepare('DELETE FROM users WHERE id = ?');
        stmt.run(userId);
        res.redirect('/admin?success=Member removed successfully');
    } catch (error) {
        console.error(error);
        res.render('admin', { users: db.prepare('SELECT id, username, role FROM users').all(), currentUserId: req.session.userId, error: 'Error removing member', success: null });
    }
});

// Transfer admin
router.post('/transfer', (req, res) => {
    const { newAdminId } = req.body;
    try {
        const transaction = db.transaction(() => {
            db.prepare('UPDATE users SET role = ? WHERE id = ?').run('member', req.session.userId);
            db.prepare('UPDATE users SET role = ? WHERE id = ?').run('admin', newAdminId);
        });
        transaction();
        req.session.role = 'member'; // Demote current session
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.render('admin', { users: db.prepare('SELECT id, username, role FROM users').all(), currentUserId: req.session.userId, error: 'Error transferring admin role', success: null });
    }
});

module.exports = router;
