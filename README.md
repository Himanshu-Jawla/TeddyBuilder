Teddy Bear Builder 
A lightweight, dependency free web app to design a custom teddy bear using an interactive SVG. Change colors, parts, accessories, stickers, and pose; save/load builds locally; export to PNG; and get smart styling recommendations.

Features
Live SVG preview with smooth animations and hover effects.
Customization controls: colors, eyes/nose/mouth, ear size, patterns, stickers, accessories, pose, and size.
Smart recommendations with one-tap apply.
Save/Load builds (localStorage), Share (Web Share API or JSON copy), and Export PNG at 2× resolution.
Theme toggle with system-aware “auto” mode; accessible modals, focus states, and ARIA labels.
Quick Start
Download or copy the three files into the same folder:
index.html
styles.css
script.js
Open index.html in a modern browser.
Optional: serve locally (better for some browsers’ SVG-to-canvas export).

Python: python -m http.server 8000
Node (npx): npx serve
Bun: bunx serve .
Folder Structure
teddy-bear-builder/
├─ index.html       # App markup and SVG
├─ styles.css       # Theme tokens, layout, and SVG styles
└─ script.js        # State, rendering, actions, recommendations
How It Works (Simple)
The app keeps a single state object in memory and writes it to SVG via class toggles and attributes.
Inputs update the state and re-render specific parts for performance.
Colors flow through CSS variables set on :root.
Recommendations are derived from simple heuristics (e.g., pastel fur => bow + hearts).
Save/Load uses localStorage with small, readable JSON.
Controls Map
Colors: base fur, inner ears, face patch, belly patch, shirt, accessory.
Parts & Styles: show belly patch, ear size, eyes (round/starry/sleepy), mouth (smile/open/uwu), nose (oval/triangle), pattern (solid/spots/heart).
Accessories: bow, scarf, hat, shirt on/off, tee text (max 12), tee font (rounded/script/pixel).
Stickers: hearts, stars, paw, intensity (0–5).
Pose & Size: scale (0.8–1.3), arms (in/out).
Actions
Randomize: Chooses pleasant palettes and safe contrast tee text.
Reset: Returns to defaults.
Export PNG: Renders the SVG to canvas at 2× and downloads a transparent PNG.
Share: Uses the device share sheet when available; otherwise copies JSON to clipboard.
Save/Load: Named slots stored locally with delete and load actions.
Keyboard & Accessibility
All inputs are standard form controls with visible focus styles.
Modals: press Escape to close or click backdrop.
ARIA: live regions announce toasts and suggestions; modals are labeled with aria-modal and role=dialog.
Theming
Auto, light, and dark modes via data-theme on <html>.
User toggle persists to localStorage:
teddy_theme = "light" | "dark".
CSS custom properties drive colors; easily replace theme tokens in :root.
Data Persistence
localStorage keys:
teddy_builds: object of saved builds { [name: string]: State }
teddy_theme: "light" or "dark"
teddy_seen_help: "1" after first visit
State Schema
type State = {
  colors: {
    furBase: string;        // hex
    furSecondary: string;   // hex
    facePatch: string;      // hex
    bellyPatch: string;     // hex
    shirtColor: string;     // hex
    accessoryColor: string; // hex
    shirtTextColor: string; // computed for contrast
  };
  parts: {
    bellyPatchOn: boolean;
    earSize: number;        // 0.8–1.3
    mouthStyle: 'smile' | 'open' | 'uwu';
    eyeStyle: 'round' | 'starry' | 'sleepy';
    noseStyle: 'oval' | 'triangle';
    pattern: 'solid' | 'spots' | 'heart';
  };
  accessories: {
    bow: boolean;
    scarf: boolean;
    hat: boolean;
    shirtOn: boolean;
  };
  text: {
    shirtText: string;      // <= 12 chars
    shirtFont: 'rounded' | 'script' | 'pixel';
  };
  stickers: {
    hearts: boolean;
    stars: boolean;
    paw: boolean;
    intensity: number;      // 0–5
  };
  pose: {
    scale: number;          // 0.8–1.3
    arms: 'in' | 'out';
  };
};
Export PNG Details
Removes bobbing animation for consistency.
Serializes the current SVG to a Blob, draws to a canvas at 2×, then downloads a PNG.
Transparent background retained; ideal for stickers or product mockups.
Recommendations Logic (Summary)
Pastel fur => enable bow + heart stickers with minimum intensity.
Starry eyes => suggest scarf with complementary accessory color.
Tee text set => ensure shirt text contrast is legible.
Spots pattern => suggest adding a hat.
Intensity > 0 but no stickers on => suggest stars.
Browser Support
Modern Chromium, Firefox, and Safari.
For legacy browsers, PNG export may require running from a local server due to Blob URL restrictions.
Customization Guide
Add a new eye style:
Create a new <g id="eyes-myStyle"> in index.html.
Add a <option value="myStyle"> to the eyes <select>.
Update renderParts() to toggle your new group.
Add a new pattern:
Add an SVG group under BODY, hide by default with .hidden.
Toggle in renderParts() based on state.parts.pattern.
Add new stickers:
Extend makeSticker(type, x, y, size) with a new case.
Provide UI toggle and state field if needed.
Deployment
GitHub Pages: push the three files to the main branch and enable Pages.
Netlify/Vercel: drag-and-drop or connect the repo; no build step required.
Any static host works—no server code or dependencies.
Troubleshooting
Export PNG downloads a blank image:
Serve the files via local server (not file:///) due to canvas security.
Missing fonts for “script” or “pixel”:
The app uses generic stacks; supply your own font-face in styles.css if you need exact type.
Nothing saves:
Check if the browser’s storage is disabled or in private mode.
Development Notes
No frameworks; everything is plain HTML/CSS/JS.
Rendering is split into focused functions: renderColors, renderParts, renderAccessories, renderText, renderStickers, renderPose.
Contrast utility (bestTextOn) ensures tee text meets readable contrast.
Roadmap Ideas
Preset gallery with thumbnails.
Export SVG (in addition to PNG).
Multi-language i18n.
Drag-to-place stickers and per-sticker controls.
Download/share snapshot from recommendations panel.
License
Recommended: MIT. Replace with your preferred license.
Example header:
Copyright (c) 2025 YOUR_NAME — Released under the MIT License
Credits
Designed and built with care. You’re free to remix and extend—send a note if you ship something cool!
Summary: Drop the three files into a folder, open index.html, and start customizing your bear. Use Save/Load for versions, Export PNG for images, and the theme toggle to match your system. The code is modular and easy to extend—perfect for a small product demo or a playful onboarding experience.




1

