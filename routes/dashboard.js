const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
    // Fetch member list
    const stmt = db.prepare('SELECT id, username, role FROM users ORDER BY role ASC, username ASC');
    const members = stmt.all();

    res.render('dashboard', { 
        members,
        currentRole: req.session.role,
        username: req.session.username
    });
});

module.exports = router;
