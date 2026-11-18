/* Zeitfuchs Uhr-Engine: Buchstaben verteilen, Uhrzeit auf Dialekt, Fronten zeichnen */
(function (g) {
  const COLS = 11, ROWS = 10;

  const PRESETS = {
    "Bündnerdeutsch": { intro: "AS ISCH", m5: "FÜÜF", m10: "ZEHN", m15: "VIARTEL", m20: "ZWENZG", vor: "VOR", ab: "AB", halb: "HALBI",
      h: ["AIS", "ZWAI", "DREI", "VIARI", "FÜÜFI", "SEGGSI", "SIBNI", "ACHTI", "NÜÜNI", "ZEHNI", "ÖLFI", "ZWÖLFI"] },
    "Züritüütsch": { intro: "ES ISCH", m5: "FÜÜF", m10: "ZÄH", m15: "VIERTEL", m20: "ZWÄNZG", vor: "VOR", ab: "AB", halb: "HALBI",
      h: ["EIS", "ZWEI", "DRÜÜ", "VIERI", "FÜÜFI", "SÄCHSI", "SIBNI", "ACHTI", "NÜÜNI", "ZÄNI", "ELFI", "ZWÖLFI"] },
    "Bärndütsch": { intro: "ES ISCH", m5: "FÜF", m10: "ZÄH", m15: "VIERTU", m20: "ZWÄNZG", vor: "VOR", ab: "AB", halb: "HALBI",
      h: ["EIS", "ZWÖI", "DRÜ", "VIERI", "FÜFI", "SÄCHSI", "SIBNI", "ACHTI", "NÜNI", "ZÄNI", "EUFI", "ZWÖUFI"] },
    "Hochdeutsch": { intro: "ES IST", m5: "FÜNF", m10: "ZEHN", m15: "VIERTEL", m20: "ZWANZIG", vor: "VOR", ab: "NACH", halb: "HALB",
      h: ["EINS", "ZWEI", "DREI", "VIER", "FÜNF", "SECHS", "SIEBEN", "ACHT", "NEUN", "ZEHN", "ELF", "ZWÖLF"] }
  };
  function presetWords(name) {
    const p = PRESETS[name], w = { intro: p.intro, m5: p.m5, m10: p.m10, m15: p.m15, m20: p.m20, vor: p.vor, ab: p.ab, halb: p.halb };
    p.h.forEach((x, i) => w["h" + (i + 1)] = x);
    return w;
  }

  const RAL = {1000:"BEBD7F",1001:"C2B078",1002:"C6A664",1003:"E5BE01",1004:"CDA434",1005:"A98307",1006:"E4A010",1007:"DC9D00",1011:"8A6642",1012:"C7B446",1013:"EAE6CA",1014:"E1CC4F",1015:"E6D690",1016:"EDFF21",1017:"F5D033",1018:"F8F32B",1019:"9E9764",1020:"999950",1021:"F3DA0B",1023:"FAD201",1024:"AEA04B",1027:"9D9101",1028:"F4A900",1032:"D6AE01",1033:"F3A505",1034:"EFA94A",
  2000:"ED760E",2001:"C93C20",2002:"CB2821",2003:"FF7514",2004:"F44611",2008:"F75E25",2009:"F54021",2010:"D84B20",2011:"EC7C26",2012:"E55137",
  3000:"AF2B1E",3001:"A52019",3002:"A2231D",3003:"9B111E",3004:"75151E",3005:"5E2129",3007:"412227",3009:"642424",3011:"781F19",3012:"C1876B",3013:"A12312",3014:"D36E70",3015:"EA899A",3016:"B32821",3017:"E63244",3018:"D53032",3020:"CC0605",3022:"D95030",3027:"C51D34",3031:"B32428",
  4001:"6D3F5B",4002:"922B3E",4003:"DE4C8A",4004:"641C34",4005:"6C4675",4006:"A03472",4007:"4A192C",4008:"924E7D",4009:"A18594",4010:"CF3476",
  5000:"354D73",5001:"1F3438",5002:"20214F",5003:"1D1E33",5004:"18171C",5005:"1E2460",5007:"3E5F8A",5008:"26252D",5009:"025669",5010:"0E294B",5011:"231A24",5012:"3B83BD",5013:"1E213D",5014:"606E8C",5015:"2271B3",5017:"063971",5018:"3F888F",5019:"1B5583",5020:"1D334A",5021:"256D7B",5022:"252850",5023:"49678D",5024:"5D9B9B",
  6000:"316650",6001:"287233",6002:"2D572C",6003:"424632",6004:"1F3A3D",6005:"2F4538",6006:"3E3B32",6007:"343B29",6008:"39352A",6009:"31372B",6010:"35682D",6011:"587246",6012:"343E40",6013:"6C7156",6014:"47402E",6015:"3B3C36",6016:"1E5945",6017:"4C9141",6018:"57A639",6019:"BDECB6",6020:"2E3A23",6021:"89AC76",6022:"25221B",6024:"308446",6025:"3D642D",6026:"015D52",6027:"84C3BE",6028:"2C5545",6029:"20603D",6032:"317F43",6033:"497E76",6034:"7FB5B5",
  7000:"78858B",7001:"8A9597",7002:"7E7B52",7003:"6C7059",7004:"969992",7005:"646B63",7006:"6D6552",7008:"6A5F31",7009:"4D5645",7010:"4C514A",7011:"434B4D",7012:"4E5754",7013:"464531",7015:"434750",7016:"293133",7021:"23282B",7022:"332F2C",7023:"686C5E",7024:"474A51",7026:"2F353B",7030:"8B8C7A",7031:"474B4E",7032:"B8B799",7033:"7D8471",7034:"8F8B66",7035:"D7D7D7",7036:"7F7679",7037:"7D7F7D",7038:"B5B8B1",7039:"6C6960",7040:"9DA1AA",7042:"8D948D",7043:"4E5452",7044:"CAC4B0",7045:"909090",7046:"82898F",7047:"D0D0D0",
  8000:"826C34",8001:"955F20",8002:"6C3B2A",8003:"734222",8004:"8E402A",8007:"59351F",8008:"6F4F28",8011:"5B3A29",8012:"592321",8014:"382C1E",8015:"633A34",8016:"4C2F27",8017:"45322E",8019:"403A3A",8022:"212121",8023:"A65E2E",8024:"79553D",8025:"755C48",8028:"4E3B31",
  9001:"FDF4E3",9002:"E7EBDA",9003:"F4F4F4",9004:"282828",9005:"0A0A0A",9006:"A5A5A5",9007:"8F8F8F",9010:"FFFFFF",9011:"1C1C1C",9016:"F6F6F6",9017:"1E1E1E",9018:"D7D7D7"};

  const SURFACES = [["ral", "Lackiert (RAL / NCS)"], ["gold", "Blattgold"], ["kupfer", "Blattkupfer"], ["silber", "Blattsilber"], ["spiegel", "Spiegel silber"], ["patina", "Kupferpatina"], ["rost", "Rost (auf Anfrage)"]];
  const LEAF = { gold: ["a7843a", "eed890", "7d6125", "fff3c6"], kupfer: ["8a4526", "e39a6c", "5e2c16", "ffd2b0"], silber: ["8e9192", "eceeec", "6a6d6e", "ffffff"] };
  const LEDS = [["weiss", "Weiss", "#fff3e2"], ["mint", "Mint", "#5ff2c0"], ["gruen", "Grün", "#3ee05a"], ["gelb", "Gelb", "#ffd23a"], ["rot", "Rot", "#ff3b30"]];
  const BRIGHT = [["gedimmt", "Gedimmt", .45], ["mittel", "Mittel", .75], ["hell", "Hell", 1]];

  /* Zufall und Rauschen */
  function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 } }
  function noise(seed) {
    const r = rng(seed), v = new Float32Array(65536); for (let i = 0; i < 65536; i++) v[i] = r();
    const n = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), w = yf * yf * (3 - 2 * yf);
      const X0 = xi & 255, X1 = (xi + 1) & 255, Y0 = (yi & 255) << 8, Y1 = ((yi + 1) & 255) << 8; const a = v[Y0 | X0], b = v[Y0 | X1], c = v[Y1 | X0], d = v[Y1 | X1];
      return a + (b - a) * u + (c - a) * w + (a - b - c + d) * u * w };
    return (x, y, o) => { let s = 0, amp = .5, f = 1, nm = 0; for (let i = 0; i < o; i++) { s += amp * n(x * f, y * f); nm += amp; amp *= .5; f *= 2.03 } return s / nm };
  }
  const st = v => Math.min(1, Math.max(0, (v - .5) * 2.4 + .5));
  const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) };
  const hex = h => [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

  /* Fronten */
  const TEX = 500, texCache = {};
  let F1, F2, F3;
  function texture(key) {
    if (texCache[key]) return texCache[key];
    if (!F1) { F1 = noise(11); F2 = noise(23); F3 = noise(37) }
    const c = document.createElement("canvas"); c.width = c.height = TEX; const gx = c.getContext("2d"); const img = gx.createImageData(TEX, TEX), d = img.data;
    let lum = 0;
    for (let y = 0; y < TEX; y++) for (let x = 0; x < TEX; x++) {
      let col; const s = F3(x * .16, y * .16, 2);
      if (key === "patina") {
        const a = st(F1(x * .02, y * .02, 6)), b = st(F2(x * .018 + 40, y * .018, 6)), m = F2(x * .07, y * .07, 3);
        col = mix(hex("0c1722"), hex("1f3b52"), s * .5 + m * .5);
        col = mix(col, mix(hex("24618b"), hex("5fa8cc"), m * .7 + s * .3), sm(.42, .62, a) * .9);
        col = mix(col, hex("8cc7df"), sm(.62, .78, a) * sm(.5, .8, s) * .6);
        col = mix(col, mix(hex("6a3720"), hex("b06c3c"), s), sm(.7, .78, b));
        if (s > .82) col = mix(col, [190, 220, 232], .2);
      } else if (key === "rost") {
        const a = st(F1(x * .01, y * .01, 5)), b = F2(x * .05, y * .05, 3);
        col = mix(hex("3c1c0f"), hex("a5592a"), a * .7 + b * .3);
        if (b < .4) col = mix(col, hex("24110a"), (.4 - b) * 1.6);
        col = mix(col, hex("cf9157"), sm(.72, .9, s) * .35);
      } else if (LEAF[key]) {
        const P = LEAF[key], a = st(F1(x * .006, y * .006, 4)), k = Math.abs(F2(x * .03, y * .03, 3) - .5);
        col = mix(hex(P[0]), hex(P[1]), a * .6 + s * .4);
        const L = 62, row = Math.floor(y / L), lx = (x + row * 23) % L, ly = y % L;
        if (lx < 1.2 || ly < 1.2) col = mix(col, hex(P[2]), .35);
        if (k < .013) col = mix(col, hex(P[3]), .5);
      } else if (key === "spiegel") {
        const u = (x * .8 + y * .35) / TEX, w = F1(x * .004, y * .004, 3);
        const band = .5 + .5 * Math.sin(u * 7.5 + w * 3), band2 = sm(.82, .97, .5 + .5 * Math.sin(u * 19 + 1.3));
        col = mix(hex("4e5356"), hex("d9dddf"), band * .85 + (s - .5) * .04);
        col = mix(col, hex("f7f9fa"), band2 * .6);
      } else {
        const base = hex(key.slice(4)); const shade = 1 + .07 * (1 - (x + y) / (2 * TEX)) - .035 + (s - .5) * .06;
        col = [base[0] * shade + 2, base[1] * shade + 2, base[2] * shade + 2];
      }
      const i = (y * TEX + x) * 4; d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = 255;
      lum += .2126 * col[0] + .7152 * col[1] + .0722 * col[2];
    }
    gx.putImageData(img, 0, 0);
    return texCache[key] = { canvas: c, lum: lum / (TEX * TEX * 255) };
  }
  function surfaceKey(cfg) { if (cfg.flat) return "ral:" + cfg.flat; return cfg.surface !== "ral" ? cfg.surface : "ral:" + (RAL[cfg.ral] || "8A8D8F") }
  function frontColor(cfg) {
    if (cfg.surface === "ral") return "#" + (RAL[cfg.ral] || "8A8D8F");
    return { gold: "#9c7b33", kupfer: "#8a4526", silber: "#9a9d9e", spiegel: "#7d8285", patina: "#1b3247", rost: "#4a2412" }[cfg.surface];
  }

  /* Buchstaben verteilen */
  const clean = s => (s || "").toUpperCase().replace(/[^A-ZÄÖÜ ]/g, "").replace(/\s+/g, " ").trim();
  const cleanWord = s => (s || "").toUpperCase().replace(/[^A-ZÄÖÜ]/g, "");
  function tokens(W) {
    const t = [];
    clean(W.intro).split(" ").filter(Boolean).forEach((w, i) => t.push({ id: "i" + i, text: w, seq: true }));
    ["m5", "m10", "m15", "m20", "vor", "ab", "halb"].forEach(k => { if (W[k]) t.push({ id: k, text: W[k], seq: true }) });
    for (let i = 1; i <= 12; i++) if (W["h" + i]) t.push({ id: "h" + i, text: W["h" + i], seq: false });
    return t;
  }
  /* Wörter, die gemeinsam leuchten können, brauchen einen Füllbuchstaben dazwischen (nie «ASISCH»).
     Wörter, die nie zusammen leuchten (zwei Stunden, zwei Minutenzahlen, VOR und AB), dürfen sich berühren. */
  const NUM = { m5: 1, m10: 1, m15: 1, m20: 1 };
  function gapBetween(a, b) {
    if (!a) return 0;
    const ha = /^h\d/.test(a.id), hb = /^h\d/.test(b.id);
    if (ha && hb) return 0;
    if (NUM[a.id] && NUM[b.id]) return 0;
    if ((a.id === "vor" && b.id === "ab") || (a.id === "ab" && b.id === "vor")) return 0;
    return 1;
  }
  function pack(seq, hours) {
    const rows = []; let cur = [], used = 0;
    const last = () => cur[cur.length - 1];
    const room = t => COLS - used - gapBetween(last(), t);
    const put = t => { if (t.text.length > room(t) && cur.length) { rows.push(cur); cur = []; used = 0 } used += gapBetween(last(), t) + t.text.length; cur.push(t) };
    seq.forEach(put);
    const pool = hours.slice().sort((a, b) => b.text.length - a.text.length);
    while (pool.length) {
      const i = pool.findIndex(t => t.text.length <= room(t));
      if (i < 0) { if (cur.length) { rows.push(cur); cur = []; used = 0; continue } put(pool.shift()); continue }
      put(pool.splice(i, 1)[0]);
    }
    if (cur.length) rows.push(cur);
    return rows;
  }
  function perms(a) { if (a.length < 2) return [a]; const out = []; a.forEach((x, i) => perms(a.slice(0, i).concat(a.slice(i + 1))).forEach(p => out.push([x].concat(p)))); return out }
  const FILL = "EEENNNIIRRSSTTAAHHDULGOCMBWFKZPVÄÜ";
  function layout(W, seed) {
    const toks = tokens(W); const tooLong = toks.filter(t => t.text.length > COLS);
    const intro = toks.filter(t => t.id[0] === "i"), nums = toks.filter(t => NUM[t.id]);
    const va = toks.filter(t => t.id === "vor" || t.id === "ab"), halb = toks.filter(t => t.id === "halb"), hours = toks.filter(t => /^h\d/.test(t.id));
    // Reihenfolge der Minutenwörter frei wählen, damit möglichst wenige Zeilen nötig sind
    let rows = null;
    perms(nums).forEach(pn => perms(va).forEach(pv => {
      const r = pack(intro.concat(pn, pv, halb), hours);
      if (!rows || r.length < rows.length) rows = r;
    }));
    const r = rng((seed || 7) * 7919 + 1);
    while (rows.length < ROWS) rows.splice(Math.floor(r() * (rows.length + 1)), 0, []);
    const grid = [], own = [];
    rows.forEach(row => {
      const letters = [], owner = []; const L = row.reduce((s, t) => s + Math.min(t.text.length, COLS), 0);
      const gaps = row.map((t, j) => j ? gapBetween(row[j - 1], t) : 0);
      let free = Math.max(0, COLS - L - gaps.reduce((a, b) => a + b, 0));
      const slots = new Array(row.length + 1).fill(0);
      while (free > 0) { slots[Math.floor(r() * slots.length)]++; free-- }
      const fill = n => { for (let i = 0; i < n; i++) { letters.push(FILL[Math.floor(r() * FILL.length)]); owner.push(null) } };
      row.forEach((t, j) => { fill(slots[j] + gaps[j]); for (const ch of t.text.slice(0, COLS)) { letters.push(ch); owner.push(t.id) } });
      fill(slots[row.length]);
      grid.push(letters.slice(0, COLS)); own.push(owner.slice(0, COLS));
    });
    return { grid, own, rows: grid.length, tooLong };
  }

  /* Uhrzeit auf Dialekt */
  function litFor(W, timeStr) {
    const [hh, mm] = timeStr.split(":").map(Number); const m = Math.floor(mm / 5) * 5;
    const ids = tokens(W).filter(t => t.id[0] === "i").map(t => t.id);
    const M = { 0: [], 5: ["m5", "ab"], 10: ["m10", "ab"], 15: ["m15", "ab"], 20: ["m20", "ab"], 25: ["m5", "vor", "halb"], 30: ["halb"], 35: ["m5", "ab", "halb"], 40: ["m20", "vor"], 45: ["m15", "vor"], 50: ["m10", "vor"], 55: ["m5", "vor"] };
    ids.push(...M[m]);
    let h = hh % 12; if (m >= 25) h = (h + 1) % 12; ids.push("h" + (h === 0 ? 12 : h));
    return { ids: new Set(ids), dots: mm % 5 };
  }
  function phrase(L, lit) {
    const out = [];
    L.grid.forEach((row, r) => { let w = "", id = null; row.forEach((ch, c) => { const o = L.own[r][c];
      if (o && lit.ids.has(o)) { if (o !== id && w) { out.push(w); w = "" } w += ch; id = o } else { if (w) { out.push(w); w = "" } id = null } }); if (w) out.push(w) });
    return out.join(" ") + (lit.dots ? ` + ${lit.dots} Min.` : "");
  }

  /* Zeichnen: quadratische Front, Zeilen und Spalten im gleichen Abstand */
  function draw(canvas, cfg, L) {
    const ctx = canvas.getContext("2d"), S = canvas.width;
    const tex = texture(surfaceKey(cfg));
    ctx.clearRect(0, 0, S, S); ctx.drawImage(tex.canvas, 0, 0, S, S);
    const vg = ctx.createRadialGradient(S * .4, S * .35, S * .2, S * .5, S * .5, S * .78);
    vg.addColorStop(0, "rgba(255,255,255,0.04)"); vg.addColorStop(1, "rgba(0,0,0,0.18)");
    ctx.fillStyle = vg; ctx.fillRect(0, 0, S, S);
    const light = tex.lum > .42, bf = (BRIGHT.find(b => b[0] === cfg.bright) || BRIGHT[1])[2];
    const off = light ? "rgba(28,24,20,0.78)" : "rgba(200,208,214,0.32)";
    const lit = litFor(cfg.words, cfg.time), led = (LEDS.find(l => l[0] === cfg.led) || LEDS[0])[2];
    const rowsN = L.rows, span = Math.max(COLS, rowsN);
    const p = S * .64 / (span - 1) * (span > 10 ? 1 : 1), fs = p * .74;
    const x0 = S / 2 - (COLS - 1) * p / 2, y0 = S * .5 - (rowsN - 1) * p / 2;
    ctx.textAlign = "center"; ctx.textBaseline = "alphabetic"; ctx.font = `500 ${fs}px Barlow, Arial, sans-serif`;
    const ascent = fs * .35; // optische Mitte der Grossbuchstaben
    const litCells = [];
    for (let r = 0; r < rowsN; r++) for (let c = 0; c < COLS; c++) {
      const ch = L.grid[r][c]; if (!ch) continue; const x = x0 + c * p, y = y0 + r * p + ascent;
      if (L.own[r][c] && lit.ids.has(L.own[r][c])) litCells.push([ch, x, y]);
      else { ctx.fillStyle = off; ctx.fillText(ch, x, y) }
    }
    const glow = mix(hex(led.slice(1)), [255, 255, 255], .45).map(Math.round);
    ctx.save(); ctx.shadowColor = led; ctx.globalAlpha = .55 + .45 * bf;
    if (light) { ctx.save(); ctx.globalAlpha = 1; ctx.shadowColor = "rgba(0,0,0,.45)"; ctx.shadowBlur = S * .008; ctx.fillStyle = led; litCells.forEach(([ch, x, y]) => ctx.fillText(ch, x, y)); ctx.restore() }
    for (const pass of [S * .035 * bf, S * .012]) { ctx.shadowBlur = pass; ctx.fillStyle = pass > S * .02 || light ? led : `rgb(${glow})`; litCells.forEach(([ch, x, y]) => ctx.fillText(ch, x, y)) }
    if (bf >= 1) { ctx.shadowBlur = S * .05; litCells.forEach(([ch, x, y]) => ctx.fillText(ch, x, y)) }
    ctx.restore();
    [[.075, .075], [.925, .075], [.925, .925], [.075, .925]].forEach(([u, v], i) => {
      ctx.beginPath(); ctx.arc(u * S, v * S, S * .0045, 0, Math.PI * 2);
      if (i < lit.dots) { ctx.save(); ctx.shadowColor = led; ctx.shadowBlur = S * .02; ctx.fillStyle = `rgb(${glow})`; ctx.fill(); ctx.restore() } else { ctx.fillStyle = off; ctx.fill() }
    });
    if (cfg.engraving) { ctx.font = `500 ${S * .022}px Barlow, Arial, sans-serif`; ctx.fillStyle = off; ctx.textBaseline = "middle";
      ctx.fillText(cfg.engraving.split("").join(String.fromCharCode(8202)), S / 2, S * .9) }
    return { lit, led };
  }

  g.ZF = { COLS, ROWS, PRESETS, presetWords, RAL, SURFACES, LEDS, BRIGHT, texture, surfaceKey, frontColor, layout, litFor, phrase, draw, clean, cleanWord, mix, hex };
})(window);
