const express = require('express');
const router = express.Router();
const db = require('../db');

// View broadcasts
router.get('/', (req, res) => {
    const stmt = db.prepare(`
        SELECT b.id, b.content, b.timestamp, u.username
        FROM broadcasts b
        JOIN users u ON b.admin_id = u.id
        ORDER BY b.timestamp DESC
    `);
    const broadcasts = stmt.all();
    res.render('broadcasts', { 
        broadcasts, 
        currentRole: req.session.role,
        error: req.query.error || null,
        success: req.query.success || null
    });
});

// Post a new broadcast
router.post('/', (req, res) => {
    if (req.session.role !== 'admin') {
        return res.redirect('/broadcasts?error=Unauthorized: Admins only');
    }

    const { content } = req.body;
    if (!content || !content.trim()) {
        return res.redirect('/broadcasts?error=Content cannot be empty');
    }

    try {
        const stmt = db.prepare('INSERT INTO broadcasts (admin_id, content) VALUES (?, ?)');
        stmt.run(req.session.userId, content.trim());
        res.redirect('/broadcasts?success=Broadcast posted successfully');
    } catch (error) {
        console.error(error);
        res.redirect('/broadcasts?error=Failed to post broadcast');
    }
});

module.exports = router;
