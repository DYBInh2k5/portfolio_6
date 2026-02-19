Use these Firestore rules in Firebase Console > Firestore Database > Rules.

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null
        && request.auth.token.email != null
        && request.auth.token.email in [
          'binh.vd01500@sinhvien.hoasen.edu.vn'
        ];
    }

    match /posts/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /projects/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

Notes:
- Keep the email list in rules aligned with `.env.local`:
  - `NEXT_PUBLIC_ADMIN_EMAILS`
  - `FIREBASE_ADMIN_EMAILS`
- After updating rules, click `Publish` in Firebase Console.
