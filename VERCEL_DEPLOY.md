# Deploy Vercel Guide (portfolio_6)

## 1. Preconditions

- Source code is pushed to GitHub repo (`main` branch).
- You have a Vercel account connected to your GitHub account.
- Firebase project is already created.
- Resend account is ready (for contact form email).

## 2. Create A New Vercel Project

1. Go to https://vercel.com/dashboard
2. Click `Add New...` -> `Project`
3. Import repo: `DYBInh2k5/portfolio_6`
4. Framework should auto-detect as `Next.js`
5. Keep build settings default:
   - Build Command: `npm run build`
   - Output: auto
6. Click `Deploy`

## 3. Configure Environment Variables (Important)

Open: `Project -> Settings -> Environment Variables`

Add these variables for both **Production** and **Preview**:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

NEXT_PUBLIC_ADMIN_EMAILS=binh.vd01500@sinhvien.hoasen.edu.vn
FIREBASE_ADMIN_EMAILS=binh.vd01500@sinhvien.hoasen.edu.vn

RESEND_API_KEY=
CONTACT_RECEIVER_EMAIL=binh.vd01500@sinhvien.hoasen.edu.vn
CONTACT_FROM_EMAIL=Portfolio Contact <onboarding@resend.dev>
```

After adding env vars:

1. Go to `Deployments`
2. Open latest deployment
3. Click `Redeploy`

## 4. Publish Firestore Rules

1. Open Firebase Console -> Firestore Database -> Rules
2. Copy rules from `FIRESTORE_RULES.md`
3. Click `Publish`

## 5. Firebase Auth Domain Setup

1. Firebase Console -> Authentication -> Settings -> Authorized domains
2. Add your Vercel domain(s), for example:
   - `your-project.vercel.app`
   - custom domain if used

## 6. Verify Deployment

Test these URLs:

- `/`
- `/about`
- `/services`
- `/contact`
- `/posts`
- `/project`
- `/login`
- `/admin/posts`
- `/admin/projects`
- `/rss.xml`
- `/sitemap.xml`

## 7. If You See `404: NOT_FOUND` On Vercel

This is usually alias/domain mapping issue, not code issue.

Do this:

1. `Deployments` -> choose latest `Ready` deployment
2. Click `...` -> `Promote to Production`
3. Open from `Settings -> Domains` (do not use old copied URL)
4. If still 404:
   - `Redeploy`
   - open the new domain from `Domains`
5. If all domains still 404:
   - create a new Vercel project from the same repo
   - set env vars again

## 8. Security Notes

- Never commit `.env.local`
- Rotate leaked API keys (especially `RESEND_API_KEY`)
- Keep `NEXT_PUBLIC_ADMIN_EMAILS` and Firestore admin list synchronized

## 9. Optional: GitHub Actions Note

Current workflow `.github/workflows/deploy.yml` is for GitHub Pages (`next export`).
For this project (has API routes), prefer Vercel deployment only.

