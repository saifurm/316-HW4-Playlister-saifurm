# 🔒 Playlister App (Secure Web Application)

## Overview
A full-stack **secure playlist management web app** built with **React, Node.js, MongoDB, PostgreSQL, and Material UI** for  
**CSE 316 – Fundamentals of Software Development (Fall 2025)**.

This assignment focuses on backend redesign, database abstraction, and security features such as authentication and environment-based configuration.

## Features
- User accounts with authentication and session management  
- Dual database support: **MongoDB** and **PostgreSQL** via custom DatabaseManager classes  
- **.env configuration** for database selection and credentials  
- Replaced **Axios** with native **Fetch API** for all client requests  
- **Unit testing** using Vitest for database operations  
- Preloaded sample users and playlists via reset scripts  
- Styled with **Material UI** for responsive design  

## Run
```bash
cd client && npm install
cd ../server && npm install
npm run dev
