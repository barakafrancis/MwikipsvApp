const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(express.static('public'));

app.use(cors({
  origin: 'https://mwikifrontend.vercel.app',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.options('*', cors());

// --- Sample ---
const users = [
  {
    username: 'compweb',
    pinHash: bcrypt.hashSync('1234', 10)
  }
];

// --- Api ---

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, pin } = req.body;

    if (!username || !pin) {
      return res.status(400).json({
        success: false,
        message: 'Missing credentials'
      });
    }

    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const match = await bcrypt.compare(pin, user.pinHash);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Forgot password 
app.post('/api/forgotPassword', (req, res) => {
  try {
    const { username } = req.body;
    res.json({
      success: true,
      message: `Password reset requested for ${username}`
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Contribution
app.get('/api/vehicleDetails', (req, res) => {
  try {
    const { registration } = req.query;

    if (registration === 'KCA869H') {
      return res.json({
        registration,
        dailyContribution: 500,
        monthlyFee: 2000,
        loanrepayment: 1000
      });
    }
    res.status(404).json({
      success: false,
      error: 'Vehicle details not found'
    });
  } catch (err) {
    console.error('Vehicle details error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update contribution route
app.post('/api/updateContribution', (req, res) => {
  try {
    const { registration } = req.body;

    if (!registration) {
      return res.status(400).json({
        success: false,
        message: 'Missing registration'
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
