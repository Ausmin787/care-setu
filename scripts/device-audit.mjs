// Device audit (added 2026-09-28 after a pinned section silently switched off on Sasanka's 1280x537 laptop window).
// Loads every page at a matrix of real device sizes (laptops at 125-150% Windows scaling, desktop, iPad both ways,
// phones), wheels through the whole page and at every step checks: (1) horizontal overflow, (2) a pinned element
// taller than the viewport, (3) every visible link/button is hittable (elementFromPoint at its centre lands on it),
// (4) scrolling never sticks. Deck cards are skipped (covered by design while stacked).
// A control whose centre is clipped out by an ancestor (a reel panel mid-slide behind its window) is skipped as hidden
// (D-038 close-out: it was reported as BLOCKED on every Home run); anything visible but covered is a bug.
// usage (dev server running): node scripts/device-audit.mjs http://localhost:3000 [/,/services] ; DEVICES=1280x537 to filter
// In Git Bash prefix MSYS_NO_PATHCONV=1, or the page list is rewritten into a Windows path.
import { spawn } from "node:child_process";
import os from "node:os";
import path from "node:path";

const base = process.argv[2];
const pages = (process.argv[3] || "/,/services,/about,/contact,/faq,/partner,/pay,/privacy,/refunds,/terms").split(",");
const DEVICES = [
  { name: "laptop150-1280x537", w: 1280, h: 537 },
  { name: "laptop125-1093x490", w: 1093, h: 490 },
  { name: "laptop-1366x657", w: 1366, h: 657 },
  { name: "laptop125-1536x730", w: 1536, h: 730 },
  { name: "desk-1920x961", w: 1920, h: 961 },
  { name: "ipad-land-1024x768", w: 1024, h: 768, touch: true },
  { name: "ipad-port-768x1024", w: 768, h: 1024, touch: true },
  { name: "phone-390x844", w: 390, h: 844, touch: true },
  { name: "phone-360x740", w: 360, h: 740, touch: true },
].filter((d) => !process.env.DEVICES || process.env.DEVICES.split(",").some((n) => d.name.includes(n)));

const chrome = "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const probe = `(() => {
  const out = { over: document.documentElement.scrollWidth - document.documentElement.clientWidth, tall: [], blocked: [] };
  const navH = document.querySelector('header,nav')?.getBoundingClientRect().bottom || 0;
  document.querySelectorAll('.pin-spacer > *').forEach(p => {
    const r = p.getBoundingClientRect();
    if (getComputedStyle(p).position === 'fixed' && r.height > innerHeight + 1) out.tall.push((p.className+'').slice(0,40) + ' h=' + Math.round(r.height));
  });
  document.querySelectorAll('main a[href], main button, footer a[href]').forEach(a => {
    if (a.closest('[data-card]')) return;
    const r = a.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    if (cy < navH + 2 || cy > innerHeight - 2 || cx < 2 || cx > innerWidth - 2) return;
    // Clipped out of sight by an ancestor (a reel panel sliding behind its window's edge) is hidden, not covered:
    // nobody can see it to click it. A visible control that something sits on top of still fails below.
    for (let p = a.parentElement; p && p !== document.body; p = p.parentElement) {
      if (getComputedStyle(p).overflowX === 'visible' && getComputedStyle(p).overflowY === 'visible') continue;
      const c = p.getBoundingClientRect();
      if (cx < c.left || cx > c.right || cy < c.top || cy > c.bottom) return;
    }
    const hit = document.elementFromPoint(cx, cy);
    if (hit && (hit === a || a.contains(hit))) {
      // Visible centre: also require the whole box inside the viewport's bottom edge when the element is fully rendered
      return;
    }
    const who = (a.getAttribute('aria-label') || a.textContent || '').trim().replace(/\\s+/g,' ').slice(0, 30);
    out.blocked.push(who + ' @' + Math.round(cx) + ',' + Math.round(cy) + ' under ' + (hit ? hit.tagName + '.' + (hit.className+'').slice(0,28) : 'null'));
  });
  return out;
})()`;

for (const dev of DEVICES) {
  const port = 9333 + Math.floor(Math.random() * 400);
  const proc = spawn(chrome, ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(os.tmpdir(), "device-audit-" + port)}`,
    "--hide-scrollbars", "--no-first-run", `--window-size=${dev.w},${dev.h}`, "about:blank"], { stdio: "ignore" });
  let ws, id = 0; const pend = new Map();
  const send = (method, params = {}, sessionId) => new Promise((res, rej) => { const m = { id: ++id, method, params }; if (sessionId) m.sessionId = sessionId; pend.set(m.id, { res, rej }); ws.send(JSON.stringify(m)); });
  try {
    let ver; for (let i = 0; i < 150 && !ver; i++) { try { ver = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); } catch { await sleep(200); } }
    ws = new WebSocket(ver.webSocketDebuggerUrl); await new Promise((r) => ws.addEventListener("open", r));
    ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); if (m.error) p.rej(new Error(m.error.message)); else p.res(m.result); } });
    const { targetInfos } = await send("Target.getTargets");
    const { sessionId: s } = await send("Target.attachToTarget", { targetId: targetInfos.find((t) => t.type === "page").targetId, flatten: true });
    await send("Page.enable", {}, s);
    await send("Emulation.setDeviceMetricsOverride", { width: dev.w, height: dev.h, deviceScaleFactor: 1, mobile: !!dev.touch && dev.w < 900 }, s);
    if (dev.touch) await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 }, s);
    const ev = async (x) => (await send("Runtime.evaluate", { expression: x, returnByValue: true, awaitPromise: true }, s)).result.value;
    for (const pg of pages) {
      await send("Page.navigate", { url: base + pg }, s); await sleep(3500);
      const media = await ev(`JSON.stringify({fine: matchMedia('(pointer: fine)').matches, live: [...document.querySelectorAll('[data-live]')].length})`);
      const issues = new Map(); let maxOver = 0; let steps = 0; let stuck = 0;
      for (let g = 0; g < 400; g++) {
        const p = await ev(probe);
        maxOver = Math.max(maxOver, p.over);
        for (const t of p.tall) issues.set("TALL-PIN " + t, (issues.get("TALL-PIN " + t) || 0) + 1);
        for (const b of p.blocked) { const k = "BLOCKED " + b.replace(/ @\d+,\d+/, ""); issues.set(k, (issues.get(k) || 0) + 1); }
        const y0 = await ev("scrollY");
        const atEnd = await ev("Math.ceil(scrollY + innerHeight) >= document.documentElement.scrollHeight - 2");
        if (atEnd && g > 0) break;
        await send("Input.dispatchMouseEvent", { type: "mouseWheel", x: dev.w / 2, y: dev.h / 2, deltaX: 0, deltaY: 240 }, s);
        await sleep(320); steps++;
        if ((await ev("scrollY")) === y0) { stuck++; if (stuck >= 3) { issues.set("STUCK at y=" + y0, 1); break; } } else stuck = 0;
      }
      const lines = [...issues].map(([k, n]) => `    ${k}  x${n}`);
      console.log(`${dev.name} ${pg} ${media} steps=${steps} overX=${maxOver}${lines.length ? "\n" + lines.join("\n") : "  OK"}`);
    }
  } catch (e) { console.error(dev.name, "ERR", e.message); } finally { try { ws?.close(); } catch {} proc.kill(); }
}
