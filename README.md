# QueueMate — Smart Queue Management System

QueueMate is a modern, responsive digital queue management web application designed for clinics, salons, service centres, and local service businesses. It replaces chaotic waiting halls and physical ticket machines with real-time digital tokens, one-click operator controls, an audio-enabled customer TV display, and real-time operational analytics.

---

## Key Features

- **Sequential Daily Tokens**: Issues daily sequential tokens (e.g. `A-001`, `002`) using atomic Cloud Firestore transactions to prevent duplicate tokens and concurrency race conditions.
- **Operator Console**: One-click "Call Next Customer", real-time status transitions (`Waiting`, `Serving`, `Completed`, `Skipped`, `Cancelled`), and token search and filtering.
- **Customer TV / Tablet Kiosk**: Full-screen, high-contrast display suitable for waiting room televisions with live audio chimes and estimated wait times.
- **Business Multi-Tenant Data Isolation**: Every business owns its private queue, tokens, and settings scoped by user authentication UID in Cloud Firestore.
- **Real-Time Synchronization**: Instant zero-latency updates across all devices powered by official Firebase Firestore `onSnapshot` listeners.
- **Genuine Queue Analytics**: Real database metrics for daily served counts, wait durations, peak volume hours, and lifecycle resolution rates.

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Authentication (Email and Password)
- **Database**: Cloud Firestore
- **Icons**: Lucide React
- **Audio Chimes**: Web Audio API (zero external assets needed)

---

## 1. Step-by-Step Firebase Setup Instructions

Follow these steps to connect QueueMate to your own free Google Firebase project:

### Step 1: Create a Firebase Project
1. Open the [Firebase Console](https://console.firebase.google.com).
2. Click **Add project**, enter a project name (e.g., `queuemate-app`), and click **Continue**.
3. (Optional) Disable Google Analytics or leave default, then click **Create project**.

### Step 2: Enable Firebase Authentication
1. In the Firebase Console left-hand sidebar, navigate to **Build** > **Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, click **Email/Password**.
4. Enable the first toggle (**Email/Password**). Leave Email link disabled.
5. Click **Save**.

### Step 3: Enable Cloud Firestore
1. In the sidebar, navigate to **Build** > **Firestore Database**.
2. Click **Create database**.
3. Choose your database location (e.g., `us-central1` or nearest region) and click **Next**.
4. Select **Start in production mode** (or test mode) and click **Create**.
5. Once created, go to the **Rules** tab, paste the contents of `firestore.rules` from this repository, and click **Publish**.

### Step 4: Register Web App & Copy Configuration
1. Click the gear icon (**Project settings**) at the top of the left sidebar.
2. In the **General** tab, scroll down to **Your apps**.
3. Click the Web icon (`</>`) to add a web app.
4. Name your app (e.g., `QueueMate Web`) and click **Register app**.
5. Copy the credentials from the `firebaseConfig` object.

### Step 5: Configure Environment Variables
Create a `.env` file in the project root:

```bash
VITE_FIREBASE_API_KEY="AIzaSyYourApiKeyHere"
VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789012"
VITE_FIREBASE_APP_ID="1:123456789012:web:abcdef123456"
```

*Note: You can also paste these keys directly into the app at runtime using the in-app **Firebase Configuration** modal.*

---

## 2. Exporting the Project to GitHub

To export QueueMate to GitHub:

1. Create a new empty repository on [GitHub](https://github.com/new) (e.g. `queuemate`).
2. In your local terminal, initialize git and push:

```bash
# Initialize git repository
git init

# Add all project files
git add .

# Create initial commit
git commit -m "feat: complete QueueMate application with Firebase Auth and Firestore"

# Set default branch
git branch -M main

# Add your GitHub remote repository URL
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/queuemate.git

# Push code
git push -u origin main
```

---

## 3. Deploying on Vercel

1. Log in to [Vercel](https://vercel.com) using your GitHub account.
2. Click **Add New...** > **Project**.
3. Select and import your `queuemate` GitHub repository.
4. Under **Build and Output Settings**:
   - **Framework Preset**: `Vite` (automatically detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add the 6 variables:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
6. Click **Deploy**. Vercel will build and deploy QueueMate in under 1 minute.
7. **Authorize Domain in Firebase**: In Firebase Console > **Authentication** > **Settings** > **Authorized domains**, add your Vercel deployment URL (e.g. `queuemate.vercel.app`).

---

## 4. Final Quality & Testing Checklist

Use this checklist to verify your live deployment:

- [x] **Registration**: Create a new account with business name, category, and email/password. Verify the record is created in Firebase Auth and Firestore `users/{uid}` and `businesses/{businessId}`.
- [x] **Authentication**: Sign out and sign back in. Refresh the page to confirm that the Firebase `onAuthStateChanged` listener preserves session credentials.
- [x] **Password Reset**: Open the "Forgot Password" modal on the login page and request a reset link for an existing account.
- [x] **Daily Sequential Tokens**: Issue tokens for 3 customers. Confirm they increment sequentially (`A-001`, `A-002`, `A-003`) via atomic Firestore transactions.
- [x] **Double-Click Prevention**: Attempt to double-click "Issue Token"; verify the button disables and issues exactly one token.
- [x] **Operator Workflow**: Click "Call Next Customer". Confirm status updates to `Serving`, audio chime plays, and previous serving token is marked `Completed`.
- [x] **Skip / Re-Queue**: Mark a token as `Skipped`. Test re-adding the skipped customer to the waiting queue.
- [x] **Token Cancellation**: Cancel a ticket and confirm that the confirmation dialog appears before updating status to `Cancelled`.
- [x] **Customer TV Display**: Open the Customer Display page in a second browser window or device. Advance a token on the operator desk and verify the TV screen updates instantly in real time without refreshing.
- [x] **Tenant Data Isolation**: Register a second business account in an incognito window. Verify that Business B cannot see or manipulate Business A's queue tokens or analytics.
- [x] **Analytics Calculations**: Verify that wait duration and completion rates calculate strictly from real Firestore timestamps without fabricated mock data.
