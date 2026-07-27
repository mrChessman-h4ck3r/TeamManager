const express = require('express');
const session = require('express-session');
const SqliteStore = require('better-sqlite3-session-store')(session);
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const chatRoutes = require('./routes/chat');
const broadcastsRoutes = require('./routes/broadcasts');
const updatesRoutes = require('./routes/updates');
const dashboardRoutes = require('./routes/dashboard');
const db = require('./db');

// Keep SQLite files in ./data (works with Render disk mounts later)
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}
const sessionDb = require('better-sqlite3')(path.join(dataDir, 'sessions.sqlite'));

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const isProd = process.env.NODE_ENV === 'production';

// Required behind Render / reverse proxies so secure cookies work
app.set('trust proxy', 1);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
const sessionMiddleware = session({
    store: new SqliteStore({
        client: sessionDb,
        expired: {
            clear: true,
            intervalMs: 900000 // 15 min
        }
    }),
    secret: process.env.SESSION_SECRET || 'hackathon-super-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        secure: isProd, // HTTPS on Render
        httpOnly: true,
        sameSite: 'lax'
    }
});
app.use(sessionMiddleware);

// Share session with Socket.IO
io.engine.use(sessionMiddleware);

// Socket.IO Logic
io.on('connection', (socket) => {
    const req = socket.request;
    if (!req.session || !req.session.userId) {
        socket.disconnect();
        return;
    }

    // Send history
    const stmt = db.prepare(`
        SELECT m.content, m.timestamp, u.username, u.role
        FROM messages m
        JOIN users u ON m.user_id = u.id
        ORDER BY m.timestamp ASC LIMIT 100
    `);
    const history = stmt.all();
    socket.emit('chat history', history);

    socket.on('chat message', (msg) => {
        if (!msg.trim()) return;

        const insertStmt = db.prepare('INSERT INTO messages (user_id, content) VALUES (?, ?)');
        insertStmt.run(req.session.userId, msg);

        const userStmt = db.prepare('SELECT username, role FROM users WHERE id = ?');
        const user = userStmt.get(req.session.userId);

        io.emit('chat message', {
            content: msg,
            username: user.username,
            role: user.role,
            timestamp: new Date().toISOString()
        });
    });
});

// Protected route middleware
const requireLogin = (req, res, next) => {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/login');
};

// Health check for Render
app.get('/health', (req, res) => {
    res.status(200).send('ok');
});

// Routes
app.use('/', authRoutes);
app.use('/admin', requireLogin, adminRoutes);
app.use('/chat', requireLogin, chatRoutes);
app.use('/broadcasts', requireLogin, broadcastsRoutes);
app.use('/updates', requireLogin, updatesRoutes);
app.use('/dashboard', requireLogin, dashboardRoutes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
