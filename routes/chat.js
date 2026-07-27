const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('chat', { currentUserId: req.session.userId });
});

module.exports = router;
