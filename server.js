// server.js
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// File to store subscribers
const SUBSCRIBERS_FILE = path.join(__dirname, 'subscribers.json');

// Initialize subscribers file if it doesn't exist
if (!fs.existsSync(SUBSCRIBERS_FILE)) {
  fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify([]));
}

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY || 're_cx3zYstk_LRwH7Kyrfocw7QaB5YRrrRRN');

// Helper function to read subscribers
function getSubscribers() {
  const data = fs.readFileSync(SUBSCRIBERS_FILE, 'utf8');
  return JSON.parse(data);
}

// Helper function to save subscribers
function saveSubscribers(subscribers) {
  fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));
}

// Calculate days until target date
function getDaysUntil(targetDate) {
  const now = new Date();
  const target = new Date(targetDate);
  const diffTime = target - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Send countdown email
async function sendCountdownEmail(email, daysLeft) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { text-align: center; color: #6b46c1; font-size: 32px; font-weight: bold; margin-bottom: 20px; }
        .countdown { text-align: center; font-size: 48px; font-weight: bold; color: #4c1d95; margin: 30px 0; }
        .message { text-align: center; color: #4b5563; font-size: 18px; line-height: 1.6; }
        .route { text-align: center; color: #6b7280; margin: 20px 0; font-size: 16px; }
        .footer { text-align: center; margin-top: 30px; color: #9ca3af; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">NYC Countdown</div>
        <div class="route">✈️ Delhi → NYC</div>
        <div class="countdown">${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}</div>
        <div class="message">
          ${daysLeft === 1 
            ? 'Tomorrow is the day! See you in New York City! 🎉' 
            : `Only ${daysLeft} days left until February 26!`
          }
        </div>
        <div class="footer">
          <p>You're receiving this because you subscribed to countdown reminders.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: 'NYC Countdown <countdown@samarthnarang.com>',
      to: email,
      subject: `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} until NYC! 🗽`,
      html: htmlContent
    });
    console.log(`Email sent to ${email} - ${daysLeft} days left`);
  } catch (error) {
    console.error(`Failed to send email to ${email}:`, error);
  }
}

// API endpoint to subscribe
app.post('/api/subscribe', (req, res) => {
  const { email, targetDate } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const subscribers = getSubscribers();
  
  // Check if already subscribed
  if (subscribers.find(sub => sub.email === email)) {
    return res.json({ message: 'Already subscribed', alreadySubscribed: true });
  }

  // Add new subscriber
  subscribers.push({
    email,
    targetDate: targetDate || '2026-02-26',
    subscribedAt: new Date().toISOString()
  });

  saveSubscribers(subscribers);

  res.json({ message: 'Successfully subscribed!', success: true });
});

// API endpoint to unsubscribe
app.post('/api/unsubscribe', (req, res) => {
  const { email } = req.body;
  
  let subscribers = getSubscribers();
  subscribers = subscribers.filter(sub => sub.email !== email);
  
  saveSubscribers(subscribers);
  
  res.json({ message: 'Successfully unsubscribed' });
});

// Add this endpoint to check subscribers
app.get('/api/subscribers', (req, res) => {
  const subscribers = getSubscribers();
  res.json({ 
    count: subscribers.length,
    subscribers: subscribers 
  });
});

// Cron job - runs every day at 9 AM IST (3:30 AM UTC)
cron.schedule('30 3 * * *', () => {
  console.log('Running daily countdown email job...');
  
  const subscribers = getSubscribers();
  const targetDate = '2026-02-26';
  const daysLeft = getDaysUntil(targetDate);

  if (daysLeft <= 0) {
    console.log('Target date reached! No more emails to send.');
    return;
  }

  subscribers.forEach(subscriber => {
    sendCountdownEmail(subscriber.email, daysLeft);
  });

  console.log(`Sent ${subscribers.length} countdown emails`);
});

// Manual trigger endpoint for testing
app.post('/api/send-test-email', async (req, res) => {
  const { email } = req.body;
  const daysLeft = getDaysUntil('2026-02-26');
  
  try {
    await sendCountdownEmail(email || 'test@example.com', daysLeft);
    res.json({ message: 'Test email sent!', daysLeft });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Cron job scheduled to run daily at 9:00 AM IST (3:30 AM UTC)');
});