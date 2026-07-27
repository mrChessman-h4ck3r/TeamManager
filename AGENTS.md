# Agents

# Project: Hackathon Team Hub

Stack: Node.js, Express, EJS, SQLite (better-sqlite3), bcrypt, express-session, Socket.IO
No frontend framework. No TypeScript. Keep dependencies minimal.

## Roles
- Admin: added by seed script only. Can add/remove members, set usernames/passwords,
  transfer admin role to any member, post broadcasts.
- Member: login only. Can use chat, post/view upskilling updates, view broadcasts.

## Pages
- /login — username + password
- /dashboard — member list, quick links
- /admin — add/remove member, transfer admin
- /chat — shared room, Socket.IO, persisted in SQLite
- /broadcasts — admin posts, all read
- /updates — members post upskilling logs, visible to all

## Rules
- Passwords always hashed with bcrypt, never plaintext.
- No public signup route — accounts only created via /admin.
- Sessions via express-session + SQLite session store.
