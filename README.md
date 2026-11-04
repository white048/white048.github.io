# white048.github.io

Personal portfolio of Dong Yijun 董一均 — game design & development.

The homepage is a 3D library tower ("Spiral Archive") climbed by scrolling, with a plain-page mode for phones, reduced-motion settings and no-WebGL browsers. Everything 3D is generated in code; there are no model files.

- `index.html` — all page content, Chinese and English side by side
- `js/scene.js` — the Three.js tower (scroll-driven camera, posters, paper post-processing)
- `js/floors.js` — which pictures hang on each floor, and the commissioned poster art (`ASSETS`, files in `assets/posters/`)
- `js/placeholders.js` — generated, titled posters for any art not yet delivered, and the shared palette
- `js/main.js` — language, 3D/plain mode, captions, side panels, lightbox
- `vendor/three/`, `fonts/` — self-hosted so the site loads without third-party CDNs
- `games/token-forge/` — Token Forge, a three-station browser game about tokenisation, attention and sampling (plain HTML/CSS/JS)

No build step: GitHub Pages serves the files as they are. To preview locally, serve the folder (for example `python -m http.server`) rather than opening the file directly, because ES modules do not load over `file://`.
