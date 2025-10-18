# Landing Page – Green Theme (RTL, Tailwind)
- Arabic RTL landing page similar in spirit to makaseb.sa
- Clean hero, subtle animations, KPIs rotation, parallax card, testimonials slider.

## Files
- `index.html` – structure + Tailwind CDN
- `styles.css` – custom animations (hero blobs, reveal, marquee)
- `app.js` – interactions and micro-animations
- `assets/` – (placeholder folder; images are hotlinked from picsum/dummyimage)

## Preview
Open `index.html` directly or run a local server:
```bash
python -m http.server
# then open http://localhost:8000
```

## Customize
- Colors: change Tailwind config in `<head>` (primary/primaryDark).
- Images: replace picsum/dummyimage links with your assets.
- WhatsApp: update link in the Contact section.

## Updates
- **2025-10-16**: Mobile menu now **closes when you tap a link** (and on hash change), with improved accessibility (`aria-expanded`) and body scroll lock on open. If your mobile menu stays open after tapping a section, this fix resolves it.
- To match another site's palette (e.g., TajeerX), change `primary/primaryDark` in the Tailwind config inside `<head>` of `index.html`.
