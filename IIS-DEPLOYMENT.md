# IIS Deployment Guide - Cash Management App

## Prerequisites
1. **IIS Server** with these features enabled:
   - IIS Management Console
   - World Wide Web Services
   - Application Development Features → WebSocket Protocol
   - Application Development Features → ASP.NET 4.8 (or latest)

2. **iisnode** - Install from: https://github.com/azure/iisnode/releases
   - Download and install the latest version (e.g., iisnode-full-v0.2.26-x64.msi)

3. **Node.js** - Install LTS version on the IIS server
   - Download from: https://nodejs.org/

4. **URL Rewrite Module** - Install from: https://www.iis.net/downloads/microsoft/url-rewrite

## Deployment Steps

### Step 1: Prepare Build Files
The build is already complete! Your production files are in the `frontend` folder.

### Step 2: Copy Files to IIS Server
Copy the entire `frontend` folder to your IIS server, for example:
```
C:\inetpub\wwwroot\cashapp-frontend\
```

The important folders/files to copy:
- `.next/` folder (entire build output)
- `public/` folder
- `node_modules/` folder (or run `npm install --production` on server)
- `package.json`
- `next.config.js`
- `web.config`
- `.env.local` (update API URL for production)

### Step 3: Update Environment Variables
Edit `.env.local` on the server with your production API URL:
```
NEXT_PUBLIC_API_URL=http://your-server-ip:53676/api
```

Or if backend is also on IIS:
```
NEXT_PUBLIC_API_URL=http://localhost:53676/api
```

### Step 4: Create IIS Application
1. Open **IIS Manager**
2. Right-click on **Sites** → **Add Website** or add as an **Application** under Default Web Site
3. Configure:
   - **Site name**: CashApp-Frontend
   - **Physical path**: Point to your frontend folder (e.g., `C:\inetpub\wwwroot\cashapp-frontend`)
   - **Port**: Choose a port (e.g., 3000)
   - **Host name**: (optional)

### Step 5: Configure Application Pool
1. In IIS Manager, go to **Application Pools**
2. Find your site's application pool
3. Click **Advanced Settings**
4. Set:
   - **.NET CLR Version**: No Managed Code
   - **Enable 32-Bit Applications**: False
   - **Managed Pipeline Mode**: Integrated
   - **Start Mode**: AlwaysRunning (optional, for better performance)
   - **Identity**: ApplicationPoolIdentity (or custom account with permissions)

### Step 6: Set Folder Permissions
Give IIS_IUSRS permission to the frontend folder:
1. Right-click the frontend folder → **Properties** → **Security**
2. Click **Edit** → **Add**
3. Add `IIS_IUSRS` and `IUSR`
4. Grant **Modify** permissions

### Step 7: Install Node Modules on Server (if needed)
Open PowerShell as Administrator and run:
```powershell
cd C:\inetpub\wwwroot\cashapp-frontend
npm install --production
```

### Step 8: Create server.js Entry Point
The standalone build creates a server. Create a `server.js` file in the root:

```javascript
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = false
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
```

### Step 9: Restart IIS
Open PowerShell as Administrator:
```powershell
iisreset
```

### Step 10: Test Your Deployment
1. Open browser and navigate to: `http://your-server-ip:3000`
2. Check IIS logs if there are issues: `C:\inetpub\logs\LogFiles\`
3. Check iisnode logs: `frontend\iisnode\` folder

## Alternative: Using Reverse Proxy (Recommended)

If you want to run Next.js as a separate Node process and proxy through IIS:

### Step 1: Install PM2 (Process Manager)
```powershell
npm install -g pm2
npm install -g pm2-windows-service
```

### Step 2: Create PM2 Ecosystem File
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'cashapp-frontend',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: 'C:/inetpub/wwwroot/cashapp-frontend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

### Step 3: Start with PM2
```powershell
cd C:\inetpub\wwwroot\cashapp-frontend
pm2 start ecosystem.config.js
pm2 save
pm2-service-install
```

### Step 4: Configure IIS Reverse Proxy
Install Application Request Routing (ARR) module, then update web.config:

```xml
<rewrite>
  <rules>
    <rule name="ReverseProxyInboundRule1" stopProcessing="true">
      <match url="(.*)" />
      <action type="Rewrite" url="http://localhost:3000/{R:1}" />
    </rule>
  </rules>
</rewrite>
```

## Troubleshooting

### Issue: 500 Internal Server Error
- Check Node.js is installed and in PATH
- Check iisnode is installed correctly
- Check application pool settings
- Check folder permissions
- Check iisnode logs in `iisnode` folder

### Issue: Static files not loading
- Verify `public` folder is present
- Check web.config rewrite rules
- Check browser console for 404 errors

### Issue: API calls failing
- Verify `.env.local` has correct API URL
- Check backend API is running
- Check CORS settings on backend

### Issue: Module not found errors
- Run `npm install` on the server
- Check `node_modules` folder exists
- Verify Node.js version matches development

## Performance Tips
1. Enable **Static Content Compression** in IIS
2. Enable **Dynamic Content Compression** in IIS
3. Set appropriate **Cache-Control** headers
4. Use **CDN** for static assets
5. Enable **HTTP/2** if supported

## Security
1. Use **HTTPS** certificate
2. Update `.env.local` with production values
3. Don't expose sensitive information
4. Keep Node.js and dependencies updated
5. Use **Application Request Routing** for better security

## Success! 🎉
Your Cash Management App should now be running on IIS!
