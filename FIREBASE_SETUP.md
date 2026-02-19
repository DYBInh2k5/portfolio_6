# Firebase Setup Guide - Step by Step

## Step 1: Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Login with your Google account
3. Click "Add project"
4. Enter project name (e.g., my-blog-app)
5. Disable Google Analytics (optional)
6. Click "Create project" and wait for it to complete

## Step 2: Get Firebase Configuration
1. In Firebase Console, click the **Settings icon** (⚙️) 
2. Scroll down to "Your apps" section
3. Click the **Web icon** (</>) to add a web app
4. Register app nickname (e.g., My Blog Web)
5. Click "Register app"
6. Copy the `firebaseConfig` object values

## Step 3: Update Firebase Config File
Open `lib/firebase.js` and replace the placeholder values:

```
javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",           // e.g., AIzaSy...
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123...",
  databaseURL: "https://your-project.firebaseio.com"
};
```

## Step 4: Install Firebase SDK
```
bash
npm install firebase
```

## Step 5: Using Firebase in Your App

### Example: Firestore (Database)
```
javascript
// lib/firebase.js (already created)
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from './firebase';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
```

### Example: Authentication
```
javascript
import { getAuth } from 'firebase/auth';

const auth = getAuth(app);
export { auth };
```

### Example: Storage
```
javascript
import { getStorage } from 'firebase/storage';

const storage = getStorage(app);
export { storage };
```

## Quick Summary

| Step | Action |
|------|--------|
| 1 | Create project at firebase.google.com |
| 2 | Add Web app and get config |
| 3 | Update lib/firebase.js |
| 4 | Run `npm install firebase` |
| 5 | Import and use Firebase services |

## Firebase Services You Can Use

- **Firestore** - Database (NoSQL)
- **Authentication** - User login/signup
- **Storage** - File storage
- **Hosting** - Static website hosting
- **Analytics** - User analytics
- **Cloud Functions** - Serverless functions
