// Teddy Bear Builder — Vanilla JS
(() => {
  const $ = (sel, parent = document) => parent.querySelector(sel);
  const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

  // Default state
  const defaultState = {
    colors: {
      furBase: '#C9A27F',
      furSecondary: '#E5C8A1',
      facePatch: '#F6E2C8',
      bellyPatch: '#F6E2C8',
      shirtColor: '#FFFFFF',
      accessoryColor: '#FF6B6B',
      shirtTextColor: '#222', // auto set based on contrast
    },
    parts: {
      bellyPatchOn: true,
      earSize: 1.0, // 0.8–1.3
      mouthStyle: 'smile', // smile | open | uwu
      eyeStyle: 'round',   // round | starry | sleepy
      noseStyle: 'oval',   // oval | triangle
      pattern: 'solid',    // solid | spots | heart
    },
    accessories: {
      bow: true,
      scarf: false,
      hat: false,
      shirtOn: true,
    },
    text: {
      shirtText: 'HUGS',
      shirtFont: 'rounded', // rounded | script | pixel
    },
    stickers: {
      hearts: true,
      stars: false,
      paw: false,
      intensity: 2, // 0–5
    },
    pose: {
      scale: 1.0, // 0.8–1.3
      arms: 'in', // in | out
    }
  };

  let state = deepClone(defaultState);

  // DOM refs
  const root = document.documentElement;

  const ids = {
    // Colors
    fur: '#color-fur',
    inner: '#color-inner',
    face: '#color-face',
    belly: '#color-belly',
    shirt: '#color-shirt',
    accessory: '#color-accessory',
    // Parts
    bellyToggle: '#toggle-belly',
    earSize: '#ear-size',
    mouth: '#mouth-style',
    eyes: '#eye-style',
    nose: '#nose-style',
    pattern: '#pattern-style',
    // Accessories
    bow: '#acc-bow',
    scarf: '#acc-scarf',
    hat: '#acc-hat',
    shirtOn: '#acc-shirt',
    shirtText: '#shirt-text',
    shirtFont: '#shirt-font',
    // Stickers
    stickerHearts: '#sticker-hearts',
    stickerStars: '#sticker-stars',
    stickerPaw: '#sticker-paw',
    stickerIntensity: '#sticker-intensity',
    // Pose & size
    scale: '#size-scale',
    poseRadios: 'input[name="pose"]',
    // Actions
    randomize: '#btn-randomize',
    reset: '#btn-reset',
    export: '#btn-export',
    share: '#btn-share',
    cart: '#btn-cart',
    // Theme
    themeToggle: '#theme-toggle',
    // Header modals
    btnSave: '#btn-save',
    btnLoad: '#btn-load',
    btnHelp: '#btn-help',
    modalSave: '#modal-save',
    modalLoad: '#modal-load',
    modalHelp: '#modal-help',
    saveName: '#save-name',
    saveConfirm: '#save-confirm',
    loadList: '#load-list',
    // Recs
    chips: '#chips',
    applyAll: '#apply-all',
    // Summary & toasts
    summary: '#build-summary',
    toasts: '#toast-region',
    // SVG groups
    teddyRoot: '#teddy-root',
    bellyGroup: '#belly',
    eyesRound: '#eyes-round',
    eyesStarry: '#eyes-starry',
    eyesSleepy: '#eyes-sleepy',
    noseOval: '#nose-oval',
    noseTriangle: '#nose-triangle',
    mouthSmile: '#mouth-smile',
    mouthOpen: '#mouth-open',
    mouthUwU: '#mouth-uwu',
    patternSpots: '#pattern-spots',
    patternHeart: '#pattern-heart',
    bowGroup: '#accessory-bow',
    scarfGroup: '#accessory-scarf',
    hatGroup: '#accessory-hat',
    shirtGroup: '#shirt-group',
    shirtTextNode: '#shirt-text-node',
    earLeft: '#ear-left',
    earRight: '#ear-right',
    armsGroup: '#arms',
    armLeft: '#arm-left ellipse',
    armRight: '#arm-right ellipse',
    stickers: '#stickers',
  };

  // Init
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    bindControls();
    renderAll();
    openHelpOnFirstVisit();
  });

  function deepClone(o) { return JSON.parse(JSON.stringify(o)); }

  /* THEME */
  function initTheme() {
    const saved = localStorage.getItem('teddy_theme');
    if (saved === 'light' || saved === 'dark') {
      root.setAttribute('data-theme', saved);
      $(ids.themeToggle).checked = saved === 'dark';
    } else {
      // auto: reflect prefers-color-scheme; we keep toggle off by default
      root.setAttribute('data-theme', 'auto');
      $(ids.themeToggle).checked = false;
    }
    $(ids.themeToggle).addEventListener('change', e => {
      const on = e.currentTarget.checked;
      const theme = on ? 'dark' : 'light';
      root.setAttribute('data-theme', theme);
      localStorage.setItem('teddy_theme', theme);
      toast(`Theme: ${theme}`);
    });
  }

  /* BIND CONTROLS */
  function bindControls() {
    // Colors
    $(ids.fur).addEventListener('input', e => { state.colors.furBase = e.target.value; renderColors(); updateRecs(); summarize(); });
    $(ids.inner).addEventListener('input', e => { state.colors.furSecondary = e.target.value; renderColors(); summarize(); });
    $(ids.face).addEventListener('input', e => { state.colors.facePatch = e.target.value; renderColors(); summarize(); });
    $(ids.belly).addEventListener('input', e => { state.colors.bellyPatch = e.target.value; renderColors(); summarize(); });
    $(ids.shirt).addEventListener('input', e => { state.colors.shirtColor = e.target.value; renderColors(); summarize(); });
    $(ids.accessory).addEventListener('input', e => { state.colors.accessoryColor = e.target.value; renderColors(); updateRecs(); summarize(); });

    // Parts
    $(ids.bellyToggle).addEventListener('change', e => { state.parts.bellyPatchOn = e.target.checked; renderParts(); summarize(); });
    $(ids.earSize).addEventListener('input', e => { state.parts.earSize = parseFloat(e.target.value); renderParts(); summarize(); });
    $(ids.mouth).addEventListener('change', e => { state.parts.mouthStyle = e.target.value; renderParts(); summarize(); });
    $(ids.eyes).addEventListener('change', e => { state.parts.eyeStyle = e.target.value; renderParts(); updateRecs(); summarize(); });
    $(ids.nose).addEventListener('change', e => { state.parts.noseStyle = e.target.value; renderParts(); summarize(); });
    $(ids.pattern).addEventListener('change', e => { state.parts.pattern = e.target.value; renderParts(); updateRecs(); summarize(); });

    // Accessories
    $(ids.bow).addEventListener('change', e => { state.accessories.bow = e.target.checked; renderAccessories(); summarize(); });
    $(ids.scarf).addEventListener('change', e => { state.accessories.scarf = e.target.checked; renderAccessories(); summarize(); });
    $(ids.hat).addEventListener('change', e => { state.accessories.hat = e.target.checked; renderAccessories(); summarize(); });
    $(ids.shirtOn).addEventListener('change', e => { state.accessories.shirtOn = e.target.checked; renderAccessories(); summarize(); });
    $(ids.shirtText).addEventListener('input', e => { state.text.shirtText = e.target.value.slice(0, 12); renderText(); updateRecs(); summarize(); });
    $(ids.shirtFont).addEventListener('change', e => { state.text.shirtFont = e.target.value; renderText(); summarize(); });

    // Stickers
    $(ids.stickerHearts).addEventListener('change', e => { state.stickers.hearts = e.target.checked; renderStickers(); updateRecs(); summarize(); });
    $(ids.stickerStars).addEventListener('change', e => { state.stickers.stars = e.target.checked; renderStickers(); summarize(); });
    $(ids.stickerPaw).addEventListener('change', e => { state.stickers.paw = e.target.checked; renderStickers(); summarize(); });
    $(ids.stickerIntensity).addEventListener('input', e => { state.stickers.intensity = parseInt(e.target.value, 10); renderStickers(); summarize(); });

    // Pose & size
    $(ids.scale).addEventListener('input', e => { state.pose.scale = parseFloat(e.target.value); renderPose(); summarize(); });
    $$(ids.poseRadios).forEach(r => r.addEventListener('change', e => {
      if (e.target.checked) { state.pose.arms = e.target.value; renderPose(); summarize(); }
    }));

    // Actions
    $(ids.randomize).addEventListener('click', () => { randomize(); renderAll(); toast('Randomized!'); });
    $(ids.reset).addEventListener('click', () => { state = deepClone(defaultState); syncFormFromState(); renderAll(); toast('Reset to default'); });
    $(ids.export).addEventListener('click', exportPNG);
    $(ids.share).addEventListener('click', shareBuild);
    $(ids.cart).addEventListener('click', () => toast('Demo: added to cart 🐻'));

    // Modals
    $(ids.btnSave).addEventListener('click', () => openModal(ids.modalSave));
    $(ids.btnLoad).addEventListener('click', () => { openModal(ids.modalLoad); renderLoadList(); });
    $(ids.btnHelp).addEventListener('click', () => openModal(ids.modalHelp));
    $$('[data-close]').forEach(btn => btn.addEventListener('click', (e) => closeModal(e.currentTarget.getAttribute('data-close'))));
    $(ids.saveConfirm).addEventListener('click', saveCurrentBuild);

    // Recs
    $(ids.applyAll).addEventListener('click', () => { const recs = generateRecommendations(state); recs.forEach(r => r.apply(state)); renderAll(); toast('Applied all suggestions'); });
  }

  function renderAll() {
    syncFormFromState(); // ensures UI matches state when loading or randomizing
    renderColors();
    renderParts();
    renderAccessories();
    renderText();
    renderStickers();
    renderPose();
    updateRecs();
    summarize();
  }

  function syncFormFromState() {
    // Colors
    $(ids.fur).value = state.colors.furBase;
    $(ids.inner).value = state.colors.furSecondary;
    $(ids.face).value = state.colors.facePatch;
    $(ids.belly).value = state.colors.bellyPatch;
    $(ids.shirt).value = state.colors.shirtColor;
    $(ids.accessory).value = state.colors.accessoryColor;
    // Parts
    $(ids.bellyToggle).checked = state.parts.bellyPatchOn;
    $(ids.earSize).value = String(state.parts.earSize);
    $(ids.mouth).value = state.parts.mouthStyle;
    $(ids.eyes).value = state.parts.eyeStyle;
    $(ids.nose).value = state.parts.noseStyle;
    $(ids.pattern).value = state.parts.pattern;
    // Accessories
    $(ids.bow).checked = state.accessories.bow;
    $(ids.scarf).checked = state.accessories.scarf;
    $(ids.hat).checked = state.accessories.hat;
    $(ids.shirtOn).checked = state.accessories.shirtOn;
    $(ids.shirtText).value = state.text.shirtText;
    $(ids.shirtFont).value = state.text.shirtFont;
    // Stickers
    $(ids.stickerHearts).checked = state.stickers.hearts;
    $(ids.stickerStars).checked = state.stickers.stars;
    $(ids.stickerPaw).checked = state.stickers.paw;
    $(ids.stickerIntensity).value = String(state.stickers.intensity);
    // Pose & size
    $(ids.scale).value = String(state.pose.scale);
    $$(ids.poseRadios).forEach(r => r.checked = (r.value === state.pose.arms));
  }

  /* RENDER: Colors */
  function renderColors() {
    const c = state.colors;
    root.style.setProperty('--fur-base', c.furBase);
    root.style.setProperty('--fur-secondary', c.furSecondary);
    root.style.setProperty('--face-patch', c.facePatch);
    root.style.setProperty('--belly-patch', c.bellyPatch);
    root.style.setProperty('--shirt-color', c.shirtColor);
    root.style.setProperty('--accessory-color', c.accessoryColor);

    // Auto set shirt text color for contrast
    const txt = bestTextOn(c.shirtColor);
    state.colors.shirtTextColor = txt;
    root.style.setProperty('--shirt-text-color', txt);
  }

  /* RENDER: Parts (eyes, nose, mouth, belly, patterns, ears) */
  function renderParts() {
    // Belly
    toggle($(ids.bellyGroup), state.parts.bellyPatchOn);

    // Eyes
    showOnly([
      { node: $(ids.eyesRound), on: state.parts.eyeStyle === 'round' },
      { node: $(ids.eyesStarry), on: state.parts.eyeStyle === 'starry' },
      { node: $(ids.eyesSleepy), on: state.parts.eyeStyle === 'sleepy' }
    ]);

    // Nose
    showOnly([
      { node: $(ids.noseOval), on: state.parts.noseStyle === 'oval' },
      { node: $(ids.noseTriangle), on: state.parts.noseStyle === 'triangle' }
    ]);

    // Mouth
    showOnly([
      { node: $(ids.mouthSmile), on: state.parts.mouthStyle === 'smile' },
      { node: $(ids.mouthOpen), on: state.parts.mouthStyle === 'open' },
      { node: $(ids.mouthUwU), on: state.parts.mouthStyle === 'uwu' }
    ]);

    // Pattern
    $('#pattern-spots').classList.toggle('hidden', state.parts.pattern !== 'spots');
    $('#pattern-heart').classList.toggle('hidden', state.parts.pattern !== 'heart');

    // Ear size
    setEarScale(state.parts.earSize);
  }

  function setEarScale(scale) {
    // Maintain original translation, apply scale afterwards
    $('#ear-left').setAttribute('transform', `translate(112,104) scale(${scale})`);
    $('#ear-right').setAttribute('transform', `translate(208,104) scale(${scale})`);
  }

  /* RENDER: Accessories & Shirt visibility */
  function renderAccessories() {
    $(ids.bowGroup).classList.toggle('hidden', !state.accessories.bow);
    $(ids.scarfGroup).classList.toggle('hidden', !state.accessories.scarf);
    $(ids.hatGroup).classList.toggle('hidden', !state.accessories.hat);
    $(ids.shirtGroup).classList.toggle('hidden', !state.accessories.shirtOn);
  }

  /* RENDER: Shirt text + font */
  function renderText() {
    const textNode = $(ids.shirtTextNode);
    const t = (state.text.shirtText || '').slice(0, 12);
    textNode.textContent = t || '';
    let ff = 'ui-rounded, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial';
    if (state.text.shirtFont === 'script') {
      ff = 'cursive, "Comic Sans MS", "Brush Script MT", system-ui';
    } else if (state.text.shirtFont === 'pixel') {
      ff = '"Courier New", monospace';
    }
    textNode.setAttribute('style', `font-size:16px; font-weight:700; font-family:${ff}; fill: var(--shirt-text-color)`);
  }

  /* RENDER: Stickers */
  function renderStickers() {
    const g = $(ids.stickers);
    g.innerHTML = '';
    const N = clamp(state.stickers.intensity, 0, 5);
    if (N === 0) return;

    let items = [];
    if (state.stickers.hearts) items.push('heart');
    if (state.stickers.stars) items.push('star');
    if (state.stickers.paw) items.push('paw');
    if (!items.length) return;

    // Distribute around belly
    const centerX = 160, centerY = 240;
    const radius = 36;
    for (let i = 0; i < N; i++) {
      const angle = (i / N) * Math.PI * 2 + (Math.random() * 0.7 - 0.35);
      const r = radius + (Math.random() * 8 - 4);
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      const type = items[i % items.length];
      const node = makeSticker(type, x, y, 8 + Math.random() * 5);
      g.appendChild(node);
    }
  }

  function makeSticker(type, x, y, size) {
    const ns = 'http://www.w3.org/2000/svg';
    let el;
    if (type === 'heart') {
      el = document.createElementNS(ns, 'path');
      el.setAttribute('d', `M ${x} ${y} c ${size*0.9} -${size*0.9}, ${size*2.1} ${size*0.4}, 0 ${size*2.1} c -${size*2.1} -${size*1.6}, -${size*0.9} -${size*3}, 0 -${size*2.1} z`);
      el.setAttribute('fill', 'rgba(255,107,107,0.55)');
    } else if (type === 'star') {
      el = document.createElementNS(ns, 'path');
      const p = starPath(x, y, size, size * 0.5, 5);
      el.setAttribute('d', p);
      el.setAttribute('fill', 'rgba(255, 221, 87, 0.7)');
    } else {
      // paw (circle + small toes)
      el = document.createElementNS(ns, 'g');
      const pad = document.createElementNS(ns, 'circle');
      pad.setAttribute('cx', x); pad.setAttribute('cy', y); pad.setAttribute('r', size * 0.7);
      pad.setAttribute('fill', 'rgba(0,0,0,0.12)');
      el.appendChild(pad);
      const toes = 3;
      for (let i = 0; i < toes; i++) {
        const toe = document.createElementNS(ns, 'circle');
        const ang = (-Math.PI / 3) + (i / (toes-1)) * (Math.PI / 1.5);
        toe.setAttribute('cx', x + Math.cos(ang) * (size * 1.1));
        toe.setAttribute('cy', y - size * 0.8 + Math.sin(ang) * (size * 0.8));
        toe.setAttribute('r', size * 0.25);
        toe.setAttribute('fill', 'rgba(0,0,0,0.12)');
        el.appendChild(toe);
      }
    }
    return el;
  }

  function starPath(cx, cy, rOuter, rInner, points) {
    let d = '';
    for (let i = 0; i < points * 2; i++) {
      const angle = (Math.PI / points) * i - Math.PI / 2;
      const r = i % 2 === 0 ? rOuter : rInner;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      d += (i === 0 ? 'M' : 'L') + x + ' ' + y + ' ';
    }
    return d + 'Z';
  }

  /* RENDER: Pose & scale (arms) */
  function renderPose() {
    // Scale around center (160,190)
    const s = state.pose.scale;
    $('#teddy-root').setAttribute('transform', `translate(160 190) scale(${s}) translate(-160 -190)`);

    // Arms
    const left = $(ids.armLeft);
    const right = $(ids.armRight);
    if (state.pose.arms === 'out') {
      left.setAttribute('transform', 'rotate(-35 104 220) translate(-6 -4)');
      right.setAttribute('transform', 'rotate(35 216 220) translate(6 -4)');
    } else {
      left.setAttribute('transform', 'rotate(-18 104 220)');
      right.setAttribute('transform', 'rotate(18 216 220)');
    }
  }

  /* RECOMMENDATIONS */
  function generateRecommendations(s) {
    const recs = [];
    // Pastel fur -> bow or hearts
    if (isPastel(s.colors.furBase)) {
      recs.push({
        id: 'pastel-bow-hearts',
        title: 'Lean into pastel sweetness',
        rationale: 'Pastel fur pairs well with a bow and heart stickers.',
        apply: (st) => { st.accessories.bow = true; st.stickers.hearts = true; st.stickers.intensity = Math.max(st.stickers.intensity, 2); }
      });
    }
    // Starry eyes -> scarf with complementary color
    if (s.parts.eyeStyle === 'starry' && !s.accessories.scarf) {
      const comp = complement(s.colors.accessoryColor);
      recs.push({
        id: 'starry-scarf',
        title: 'Add a scarf with pop',
        rationale: 'Starry eyes love contrast—try a complementary scarf color.',
        apply: (st) => { st.accessories.scarf = true; st.colors.accessoryColor = comp; }
      });
    }
    // Shirt text set -> match accessory
    if ((s.text.shirtText || '').trim().length >= 3) {
      recs.push({
        id: 'match-accessory',
        title: 'Match tee with accessory',
        rationale: 'Coordinated colors make it cohesive.',
        apply: (st) => { /* keep color, ensure visibility */ const txt = bestTextOn(st.colors.shirtColor); st.colors.shirtTextColor = txt; }
      });
    }
    // Spots pattern -> hat
    if (s.parts.pattern === 'spots' && !s.accessories.hat) {
      recs.push({
        id: 'spots-hat',
        title: 'Top it with a hat',
        rationale: 'A hat balances the playful spots.',
        apply: (st) => { st.accessories.hat = true; }
      });
    }
    // If stickers off but intensity > 0, suggest stars for variety
    const anyStickerOn = s.stickers.hearts || s.stickers.stars || s.stickers.paw;
    if (!anyStickerOn && s.stickers.intensity > 0) {
      recs.push({
        id: 'turn-on-stars',
        title: 'Add star stickers',
        rationale: 'A sprinkle of stars adds charm.',
        apply: (st) => { st.stickers.stars = true; }
      });
    }
    return recs;
  }

  function updateRecs() {
    const wrap = $(ids.chips);
    wrap.innerHTML = '';
    const recs = generateRecommendations(state);
    if (!recs.length) {
      const div = document.createElement('div');
      div.className = 'chip';
      div.innerHTML = `<h4>All set!</h4><p>No suggestions right now. Try randomize for inspiration.</p>`;
      wrap.appendChild(div);
      return;
    }
    recs.forEach(rec => {
      const div = document.createElement('div');
      div.className = 'chip';
      div.innerHTML = `
        <div>
          <h4>${rec.title}</h4>
          <p>${rec.rationale}</p>
        </div>
        <div>
          <button class="btn" data-apply="${rec.id}">Apply</button>
        </div>`;
      wrap.appendChild(div);
      div.querySelector('button').addEventListener('click', () => {
        rec.apply(state);
        renderAll();
        toast(`Applied: ${rec.title}`);
      });
    });
  }

  /* SAVE / LOAD */
  function getBuilds() {
    try { return JSON.parse(localStorage.getItem('teddy_builds') || '{}'); }
    catch { return {}; }
  }
  function setBuilds(obj) { localStorage.setItem('teddy_builds', JSON.stringify(obj)); }

  function saveCurrentBuild() {
    const name = ($(ids.saveName).value || '').trim().slice(0,30) || ('Build ' + new Date().toLocaleString());
    const builds = getBuilds();
    builds[name] = state;
    setBuilds(builds);
    renderLoadList();
    toast(`Saved as “${name}”`);
  }

  function renderLoadList() {
    const list = $(ids.loadList);
    list.innerHTML = '';
    const builds = getBuilds();
    const names = Object.keys(builds);
    if (!names.length) {
      list.innerHTML = '<div role="listitem" class="chip"><div><h4>No saved builds yet</h4><p>Save one from the header.</p></div></div>';
      return;
    }
    names.forEach(name => {
      const row = document.createElement('div');
      row.setAttribute('role','listitem');
      row.className = 'chip';
      row.innerHTML = `
        <div>
          <h4>${name}</h4>
          <p style="font-size:.85rem; color:var(--muted);">Tap Load to apply this build.</p>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn" data-load="${name}">Load</button>
          <button class="btn danger" data-delete="${name}">Delete</button>
        </div>`;
      list.appendChild(row);
      row.querySelector('[data-load]').addEventListener('click', () => {
        state = deepClone(builds[name]);
        renderAll();
        toast(`Loaded “${name}”`);
      });
      row.querySelector('[data-delete]').addEventListener('click', () => {
        const b = getBuilds(); delete b[name]; setBuilds(b); renderLoadList(); toast('Deleted'); 
      });
    });
  }

  /* EXPORT PNG */
  async function exportPNG() {
    const svg = $('#teddy-svg');
    const clone = svg.cloneNode(true);
    // Remove animations for export consistency
    clone.querySelector('#teddy-root')?.classList.remove('bob');
    const svgText = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    const vb = svg.viewBox.baseVal;
    const scale = 2; // 2x
    const canvas = document.createElement('canvas');
    canvas.width = vb.width * scale;
    canvas.height = vb.height * scale;
    const ctx = canvas.getContext('2d');

    await new Promise((res, rej) => {
      img.onload = () => {
        ctx.clearRect(0,0,canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        res();
      };
      img.onerror = rej;
      img.src = url;
    });

    const png = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = png;
    a.download = 'teddy-bear.png';
    a.click();
    toast('Exported PNG');
  }

  /* SHARE */
  async function shareBuild() {
    const payload = {
      name: 'Teddy Bear Build',
      state
    };
    const text = 'Check out my teddy bear build:\n' + JSON.stringify(payload, null, 2);
    if (navigator.share && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
      try {
        await navigator.share({ title: 'My Teddy Bear', text });
        toast('Shared!');
        return;
      } catch (e) {
        // fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      toast('Build JSON copied to clipboard');
    } catch {
      toast('Copy failed. You can still use Save/Load.');
    }
  }

  /* RANDOMIZE */
  function randomize() {
    // Color palettes with good readability
    const palettes = [
      { fur:'#C9A27F', inner:'#E5C8A1', face:'#F6E2C8', belly:'#F6E2C8', shirt:'#FFFFFF', acc:'#FF6B6B' },
      { fur:'#B68973', inner:'#E6C7B3', face:'#F3DECD', belly:'#F3DECD', shirt:'#30343F', acc:'#FFD166' },
      { fur:'#9C7A6B', inner:'#D9B8A6', face:'#F6E7D8', belly:'#F6E7D8', shirt:'#FFFFFF', acc:'#6C8EF5' },
      { fur:'#CBB5E4', inner:'#E7D7FB', face:'#F3ECFF', belly:'#F3ECFF', shirt:'#1E1E2A', acc:'#FF8FAB' },
      { fur:'#B7E4C7', inner:'#D8F3DC', face:'#F1FAEE', belly:'#F1FAEE', shirt:'#1D3557', acc:'#F4A261' }
    ];
    const p = palettes[Math.floor(Math.random()*palettes.length)];
    state.colors.furBase = p.fur;
    state.colors.furSecondary = p.inner;
    state.colors.facePatch = p.face;
    state.colors.bellyPatch = p.belly;
    state.colors.shirtColor = p.shirt;
    state.colors.accessoryColor = p.acc;

    // Parts
    const eyeStyles = ['round','starry','sleepy'];
    const mouthStyles = ['smile','open','uwu'];
    const noseStyles = ['oval','triangle'];
    const patterns = ['solid','spots','heart'];
    state.parts.eyeStyle = pick(eyeStyles);
    state.parts.mouthStyle = pick(mouthStyles);
    state.parts.noseStyle = pick(noseStyles);
    state.parts.pattern = pick(patterns);
    state.parts.earSize = +(0.85 + Math.random()*0.4).toFixed(2);
    state.parts.bellyPatchOn = Math.random() > 0.15;

    // Accessories
    state.accessories.bow = Math.random() > 0.35;
    state.accessories.scarf = Math.random() > 0.6;
    state.accessories.hat = Math.random() > 0.7;
    state.accessories.shirtOn = Math.random() > 0.2;

    // Text
    const words = ['HUGS','LOVE','CUDDLE','BEAR','SMILE','BFF','COZY','STAR'];
    state.text.shirtText = pick(words);
    state.text.shirtFont = pick(['rounded','script','pixel']);

    // Stickers
    state.stickers.hearts = Math.random() > 0.4;
    state.stickers.stars = Math.random() > 0.5;
    state.stickers.paw = Math.random() > 0.65;
    state.stickers.intensity = Math.floor(Math.random()*6); // 0–5

    // Pose
    state.pose.scale = +(0.9 + Math.random()*0.3).toFixed(2);
    state.pose.arms = Math.random() > 0.5 ? 'in' : 'out';

    // Ensure shirt text contrast
    const txt = bestTextOn(state.colors.shirtColor);
    state.colors.shirtTextColor = txt;
  }

  /* SUMMARY */
  function summarize() {
    const parts = [];
    const furName = shortHex(state.colors.furBase);
    parts.push(`${furName} fur`);
    parts.push(ucFirst(state.parts.eyeStyle) + ' eyes');
    parts.push(ucFirst(state.parts.mouthStyle));
    const acc = [];
    if (state.accessories.bow) acc.push('Bow');
    if (state.accessories.scarf) acc.push('Scarf');
    if (state.accessories.hat) acc.push('Hat');
    if (state.accessories.shirtOn) acc.push('Tee');
    if (acc.length) parts.push(acc.join(' + '));
    if (state.accessories.shirtOn && state.text.shirtText) {
      parts.push(`“${state.text.shirtText}”`);
    }
    $(ids.summary).textContent = parts.join(' · ');
  }

  /* MODALS */
  function openModal(sel) {
    const el = typeof sel === 'string' ? $(sel) : sel;
    el.setAttribute('open','');
    el.addEventListener('click', backdropClose);
    document.addEventListener('keydown', escClose);
    // Focus first input if any
    const focusable = el.querySelector('input, button, select, textarea');
    focusable?.focus();
  }
  function closeModal(sel) {
    const el = typeof sel === 'string' ? $(sel) : sel;
    el.removeAttribute('open');
    el.removeEventListener('click', backdropClose);
    document.removeEventListener('keydown', escClose);
  }
  function backdropClose(e) { if (e.target.classList.contains('modal-backdrop')) closeModal(e.target); }
  function escClose(e) { if (e.key === 'Escape') $$('.modal-backdrop[open]').forEach(m => closeModal(m)); }
  function openHelpOnFirstVisit() {
    if (!localStorage.getItem('teddy_seen_help')) {
      openModal(ids.modalHelp);
      localStorage.setItem('teddy_seen_help','1');
    }
  }

  /* UTIL */
  function toggle(node, on) { node.classList.toggle('hidden', !on); }
  function showOnly(list) { list.forEach(({node, on}) => node.classList.toggle('hidden', !on)); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function pick(arr) { return arr[Math.floor(Math.random()*arr.length)]; }
  function ucFirst(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function shortHex(hex) { return hex.toUpperCase(); }

  function hexToRgb(hex) {
    const h = hex.replace('#','');
    const bigint = parseInt(h, 16);
    if (h.length === 6) return { r: (bigint>>16)&255, g: (bigint>>8)&255, b: bigint&255 };
    if (h.length === 3) return { r: ((bigint>>8)&15)*17, g: ((bigint>>4)&15)*17, b: (bigint&15)*17 };
    return { r:0, g:0, b:0 };
  }
  function luminance(hex) {
    const { r, g, b } = hexToRgb(hex);
    const srgb = [r,g,b].map(v => v/255).map(v => v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4));
    return 0.2126*srgb[0] + 0.7152*srgb[1] + 0.0722*srgb[2];
  }
  function contrastRatio(hex1, hex2) {
    const L1 = luminance(hex1), L2 = luminance(hex2);
    const hi = Math.max(L1, L2), lo = Math.min(L1, L2);
    return (hi + 0.05) / (lo + 0.05);
  }
  function bestTextOn(bg) {
    const white = '#FFFFFF', black = '#111111';
    const cW = contrastRatio(bg, white);
    const cB = contrastRatio(bg, black);
    // Try to meet 4.5:1
    return cW >= cB ? white : black;
  }
  function isPastel(hex) {
    // Pastel: relatively light and less saturated - heuristic
    const { r, g, b } = hexToRgb(hex);
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    const l = (max + min) / 2 / 255; // 0..1
    const s = (max - min) / (max || 1);
    return l > 0.7 && s < 0.35;
  }
  function complement(hex) {
    const { r, g, b } = hexToRgb(hex);
    // Convert to HSL
    const [h, s, l] = rgbToHsl(r, g, b);
    const h2 = (h + 0.5) % 1;
    const [rr, gg, bb] = hslToRgb(h2, s, l);
    return '#' + [rr,gg,bb].map(v => v.toString(16).padStart(2,'0')).join('').toUpperCase();
  }
  function rgbToHsl(r, g, b) {
    r/=255; g/=255; b/=255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h, s, l = (max+min)/2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [h, s, l];
  }
  function hslToRgb(h, s, l) {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    let r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r*255), Math.round(g*255), Math.round(b*255)];
  }

  /* TOASTS */
  function toast(msg) {
    const wrap = $(ids.toasts);
    const div = document.createElement('div');
    div.className = 'toast';
    div.textContent = msg;
    wrap.appendChild(div);
    setTimeout(() => {
      div.style.opacity = '0';
      div.style.transform = 'translateY(6px)';
      setTimeout(() => div.remove(), 300);
    }, 1800);
  }
})();