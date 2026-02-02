# NYC Countdown Email Setup Guide

## Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. You're Ready!

Your Resend API key is already configured in the code. The app will work out of the box!

If you want to use environment variables (recommended for production):
1. Create a `.env` file
2. Add: `RESEND_API_KEY=re_cx3zYstk_LRwH7Kyrfocw7QaB5YRrrRRN`

### 3. Start the Server
```bash
npm start
```

The server will run on `http://localhost:3001`

## Update Frontend

In your `countdown.jsx`, replace the API call section (around line 23):

```javascript
const response = await fetch('http://localhost:3001/api/subscribe', { 
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email, 
    targetDate: '2026-02-26' 
  })
});

if (!response.ok) throw new Error('Subscription failed');
```

## How It Works

1. **User subscribes** → Email saved to `subscribers.json`
2. **Cron job runs daily at 9 AM** → Sends countdown email to all subscribers
3. **Email contains** → Days remaining + nice formatting
4. **Stops automatically** → When target date is reached

## Testing

### Test the subscription:
```bash
curl -X POST http://localhost:3001/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","targetDate":"2026-02-26"}'
```

### Send test email immediately:
```bash
curl -X POST http://localhost:3001/api/send-test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@gmail.com"}'
```

## Customizing the Cron Schedule

The default schedule is 9 AM daily. To change it, modify the cron expression in `server.js`:

```javascript
// Current: Every day at 9 AM
cron.schedule('0 9 * * *', () => { ... });

// Every day at 8 PM
cron.schedule('0 20 * * *', () => { ... });

// Twice daily (9 AM and 9 PM)
cron.schedule('0 9,21 * * *', () => { ... });

// Every hour
cron.schedule('0 * * * *', () => { ... });
```

**Cron format:** `minute hour day month weekday`

## Deployment Options

### Option 1: Railway (Recommended - Free tier available)
1. Sign up at railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Connect your GitHub account and select your repo
4. Railway will auto-detect Node.js and deploy
5. **Important**: Add environment variable in Railway dashboard:
   - Key: `RESEND_API_KEY`
   - Value: `re_cx3zYstk_LRwH7Kyrfocw7QaB5YRrrRRN`
6. Your backend will be live with a URL like `your-app.railway.app`
7. Update the frontend `countdown.jsx` to use this URL instead of `localhost:3001`

**Note**: Railway might change the port, so make sure to use:
```javascript
const PORT = process.env.PORT || 3001;
```
(Already configured in the server.js file)

### Option 2: Heroku
1. Install Heroku CLI
2. Run:
   ```bash
   heroku create countdown-emails
   heroku config:set EMAIL_USER=your-email@gmail.com
   heroku config:set EMAIL_PASS=your-app-password
   git push heroku main
   ```

### Option 3: DigitalOcean/AWS/VPS
1. Set up a server
2. Install Node.js
3. Clone your code
4. Use PM2 to keep it running:
   ```bash
   npm install -g pm2
   pm2 start server.js
   pm2 startup
   pm2 save
   ```

## Troubleshooting

**Emails not sending:**
- Check that Resend API key is correct
- Verify you haven't exceeded the free tier limit (100 emails/day)
- Check server logs for errors
- Note: Free Resend accounts send from `onboarding@resend.dev`

**Cron not running:**
- Server must stay running 24/7
- Check server timezone matches expected time
- Test with manual endpoint first: `/api/send-test-email`

**Subscribers not saving:**
- Ensure `subscribers.json` file has write permissions
- Check server logs for file system errors

## File Structure
```
├── server.js           # Main server + cron job
├── package.json        # Dependencies
├── .env               # Your email credentials (create this)
├── subscribers.json   # Auto-created, stores emails
└── README.md          # This file
```

## Security Notes

- Never commit `.env` file to Git
- Use environment variables in production
- Consider adding rate limiting for the API
- Add email validation on backend
- Consider adding unsubscribe links in emails

## Next Steps

1. Test locally with your email
2. Deploy to a hosting service
3. Update frontend to use deployed URL instead of localhost
4. Share the countdown link with your girlfriend!
