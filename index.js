const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: [
    'https://mwikifrontend.vercel.app'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

// Handle preflight explicitly (important)
app.options('*', cors());

app.use(express.json());
app.use(express.static('public'));

/* ------------------ MOCK USERS ------------------ */
const users = [
  {
    username: 'test',
    pinHash: bcrypt.hashSync('1234', 10)
  }
];

/* ------------------ ROUTES ------------------ */

app.post('/api/login', async (req, res) => {
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
});

app.post('/api/forgotPassword', (req, res) => {
  const { username } = req.body;
  res.json({
    success: true,
    message: `Password reset requested for ${username}`
  });
});

app.get('/api/vehicleDetails', (req, res) => {
  const { registration } = req.query;

  if (registration === 'KAB123C') {
    return res.json({
      registration,
      dailyContribution: 500,
      monthlyFee: 2000,
      insuranceStatus: 'Active'
    });
  }

  res.status(404).json({
    success: false,
    error: 'Vehicle not found'
  });
});

app.post('/api/updateContribution', (req, res) => {
  const { registration } = req.body;

  if (!registration) {
    return res.status(400).json({
      success: false,
      message: 'Missing registration'
    });
  }

  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
