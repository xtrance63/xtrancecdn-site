# X-Trance CDN Site (GitHub Pages)

This repo hosts the SPA website for [xtrance.top](https://xtrance.top). It includes:

- Bilingual EN/ZH SPA with pages: Home, Global Nodes, Services, Advantages, Privacy & Security, Scenarios, Cases, Products, Pricing, Docs, User
- Crypto & traditional payment icons on Pricing page
- Service Worker for basic asset caching (offline fallback to `/index.html`)
- Privacy Policy template, robots.txt, and `/.well-known/security.txt`
- GitHub Pages workflow for auto-deploy on push to `main`

## Custom Domain (CNAME)
The `CNAME` file maps the Pages site to `xtrance.top`. After pushing to `main`, open Settings → Pages, set:
- Build and deployment: GitHub Actions
- Custom domain: `xtrance.top` (enforce HTTPS)

## DNS Recommended Records
Create these records at your DNS provider:

- Apex `xtrance.top` → GitHub Pages:
  - Option A (A/AAAA records): 
    - A: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
    - AAAA: 2606:50c0:8000::153, 2606:50c0:8001::153, 2606:50c0:8002::153, 2606:50c0:8003::153
  - Option B (CNAME flattening/ALIAS): CNAME/ALIAS `xtrance63.github.io`
- `www.xtrance.top` → CNAME to `xtrance.top`
- `assets.xtrance.top` → CNAME to `xtrance.top` (optional, can serve as SNI-capable static domain)
- `g9929.xtrance.top` → A `154.64.237.147` (DNS only / no proxy)
- `g4387.xtrance.top` → A `23.184.200.50` (DNS only / no proxy)

> Keep `g9929`/`g4387` as DNS-only (no CDN proxy) to avoid interfering with Reality/gRPC/xhttp.

## Local preview
Serve with a static server so the Service Worker can register:
```bash
npx http-server -p 8080
```

## Deployment
- Push to `main` → GitHub Actions builds and publishes to GitHub Pages.
- First time: Settings → Pages → Build and deployment = GitHub Actions; then set Custom domain.

## Notes
- `/.well-known/security.txt` provides your security contact & policy.
- Update emails and optional PGP fingerprint in `security.txt`.
- You can later split data (i18n/nodes/plans) into JSON for dynamic updates without code changes.
