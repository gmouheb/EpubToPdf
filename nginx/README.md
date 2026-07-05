# Nginx Deployment

This directory contains a basic Nginx reverse-proxy config for running the Next.js app behind Nginx in production.

## Assumptions

- The Next.js app runs on `127.0.0.1:3000`.
- Nginx listens publicly on port `80`.
- Uploads can be up to 100 MB, matching the default `MAX_FILE_SIZE_BYTES`.
- HTTPS is handled separately with Certbot, a load balancer, or another TLS setup.

## Install

Copy the config:

```bash
sudo cp nginx/epub-to-pdf.conf /etc/nginx/sites-available/epub-to-pdf
```

Enable it:

```bash
sudo ln -s /etc/nginx/sites-available/epub-to-pdf /etc/nginx/sites-enabled/epub-to-pdf
```

Edit the domain:

```bash
sudo nano /etc/nginx/sites-available/epub-to-pdf
```

Replace:

```nginx
server_name example.com www.example.com;
```

with your real domain.

Test and reload Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Run The App

Build and run the Next.js app:

```bash
npm run build
npm run start
```

For a long-running production process, use a process manager such as `systemd` or `pm2`.

## Important Settings

`client_max_body_size 100m`

Allows EPUB uploads up to 100 MB. If you increase `MAX_FILE_SIZE_BYTES`, increase this too.

`proxy_read_timeout 600s`

Keeps long-running requests stable. Conversion itself happens through the job API, but slow downloads and polling should not be cut off too aggressively.

`proxy_request_buffering on`

Lets Nginx buffer upload bodies before proxying them to Next.js.
