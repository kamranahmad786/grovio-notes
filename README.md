# 📝 Grovio Notes

Grovio Notes is a professional, full-stack Markdown-based note-taking application designed for productivity and seamless user experience. It features real-time split-screen previews, secure multi-user authentication, and advanced note management tools.

<p align="center">
  <img src="./client/public/favicon.png" width="300" alt="Grovio Notes Logo" />
</p>

## 🚀 Features

### Core Features
- **Markdown Editing**: Full support for Markdown syntax with real-time formatting.
- **Split-Screen Preview**: See your rendered notes instantly as you type.
- **Persistent Storage**: All notes are securely saved in a local SQLite database.
- **Full CRUD Operations**: Create, Read, Update, and Delete notes with ease.

### 🌟 Advanced Bonus Features (Implemented)
- **JWT Authentication**: Secure user registration and login flow.
- **Multi-User Support**: Private note isolation—each user only sees their own notes.
- **Version History**: Automatic snapshots on save. Browse and restore previous versions of any note.
- **Tagging System**: Organize notes with custom tags and filter them instantly.
- **Dark & Light Mode**: A sleek, persistent theme toggle to suit your workspace.
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop screens.
- **Debounced Auto-Save**: Saves updates automatically after typing stops, optimizing API performance.
- **Full-Text Search**: Instantly find notes by title, content, or tags.

## 🛠 Tech Stack

- **Frontend**: React.js (Vite), Axios, Lucide React, Lodash (Debounce), CSS Variables.
- **Backend**: Node.js (Express), JSON Web Tokens (JWT), BcryptJS.
- **Database**: SQL (SQLite3) with Knex.js query builder.

## 📂 Project Structure

```text
.
├── client/                 # Frontend React application (Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components (Auth, etc.)
│   │   ├── contexts/       # Auth and Theme state management (JWT & Dark Mode)
│   │   ├── App.jsx         # Main application logic & Note CRUD
│   │   ├── main.jsx        # Entry point with Context Providers
│   │   └── index.css       # Premium Glassmorphic Styling & CSS Variables
│   ├── public/             # Branding assets (Favicon/Logo)
│   └── package.json        # Frontend dependencies
├── server/                 # Backend Node.js application (Express)
│   ├── routes/             # API route handlers (Authentication & Notes)
│   ├── db.js               # Database schema definition & Knex initialization
│   ├── index.js            # Server entry point & JWT Middleware
│   ├── notes.sqlite        # Persistent SQLite database
│   └── package.json        # Backend dependencies
├── package.json            # Root config for starting both Client & Server
└── README.md               # Project documentation
```

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### 1. Clone the repository
```bash
git clone <repository-url>
cd Grovio-AI_assignment
```

### 2. Install Dependencies
Install all dependencies for root, client, and server:
```bash
npm install
cd client && npm install
cd ../server && npm install
cd ..
```

### 3. Environment Variables
The server uses a default `JWT_SECRET` and `PORT` (5001), but you can customize these in a `.env` file in the `server/` directory:
```env
PORT=5001
JWT_SECRET=your-custom-secret-key
```

### 4. Run the Application
Start both the frontend and backend concurrently from the root directory:
```bash
npm run dev
```
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend**: [http://localhost:5001](http://localhost:5001)

## 🎥 Submission Details
- **Developer**: [Kamran Ahmad]
- **Submission Date**: April 13, 2026
- **Live Demo**: [Link to Video/Deployment]

---
*Built with ❤️ as part of the Grovio AI SDE Assignment.*
