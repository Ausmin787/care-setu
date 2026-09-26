"use client";

import { useEffect, useRef } from "react";
import s from "./FooterWordmark.module.css";

// Footer wordmark (D-023), after Spectrum.Life's footer: a grainy gradient that drifts slowly inside the letters.
// Theirs is PIXI's displacement filter over a texture; ours is one small shader (domain-warped noise through the
// logo's line colours, plus grain) masked by the text drawn with the real font. The CSS gradient under it is the
// no-JS / no-WebGL state; reduced motion gets one still frame; the loop runs only while the footer is on screen.

const VERT = "attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}";

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 v;
uniform sampler2D u_mask;
uniform vec2 u_res;
uniform float u_t;
uniform vec3 u_c0, u_c1, u_c2, u_c3;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){
  vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);
}
float fbm(vec2 p){float a=.5,r=0.;for(int i=0;i<4;i++){r+=a*noise(p);p*=2.03;a*=.5;}return r;}
void main(){
  vec2 q=v*vec2(u_res.x/u_res.y,1.)*.4;
  vec2 w=vec2(fbm(q+vec2(0.,u_t*.05)), fbm(q+vec2(5.2,1.3)-u_t*.04));
  float f=fbm(q+2.2*w+u_t*.02);
  f=clamp(mix(f,v.x*.8+v.y*.2,.35)*1.4-.12,0.,1.);
  vec3 c=mix(u_c0,u_c1,smoothstep(0.,.28,f));
  c=mix(c,u_c2,smoothstep(.3,.46,f));
  c=mix(c,u_c3,smoothstep(.5,.78,f));
  c+=(hash(gl_FragCoord.xy)-.5)*.1;
  float a=texture2D(u_mask,v).a;
  gl_FragColor=vec4(c*a,a);
}`;

// "#0d7cb1" -> [r, g, b] in 0..1. Colours come from the CSS tokens so the shader never holds a raw hex.
function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.trim().replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function FooterWordmark({ text }: { text: string }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const word = el?.querySelector<HTMLElement>("[data-word]");
    if (!el || !word) return;
    // A fresh canvas per mount: cleanup loses the context, and a reused canvas would hand back the lost one.
    const canvas = document.createElement("canvas");
    canvas.className = s.canvas;
    const gl = canvas.getContext("webgl", { antialias: false });
    if (!gl) return;
    el.appendChild(canvas);

    const shader = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return sh;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      canvas.remove();
      return;
    }
    gl.useProgram(prog);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const css = getComputedStyle(el);
    ["--wm-0", "--wm-1", "--wm-2", "--wm-3"].forEach((name, i) =>
      gl.uniform3fv(gl.getUniformLocation(prog, `u_c${i}`), rgb(css.getPropertyValue(name))),
    );
    const uT = gl.getUniformLocation(prog, "u_t");
    const uRes = gl.getUniformLocation(prog, "u_res");

    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const mask = document.createElement("canvas");

    const still = matchMedia("(prefers-reduced-motion: reduce)");
    const t0 = performance.now();
    let raf = 0;
    let visible = false;
    let ready = false;

    const draw = () => {
      gl.uniform1f(uT, still.matches ? 0 : (performance.now() - t0) / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const frame = () => {
      raf = 0;
      if (!visible || still.matches) return;
      draw();
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (ready && !raf && visible && !still.matches) raf = requestAnimationFrame(frame);
    };

    // Draw the text into the mask at the word's own box, scaled so its ink spans the full width.
    const layout = () => {
      const box = word.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(box.width * dpr));
      const h = Math.max(1, Math.round(box.height * dpr));
      canvas.width = mask.width = w;
      canvas.height = mask.height = h;
      const ws = getComputedStyle(word);
      const ctx = mask.getContext("2d")!;
      const set = (size: number) => {
        ctx.font = `${ws.fontWeight} ${size}px ${ws.fontFamily}`;
        ctx.letterSpacing = `${(parseFloat(ws.letterSpacing) / parseFloat(ws.fontSize)) * size}px`;
      };
      set(100);
      let m = ctx.measureText(text);
      set((100 * w) / (m.actualBoundingBoxLeft + m.actualBoundingBoxRight));
      m = ctx.measureText(text);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#fff";
      ctx.fillText(
        text,
        m.actualBoundingBoxLeft,
        (h + m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2,
      );
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mask);
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
      draw();
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });
    const ro = new ResizeObserver(() => ready && layout());
    const onMotion = () => (still.matches ? draw() : start());

    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      layout();
      ready = true;
      el.setAttribute("data-live", "");
      io.observe(el);
      ro.observe(word);
      still.addEventListener("change", onMotion);
      start();
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      still.removeEventListener("change", onMotion);
      el.removeAttribute("data-live");
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, [text]);

  return (
    <div ref={root} className={s.mark} aria-hidden="true">
      <p className={s.word} data-word translate="no">
        {text}
      </p>
    </div>
  );
}
