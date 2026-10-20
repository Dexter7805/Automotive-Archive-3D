# 190E Archive

A responsive automotive archive with a searchable vehicle collection and separate detail pages. The landing hero uses the supplied looping car video; the dedicated 190E page contains the story, photographs, specifications, and interactive 3D viewer. Mercedes-Benz, BMW, and Mercedes-AMG filters are ready for future entries.

## Run locally on Windows

1. Install Python from [python.org](https://www.python.org/downloads/) if it is not already installed. During setup, enable **Add Python to PATH**.
2. Double-click `start-local.bat`.
3. The site opens at `http://localhost:8000`. Keep the black command window open while using it.

The homepage video, photos, and GLB model are included in `assets`. The 190E 3D viewer uses Three.js and its Draco decoder from jsDelivr, so the 3D viewer needs an internet connection. The 190E photo appears as the hero's fallback poster if the video cannot play.

## Main files

- `index.html` — collection landing page and brand filters
- `mercedes-190e.html` — dedicated 190E story, 3D studio, photos, and specifications
- `styles.css` — responsive visual design
- `main.js` — interactive 3D viewer for the 190E page
- `catalog.js` — collection search, filters, and sorting
- `assets/models/mercedes-190e.glb` — 3D car model
- `assets/images/` — supplied views for the page
- `assets/videos/hero-car.mp4` — supplied looping hero video


Version 8 adds colour controls to every 3D viewer: silver, black, red, blue, and a custom colour picker. The local server uses port 8007.
