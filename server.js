// Full-stack Robux reward website

// Backend: Express.js server to handle authentication, offerwalls, points system, and withdrawals
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(
    session({
        secret: "securesecret", // Change this in production
        resave: false,
        saveUninitialized: true,
    })
);

const users = {}; // Store users (username -> points)
const withdrawals = []; // Store withdrawal requests
const ADMIN_USERNAME = "waw4weq";
const ADMIN_PASSWORD = "234654543333432";

// User Login (Roblox Username only, no password)
app.post("/login", (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "Username required" });
    if (!users[username]) users[username] = { points: 0 };
    req.session.username = username;
    res.json({ success: true, username });
});

// Admin Login
app.post("/admin/login", (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        req.session.admin = true;
        res.json({ success: true });
    } else {
        res.status(403).json({ error: "Invalid admin credentials" });
    }
});

// Earn Points from Offerwalls (Dummy API integration)
app.post("/earn", (req, res) => {
    const { username, points } = req.body;
    if (!users[username]) return res.status(400).json({ error: "User not found" });
    users[username].points += points;
    res.json({ success: true, newPoints: users[username].points });
});

// Withdraw Request
app.post("/withdraw", (req, res) => {
    const { username, amount } = req.body;
    if (!users[username] || users[username].points < amount) {
        return res.status(400).json({ error: "Insufficient points" });
    }
    if (amount < 5 || amount > 1000) {
        return res.status(400).json({ error: "Withdraw limits: 5-1000 Robux" });
    }
    withdrawals.push({ username, amount, status: "pending" });
    res.json({ success: true, message: "Withdrawal requested" });
});

// Admin Approves/Deny Withdrawals
app.post("/admin/withdraw", (req, res) => {
    if (!req.session.admin) return res.status(403).json({ error: "Admin only" });
    const { username, decision } = req.body;
    const withdrawal = withdrawals.find(w => w.username === username && w.status === "pending");
    if (!withdrawal) return res.status(400).json({ error: "No pending request" });
    if (decision === "approve") {
        users[username].points -= withdrawal.amount;
        withdrawal.status = "approved";
    } else {
        withdrawal.status = "denied";
    }
    res.json({ success: true });
});

app.listen(3000, () => console.log("Server running on port 3000"));
