const express = require('express');
const router = express.Router();
const db = require('../db');

// View updates
router.get('/', (req, res) => {
    const stmt = db.prepare(`
        SELECT u.id, u.content, u.timestamp, users.username, users.role
        FROM updates u
        JOIN users ON u.user_id = users.id
        ORDER BY u.timestamp DESC
    `);
    const updates = stmt.all();
    res.render('updates', { 
        updates, 
        currentRole: req.session.role,
        error: req.query.error || null,
        success: req.query.success || null
    });
});

// Post a new update
router.post('/', (req, res) => {
    const { content } = req.body;
    if (!content || !content.trim()) {
        return res.redirect('/updates?error=Content cannot be empty');
    }

    try {
        const stmt = db.prepare('INSERT INTO updates (user_id, content) VALUES (?, ?)');
        stmt.run(req.session.userId, content.trim());
        res.redirect('/updates?success=Update posted successfully');
    } catch (error) {
        console.error(error);
        res.redirect('/updates?error=Failed to post update');
    }
});

module.exports = router;
