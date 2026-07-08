# Email Setup Guide - Fix "No Email" Issue

## The Problem
You're not receiving emails because the Resend API key is not configured in Vercel.

## The Solution - 3 Quick Steps

### Step 1: Sign up for Resend (FREE)
1. Go to https://resend.com
2. Click "Sign Up" (it's completely free)
3. Verify your email

### Step 2: Get Your API Key
1. Once logged in, go to https://resend.com/api-keys
2. Click "Create API Key"
3. Name it: "Lagos Liquor Production"
4. Copy the API key (it looks like: `re_xxxxxxxxxx`)

### Step 3: Add to Vercel
1. Go to your Vercel dashboard: https://vercel.com
2. Select your "lagosliqour" project
3. Go to **Settings** → **Environment Variables**
4. Click "Add New"
5. Set:
   - **Name**: `RESEND_API_KEY`
   - **Value**: [paste the API key from step 2]
   - **Environments**: Check all (Production, Preview, Development)
6. Click "Save"
7. Go to **Deployments** tab
8. Click the **three dots** on your latest deployment
9. Click **"Redeploy"**

### Step 4: Test It
1. After redeployment completes (1-2 minutes)
2. Go to your website and place a test order
3. Select "Bank Transfer" payment method
4. Complete the order
5. Check **therealteejay25@gmail.com** inbox (and spam folder!)

## Email Details (Already Configured)
- ✅ Sender: `onboarding@resend.dev` (Resend free tier)
- ✅ Recipient: `therealteejay25@gmail.com`
- ✅ Email template: Professional HTML with all order details
- ✅ Email code: Working correctly

## Verification Checklist
After following steps above, your logs in Vercel should show:
```
=== Bank Transfer Email API Called ===
Order data received: {...}
Attempting to send email to therealteejay25@gmail.com
Email sent successfully: { id: 'xxx' }
```

## Important Notes
- Resend FREE tier allows 100 emails/day and 3,000 emails/month
- The sender `onboarding@resend.dev` can only send to verified email addresses
- To send to ANY email address, you need to verify a custom domain in Resend
- For testing, Resend automatically verifies the email you signed up with

## Still Not Working?
If you followed all steps and still no email:

1. **Check Vercel logs:**
   - Go to Vercel → Your Project → Deployments
   - Click on latest deployment → "Functions" tab
   - Check logs for `/api/orders/bank-transfer`

2. **Check Resend dashboard:**
   - Go to https://resend.com/emails
   - See if emails are being sent

3. **Check spam folder:**
   - Emails from `onboarding@resend.dev` might go to spam

4. **Verify API key:**
   - Make sure you copied the full API key
   - Make sure there are no extra spaces
   - Make sure you redeployed after adding it

## Need Help?
The code is correct. The issue is 100% environment configuration. Follow the steps above exactly.
