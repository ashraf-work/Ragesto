# Ragesto.cloud

A full-stack **cloud storage application** that allows users to upload, manage, and share their files securely.  
It includes a **subscription based storage system** powered by **Stripe**, enabling users to upgrade their storage plans smoothly.

The **client** is built with **React**, **Vite**, and **TailwindCSS**, while the **server** uses **Node.js**, **Express**, **MongoDB**, and **Redis**.  
The application stores files using **AWS S3** and also supports **Google Drive Import** for seamless file transfers.


---

## Table of Contents

- [Features](#features)
  - [Authentication and Security](#authentication-and-security)
  - [File Management](#file-management)
  - [Cloud Storage and Import](#cloud-storage-and-import)
  - [Sharing and Permissions](#sharing-and-permissions)
  - [Settings and Customization](#settings-and-customization)
  - [Admin Dashboard](#admin-dashboard)
  - [Subscriptions and Billing](#subscriptions-and-billing)
- [Project Structure](#project-structure)
  - [Client (Frontend - React + Vite + Tailwind)](#client-frontend---react--vite--tailwind)
  - [Server (Backend - Node + Express + MongoDB)](#server-backend---node--express--mongodb)
- [Screenshot Overview](#screenshot-overview)
  - [Login and Register](#login-and-register)
  - [HomePage](#homepage)
  - [Settings](#settings)
  - [Share](#share)
- [Tech Stack](#tech-stack)


---

## Features

### Authentication and Security

- User registration and login with email and password.
- OAuth Login for **Google and GitHub**.
- OTP-based verification for secure account setup.
- Passwords stored in hashed format (bcrypt).
- Token stored in cookies (Signed Cookies).
- CORS, Helmet, and sanitization for enhanced security.
- Rate Limiting and Throttling.

### File Management

- Upload any file (PDF, Images, Videos, Docs, etc.) with progress tracking.
- **Cloud storage with AWS S3** for scalable and reliable file storage.
- Supports **Grid and List views** for file navigation.
- View file details (size, type, created date, modified date).
- Search and filter files easily.
- Rename, delete (soft and hard delete), and recover files.
- Storage usage tracking with cloud-based quota management.

### Cloud Storage and Import

- **AWS S3 Integration** for secure cloud file storage.
- **CloudFront CDN** for fast file delivery and optimized performance.
- **Google Drive Import** - seamlessly import files from Google Drive to your storage.
- Batch import functionality for multiple files.
- Progress tracking for import operations.
- Automatic file type detection and metadata preservation.

### Sharing and Permissions

- Share files via email **(Registered Users Only)**, or direct link **(Guest Users)**.
- Role-based sharing (Viewer / Editor).
- Dashboard to manage **"Shared by Me"** and **"Shared with Me"** files.
- View recent activity logs (shares).
- Real-time permission updates.

### Settings and Customization

- Update profile info (name, email, profile picture).
- Statistic of used/available Storage.
- Change password.
- Manage connected devices/sessions.
- Account Options **(Logout/Disable/Delete)**.

### Admin Dashboard

- User Overview - Track total, active, online, and deleted users.
- User Management - View, filter, edit roles, force logout, and delete users.
- Deletion System - Soft Delete (recoverable) and Hard Delete (permanent) with confirmation.
- Role and Permissions - Roles like User, Manager, Admin, SuperAdmin with badges.
- File Management - Access directories/files with navigation.
- Real-Time Tracking - Monitor online users and refresh instantly.

### Subscriptions and Billing

- Subscription plans with monthly and yearly options.
- Secure payment processing using Stripe Checkout.
- Automatic activation of purchased plans with usage limits updated instantly.
- Webhook based payment verification for reliable status tracking.
- Auto renewal support for recurring subscriptions.
- Manage active plan, upgrade or downgrade, and cancel subscription inside the dashboard.
- Billing history with invoice links.
- Access control based on plan limits such as storage quota, file upload size, and advanced features.

## Project Structure

### Client (Frontend - React + Vite + Tailwind)
```bash
Client/
├── .gitignore
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── vite.config.js
└── src/
    ├── App.jsx                  # Root component
    ├── main.jsx                 # Entry point
    ├── Apis/                    # API request handlers
    │   ├── adminApi.js
    │   ├── authApi.js
    │   ├── axios.js             # Axios instance setup
    │   ├── file_Dir_Api.js
    │   ├── shareApi.js
    │   ├── uploadApi.js
    │   └── userApi.js
    ├── Contexts/                # Global contexts
    │   ├── AuthContext.jsx      # Authentication state
    │   ├── ModalContainer.jsx
    │   ├── ModalContext.jsx     # Modal state management
    │   ├── ProgressContext.jsx  # Upload progress state
    │   └── StorageContext.jsx   # Storage and directory state
    ├── Pages/                   # Application pages
    │   ├── AdminUserView/
    │   ├── AdminViewPage/
    │   ├── DirectoryPage/
    │   ├── SettingsPage/
    │   ├── SubscriptionPage/
    │   └── SharePage/
    ├── Utils/                   # Helper utilities
    ├── components/              # Reusable UI components
    │   ├── Forms/
    │   ├── Modals/
    │   └── ShimmerUI/           # Skeleton loaders
    ├── css/
    │   └── main.css             # Global styles
    ├── hooks/                   # Custom React hooks
    └── routes/                  # Route protection and layouts
        ├── GuestRoutes.jsx
        ├── ProtectedRoutes.jsx
        ├── PublicRoutes.jsx
        └── index.jsx
```

### Server (Backend - Node + Express + MongoDB + AWS)

```bash
Server/
├── app.js                       # Main server file
├── package-lock.json
├── package.json
├── config/                      # Configurations
│   ├── db.js                    # MongoDB connection
│   ├── redis.js                 # Redis client setup
│   └── setup.js                 # Initial setup like environment config
├── controllers/                 # Route controllers
├── middlewares/                 # Middlewares like auth, error handling
├── models/                      # MongoDB schemas
│   ├── dirModel.js
│   ├── fileModel.js
│   ├── otpModel.js
│   └── userModel.js 
├── routes/                      # API routes
│   ├── authRoutes.js
│   ├── dirRoutes.js
│   ├── fileRoutes.js
│   ├── guestRoutes.js
│   ├── otpRoutes.js
│   └── userRoutes.js
├── services/                    # Business logic
│   ├── index.js
│   ├── otpService.js
│   ├── Directory/               # Directory related operations
│   ├── auth/                    # Auth related logic
│   ├── file/                    # File handling logic
│   ├── subscription/            # Subscription handling logic
│   └── user/                    # User specific logic
├── utils/                       # Helper utilities
└── validators/                  # Input validation logic
```


## Screenshot Overview

### Login and Register

<p align="center">
  <img src="docs/ScreenShots/Login & Register/Login.png" alt="Login" width="45%" />
  <img src="docs/ScreenShots/Login & Register/Register.png" alt="Register" width="45%" />
  <img src="docs/ScreenShots/Login & Register/opt.png" alt="OTP" width="45%" />
</p>

---

### HomePage

<p align="center">
  <img src="docs/ScreenShots/HomePage/Screenshot from 2026-06-10 10-24-50.png" alt="Homepage" width="45%" />
  <img src="docs/ScreenShots/HomePage/Screenshot from 2026-06-10 10-27-10.png" alt="Upload Progress" width="45%" />
  <img src="docs/ScreenShots/HomePage/Screenshot from 2026-06-10 10-27-52.png" alt="Grid View" width="45%" />
  <img src="docs/ScreenShots/HomePage/Screenshot from 2026-06-10 10-28-36.png" alt="Detail Modal" width="45%" />
  <img src="docs/ScreenShots/HomePage/Screenshot from 2026-06-10 10-38-09.png" alt="Dropdown" width="45%" />
</p>

---

### Settings

<p align="center">
  <img src="docs/ScreenShots/Settings/Screenshot from 2026-06-10 10-36-25.png" alt="Settings 1" width="45%" />
  <img src="docs/ScreenShots/Settings/Screenshot from 2026-06-10 10-36-36.png" alt="Settings 2" width="45%" />
  <img src="docs/ScreenShots/Settings/Screenshot from 2026-06-10 10-36-47.png" alt="Settings 3" width="45%" />
</p>

---

### Subscriptions (Stripe)

<p align="center">
  <img src="docs/ScreenShots/Subscription/Screenshot from 2026-06-10 10-34-36.png" alt="Subscription" width="45%" />
  <img src="docs/ScreenShots/Subscription/Screenshot from 2026-06-10 10-35-13.png" alt="Subscription" width="45%" />
</p>

### Admin Dashboard

<p align="center">
  <img src="docs/ScreenShots/Admin/Screenshot from 2026-06-10 10-09-30.png" alt="Dashboard" width="45%" />
  <img src="docs/ScreenShots/Admin/Screenshot from 2026-06-10 10-10-44.png" alt="Online Users" width="45%" />
  <img src="docs/ScreenShots/Admin/Screenshot from 2026-06-10 10-11-13.png" alt="Hard-soft-delete" width="45%" />
  <img src="docs/ScreenShots/Admin/Screenshot from 2026-06-10 10-11-33.png" alt="View Directory" width="45%" />
</p>

### Import from Drive

<p align="center">
  <img src="docs/ScreenShots/GoogleDrive/Screenshot from 2026-06-10 10-13-37.png" alt="SelectFiles" width="45%" />
  <img src="docs/ScreenShots/GoogleDrive/Screenshot from 2026-06-10 10-15-35.png" alt="Upload Progress" width="45%" />
  <img src="docs/ScreenShots/GoogleDrive/Screenshot from 2026-06-10 10-15-00.png" alt="Upload Complete" width="45%" />
</p>

---

## Tech Stack

- **Frontend**: React, TailwindCSS, Vite
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Redis
- **Cloud Storage**: AWS S3, CloudFront CDN
- **External APIs**: Google Drive API, Google OAuth2
- **Authentication**: Bcrypt + OTP + OAuth (Google/GitHub)
- **Payment**: Stripe Subscriptions + Webhooks