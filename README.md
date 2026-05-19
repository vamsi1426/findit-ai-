# LostMate AI (React Edition)

A premium, AI-powered Lost & Found application built with React, Vite, TensorFlow.js, and Firebase.

## 🚀 Features

- **AI-Powered Matching**: Uses `MobileNet` (Vision) and `Universal Sentence Encoder` (NLP) to match lost and found items.
- **Edge AI**: All AI processing happens in the browser for privacy and speed.
- **Smart Search**: Semantic search capability ("blue bag" finds "navy backpack").
- **Premium UI**: Glassmorphism design, Framer Motion animations, and dark mode.
- **Real-time**: Firebase integration for instant updates.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **AI**: TensorFlow.js
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Icons**: Lucide React
- **Charts**: Recharts

## 📦 Installation

1.  **Install Dependencies**

    ```bash
    npm install --legacy-peer-deps
    ```

2.  **Run Locally**
    ```bash
    npm run dev
    ```

## 🔒 Security Rules (Important)

If you see "Missing Permissions" errors, update your Firestore Rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🌍 Deployment to Firebase

1.  **Build the Project**

    ```bash
    npm run build
    ```

2.  **Initialize Firebase** (if not done)

    ```bash
    firebase login
    firebase init hosting
    # Choose 'dist' as your public directory
    # Configure as a single-page app (Yes)
    ```

3.  **Deploy**
    ```bash
    firebase deploy
    ```

## 📝 License

© 2026 LostMate AI. All rights reserved.
