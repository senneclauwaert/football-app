# Deployment Guide — Toekomst Relegem on Azure B1s

This guide walks through deploying the app from scratch on a fresh Ubuntu 22.04 VM on Azure.
It assumes you know basic Linux commands (cd, nano, sudo) but have not done this before.

---

## 1. Create the Azure VM

1. Log in to the Azure portal at portal.azure.com.
2. Go to "Virtual Machines" and click "Create".
3. Choose:
   - Image: Ubuntu Server 22.04 LTS
   - Size: B1s (1 vCPU, 1 GB RAM) — under "free services" or ~$8/month
   - Authentication: SSH public key (generate one or paste your existing `~/.ssh/id_rsa.pub`)
   - Inbound ports: check SSH (22)
4. After the VM is created, go to its "Networking" section and add two inbound rules:
   - Port 80 (HTTP) — priority 110
   - Port 443 (HTTPS) — priority 120
5. Note the VM's public IP address (shown on the overview page). You will need it in step 3.

---

## 2. SSH into the VM and install Docker

```bash
ssh azureuser@<YOUR_VM_PUBLIC_IP>
```

Install Docker:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Add your user to the docker group so you do not need sudo every time:

```bash
sudo usermod -aG docker $USER
newgrp docker
```

Verify the install:

```bash
docker --version
docker compose version
```

---

## 3. Set up your DuckDNS subdomain

1. Go to https://www.duckdns.org and sign in with Google or GitHub.
2. Create a subdomain, e.g. `footballapprelegem`. You will get `footballapprelegem.duckdns.org`.
3. Set the IP field to your Azure VM public IP and click "update ip".
4. Wait a minute, then confirm DNS resolves:

```bash
nslookup footballapprelegem.duckdns.org
```

It should return your VM's IP.

---

## 4. Clone the repo and create your .env file

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO.git /opt/toekomst-relegem
cd /opt/toekomst-relegem
```

Copy the example env file and fill it in:

```bash
cp .env.example .env
nano .env
```

Set every value:
- `POSTGRES_PASSWORD` — a strong random password (e.g. output of `openssl rand -hex 24`)
- `SECRET_KEY` — a 64-character hex string (e.g. output of `openssl rand -hex 32`)
- `MOLLIE_API_KEY` — from your Mollie dashboard
- `DOMAIN` — `footballapprelegem.duckdns.org` (no https://)

---

## 5. Obtain the SSL certificate (first time only)

Certbot needs port 80 to be reachable and nothing else running on it yet.

Install certbot:

```bash
sudo apt-get install -y certbot
```

Run certbot in standalone mode (it temporarily starts its own web server on port 80):

```bash
sudo certbot certonly --standalone -d footballapprelegem.duckdns.org
```

Follow the prompts. When it succeeds the certificates are written to:

```
/etc/letsencrypt/live/footballapprelegem.duckdns.org/fullchain.pem
/etc/letsencrypt/live/footballapprelegem.duckdns.org/privkey.pem
```

Update `nginx/nginx.conf` — replace every occurrence of `YOUR_DOMAIN` with your actual subdomain:

```bash
sed -i 's/YOUR_DOMAIN/footballapprelegem.duckdns.org/g' nginx/nginx.conf
```

---

## 6. Build and start all services

From `/opt/toekomst-relegem`:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

This builds the backend and the React production bundle (with `VITE_API_URL` baked in), then
starts postgres, backend, frontend, and nginx.

Check that all four containers are running:

```bash
docker compose -f docker-compose.prod.yml ps
```

Check nginx logs if the site does not load:

```bash
docker compose -f docker-compose.prod.yml logs nginx
```

---

## 7. Run database migrations and seed

Apply Alembic migrations:

```bash
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

Optionally seed the database with the admin user, all 13 teams, and sample data:

```bash
docker compose -f docker-compose.prod.yml exec backend python seeder.py
```

The app should now be live at `https://footballapprelegem.duckdns.org`.

---

## 8. Keep DuckDNS up to date (IP auto-update cron)

Azure may reassign the VM's public IP if you stop and start it. This cron job updates DuckDNS
every 5 minutes.

Get your DuckDNS token from the dashboard (shown after login). Then:

```bash
crontab -e
```

Add this line (replace `YOUR_TOKEN` and your subdomain name):

```
*/5 * * * * curl -s "https://www.duckdns.org/update?domains=footballapprelegem&token=YOUR_TOKEN&ip=" > /dev/null 2>&1
```

---

## 9. Automatic SSL certificate renewal

Let's Encrypt certificates expire after 90 days. Set up a cron to renew automatically.

The renewal uses the certbot webroot plugin so nginx can stay running during renewal.
The certbot challenge directory is served by nginx at `/.well-known/acme-challenge/` and
mapped to the `certbot_webroot` Docker volume at `/var/www/certbot`.

Add a renewal cron (runs twice a day, which is the recommended cadence):

```bash
sudo crontab -e
```

Add:

```
0 3,15 * * * certbot renew --webroot -w /var/lib/docker/volumes/toekomst-relegem_certbot_webroot/_data --quiet && docker compose -f /opt/toekomst-relegem/docker-compose.prod.yml exec nginx nginx -s reload
```

Test renewal without actually renewing:

```bash
sudo certbot renew --dry-run
```

---

## Useful commands after go-live

```bash
# View live logs for all services
docker compose -f docker-compose.prod.yml logs -f

# Restart a single service (e.g. after a backend code change)
docker compose -f docker-compose.prod.yml up -d --build backend

# Rebuild the frontend after a code change (re-runs npm run build)
docker compose -f docker-compose.prod.yml up -d --build frontend

# Run a one-off Django-style management command
docker compose -f docker-compose.prod.yml exec backend python seeder.py

# Manually trigger the RBFA scraper
curl -X POST https://footballapprelegem.duckdns.org/api/admin/scraper/run \
  -H "Authorization: Bearer YOUR_ADMIN_JWT"

# Pull latest code and redeploy
git pull
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

---

## Architecture on the VM

```
Internet
   |
  443 / 80
   |
nginx container (nginx:alpine)
   |              |
   /api/*         /*
   |              |
backend:8000   frontend:80
(FastAPI)      (nginx serving
               React build)
   |
  db:5432
(postgres:15)
```

All containers are on the internal `app_network` Docker bridge. Only nginx exposes host ports.
The database and backend are not reachable from outside the VM.
