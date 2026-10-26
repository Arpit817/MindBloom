# MindBloom: MongoDB Atlas & AWS S3 Setup Guide

This guide walks you through setting up your free **MongoDB Atlas** database cluster and **AWS S3** bucket (with 5 GB free tier) for MindBloom.

---

## 1. MongoDB Atlas Setup (Free M0 Cluster)

### Step 1: Create an Account & Cluster
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign up / log in.
2. Click **Create** to deploy a new database:
   - Select the **M0 Free** tier (Shared, 512 MB storage, ₹0 cost).
   - Provider & Region: Choose AWS and a region closest to your users (e.g., `AWS / ap-south-1 (Mumbai)` or `us-east-1`).
   - Name your cluster (e.g., `MindBloomCluster`) and click **Create Deployment**.

### Step 2: Create a Database User
1. In the security quick-start screen (or under **Security > Database Access**):
   - Choose **Username and Password** authentication.
   - Enter a username (e.g. `mindbloom_admin`) and a strong password.
   - *Save this password — you will need it in your connection string.*

### Step 3: Configure Network Access (IP Whitelist)
1. In the left navigation, click **Network Access**.
2. Click **Add IP Address**.
3. Select **Allow Access from Anywhere** (`0.0.0.0/0`) so your local development and Vercel production deployment can connect.
4. Click **Confirm**.

### Step 4: Copy the Connection String
1. Under **Database > Clusters**, click **Connect**.
2. Select **Drivers** (Node.js).
3. Copy the connection string format:
   ```text
   mongodb+srv://<username>:<password>@mindbloomcluster.xxxx.mongodb.net/mindbloom?retryWrites=true&w=majority
   ```
4. Replace `<username>` and `<password>` with the database user credentials you created in Step 2.
5. In your `.env.local`, set:
   ```env
   MONGODB_URI=mongodb+srv://mindbloom_admin:YourPassword@mindbloomcluster.xxxx.mongodb.net/mindbloom?retryWrites=true&w=majority
   ```

---

## 2. AWS S3 Setup (5 GB Free Tier for Photo Notes)

AWS S3 offers 5 GB of standard storage for free under the 12-month free tier.

### Step 1: Create an S3 Bucket
1. Open the [AWS Console](https://console.aws.amazon.com/) and navigate to **S3**.
2. Click **Create bucket**:
   - **Bucket name**: Choose a globally unique name, e.g., `mindbloom-notes-yourname`.
   - **AWS Region**: Select the region closest to you (e.g., `us-east-1` or `ap-south-1`).
   - **Block Public Access**: Keep **"Block all public access"** checked! (Our app uses secure presigned URLs, so public access is not needed).
   - Click **Create bucket**.

### Step 2: Configure CORS on the Bucket
To allow your browser to upload images directly to S3 via presigned URLs:
1. Click on your newly created bucket name.
2. Go to the **Permissions** tab.
3. Scroll down to **Cross-origin resource sharing (CORS)** and click **Edit**.
4. Paste the following JSON configuration and click **Save changes**:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "HEAD"],
       "AllowedOrigins": [
         "http://localhost:3000",
         "https://*.vercel.app"
       ],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```

### Step 3: Create IAM Credentials
1. In the AWS Console search bar, type **IAM** and select it.
2. In the left sidebar, click **Users** > **Create user**.
3. Username: `mindbloom-app-user`. Click **Next**.
4. Set permissions: Select **Attach policies directly**.
5. Search for `AmazonS3FullAccess` (or create a custom policy scoped to your bucket). Check the box and click **Next** > **Create user**.
6. Click on the newly created user `mindbloom-app-user`.
7. Go to the **Security credentials** tab.
8. Scroll to **Access keys** and click **Create access key**.
9. Select **Application running outside AWS** > **Next** > **Create access key**.
10. Copy your **Access Key ID** and **Secret Access Key**.

---

## 3. Configuring `.env.local`

Create a file named `.env.local` inside the `MindBloom` folder:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/mindbloom?retryWrites=true&w=majority

# JWT Authentication (generate any random string 32+ characters long)
JWT_SECRET=super_secret_jwt_random_key_mindbloom_2026_secure

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET_NAME=mindbloom-notes-yourname

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 4. Models Overview

MindBloom organizes all student revision data across 10 Mongoose models in `src/models/`:

1. **`User`** — Account details, email, hashed password.
2. **`Subject`** — Colour-coded subject tags (e.g. *Biology*, *Calculus*).
3. **`Note`** — Note title, content, review stage (0–4), freshness score (0–100), next review date.
4. **`NoteImage`** — S3 keys, file metadata, and order for up to 10 photos per note.
5. **`Question`** — Active recall question-answer cards.
6. **`ReviewSession`** — Review log tracking whether the card was remembered, partial, or forgotten.
7. **`LearningResource`** — YouTube videos/playlists or documentation links.
8. **`LearningPlan`** — Day-wise, step-wise, or custom study plans.
9. **`LearningPlanItem`** — Actionable steps/tasks inside a plan.
10. **`ActivityLog`** — Audit trail for streak tracking and revision heatmaps.
