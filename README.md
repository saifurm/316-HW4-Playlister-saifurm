# 🔒 Playlister App (Secure Web Application)

## Overview
A full-stack secure playlist management web app built with **React, Node.js, MongoDB, PostgreSQL, and Material UI** for  
**CSE 316 – Fundamentals of Software Development (Fall 2025)**.  

This assignment focuses on backend redesign, database abstraction, environment configuration, and secure authentication.

## 🧩 Features
- User accounts with authentication and session management  
- Dual database support: **MongoDB** and **PostgreSQL** via custom `DatabaseManager` classes  
- `.env` configuration for credentials and database selection  
- Switched from **Axios** to native **Fetch API**  
- Unit testing with **Vitest** for database operations  
- Preloaded users and playlists using reset scripts  
- Responsive UI styled with **Material UI**

## ⚙️ Tech Stack
- **Frontend:** React, Material UI  
- **Backend:** Node.js, Express  
- **Databases:** MongoDB (Mongoose), PostgreSQL (Sequelize)  
- **Testing:** Vitest  
- **Environment Config:** dotenv  

## 🚀 Run
```bash
cd client && npm install
cd ../server && npm install
npm run dev
