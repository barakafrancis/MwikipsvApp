// server.js (Node.js backend with Express)
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from 'public' folder

// Mock data or connect to your C# application here
// For "C# friendly", you can replace these endpoints with calls to your C# API
// e.g., using axios to call your C# app's endpoints

// Example: const axios = require('axios');
// Then in endpoints: await axios.post('https://your-csharp-app.com/api/login', { username, pin });

// For now, stubbed responses

app.post('/api/login', (req, res) => {
    const { username, pin } = req.body;
    // Stub: Check against mock
    if (username === 'test' && pin === '1234') {
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'Invalid credentials' });
    }
});

app.post('/api/forgotPassword', (req, res) => {
    const { username } = req.body;
    // Stub: Simulate reset request
    res.json({ message: `Password reset requested for ${username}. Check your email.` });
});

app.get('/api/vehicleDetails', (req, res) => {
    const { registration } = req.query;
    // Stub: Mock data
    if (registration === 'KAB123C') {
        res.json({
            registration,
            dailyContribution: '500',
            monthlyFee: '2000',
            insuranceStatus: 'Active'
        });
    } else {
        res.json({ error: 'Vehicle not found' });
    }
});

app.post('/api/updateContribution', (req, res) => {
    const { registration, dailyContribution, monthlyFee, insuranceStatus } = req.body;
    // Stub: Simulate update
    res.json({ success: true });
});

// For Vercel, export the app
module.exports = app;

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}
