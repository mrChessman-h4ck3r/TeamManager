const db = require('./db');
const bcrypt = require('bcrypt');

const adminUsername = 'admin';
const adminPassword = 'password123'; // Default initial password

const seedAdmin = async () => {
    try {
        const hash = await bcrypt.hash(adminPassword, 10);
        
        const stmt = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
        stmt.run(adminUsername, hash, 'admin');
        
        console.log('Admin user created successfully.');
        console.log(`Username: ${adminUsername}`);
        console.log(`Password: ${adminPassword}`);
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            console.log('Admin user already exists.');
        } else {
            console.error('Error creating admin user:', error);
        }
    }
};

seedAdmin();
