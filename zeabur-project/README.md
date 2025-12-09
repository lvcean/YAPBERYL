# Zeabur Deployment Guide

## 1. Upload to GitHub
Create a new repository on GitHub.
Upload all files in this folder (`server`, `client`, `package.json` etc.) to the repository.

## 2. Deploy on Zeabur
1. Log in to [Zeabur](https://zeabur.com).
2. Create a new **Project**.
3. Click **"Deploy New Service"** -> **"Git"** -> Select your GitHub repository.
4. Zeabur should automatically detect it's a Node.js project.

## 3. Add Database (Required)
1. In your Zeabur Project, click **"Deploy New Service"** again.
2. Select **"Prebuilt"** -> **"MySQL"**.
3. Wait for MySQL to start.
4. Zeabur will automatically inject `MYSQL_HOST`, `MYSQL_PASSWORD` etc. into your Node.js app. You don't need to configure anything!

## 4. Visit Your Site
Click the **"Networking"** or **"Domain"** tab on your Node.js service tile to get your public URL (e.g., `nexus-app.zeabur.app`).
Open this URL on your phone to test!
