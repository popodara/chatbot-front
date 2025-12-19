 Project Setup Guide

Prerequisites
Node.js v16 or higher

npm (comes with Node.js)

Quick Start

1. Install Dependencies


npm install --force

2. Start Development Server

npm run dev

3. Open in Browser
Go to http://localhost:9141 (check terminal for exact URL)

🔧 Troubleshooting
If installation fails:


rm -rf node_modules package-lock.json
npm cache clean --force
npm install --force
If dev server fails:

Verify Node.js version: node --version

Check for port conflicts

Ensure all dependencies installed correctly

Available Scripts

npm run dev - Start dev server

npm run build - Production build

Note: --force flag is required due to specific dependency constraints in this project.