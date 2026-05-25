# CasaOS Tutorial: Installing Your Wedding Invitation App

This guide will help you install your custom Wedding Invitation app on your personal server using **CasaOS**.

## 1. Export Your Project
1. In AI Studio, click on the **Settings** (gear icon) in the top-right menu.
2. Select **Export as ZIP**.
3. Download the ZIP file to your computer.

## 2. Transfer to Your Server
1. Open your CasaOS dashboard.
2. Open the **Files** app.
3. Create a folder (e.g., `/DATA/AppData/wedding-invitation`).
4. Upload the ZIP file and extract it there.

## 3. Build the Application
Since this is a React app, it needs to be "built" into static files.
*Note: You need Node.js installed on your Debian server.*

1. Connect to your server via SSH.
2. Navigate to the app folder:
   ```bash
   cd /DATA/AppData/wedding-invitation
   ```
3. Install dependencies and build:
   ```bash
   npm install
   npm run build
   ```
This will create a `dist` folder.

## 4. Run on CasaOS (The Easy Way)
The best way to serve the app is using **Nginx**.

1. In CasaOS, go to the **App Store**.
2. Install **Nginx Proxy Manager** or a simple **Nginx** container.
3. Alternatively, use the **Custom Install** feature in CasaOS:
   * **Docker Image**: `nginx:alpine`
   * **Volume Mapping**: Map `/DATA/AppData/wedding-invitation/dist` to `/usr/share/nginx/html`.
   * **Port**: Map `80` to any available port on your server (e.g., `8080`).

## 5. Dockerfile Option (Advanced)
If you prefer Docker, you can use this `Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Then in CasaOS, you can use `docker build -t my-wedding-app .` and run it as a custom container.

---
**Happy Wedding!** 🥂
