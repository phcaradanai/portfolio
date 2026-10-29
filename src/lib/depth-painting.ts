/**
 * A picture that shifts with a depth map, in raw WebGL (one quad, one fragment shader).
 * Nearer pixels move more as `look` changes. Returns a stop function; resolves `null` if WebGL or loading fails,
 * in which case the static <img> underneath simply stays visible.
 */

const VERT = `attribute vec2 p; varying vec2 uv;
void main(){ uv = vec2(p.x * 0.5 + 0.5, 0.5 - p.y * 0.5); gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `precision highp float;
uniform sampler2D img; uniform sampler2D depth; uniform vec2 look; varying vec2 uv;
void main(){
  // Two-step parallax lookup: sample depth at the shifted position so edges do not smear.
  float d = texture2D(depth, uv).r;
  vec2 s = look * (d - 0.45) * 0.04;
  float d2 = texture2D(depth, uv - s).r;
  s = look * (d2 - 0.45) * 0.04;
  gl_FragColor = vec4(texture2D(img, clamp(uv - s, 0.003, 0.997)).rgb, 1.0);
}`;

function shader(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
  return s;
}

function load(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const i = new Image();
    i.decoding = "async";
    i.onload = () => res(i);
    i.onerror = () => rej(new Error(`load ${src}`));
    i.src = src;
  });
}

function texture(gl: WebGLRenderingContext, unit: number, img: HTMLImageElement) {
  const t = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}

export async function startDepthPainting(canvas: HTMLCanvasElement, imageSrc: string, depthSrc: string): Promise<(() => void) | null> {
  const gl = canvas.getContext("webgl", { alpha: false, antialias: false, powerPreference: "low-power" });
  if (!gl) return null;
  let images: HTMLImageElement[];
  try { images = await Promise.all([load(imageSrc), load(depthSrc)]); } catch { return null; }
  let program: WebGLProgram;
  try {
    program = gl.createProgram()!;
    gl.attachShader(program, shader(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, shader(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  } catch { return null; }
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(program, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  texture(gl, 0, images[0]!);
  texture(gl, 1, images[1]!);
  gl.uniform1i(gl.getUniformLocation(program, "img"), 0);
  gl.uniform1i(gl.getUniformLocation(program, "depth"), 1);
  const lookLoc = gl.getUniformLocation(program, "look");

  const target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
  const DRIFT_MS = 10_000, started = performance.now();
  let pointerAt = -1e9, raf = 0, visible = true, stopped = false;

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
  };
  const frame = (now: number) => {
    raf = 0;
    if (stopped) return;
    // One slow drift cycle after load shows the depth, then the painting rests until the pointer moves.
    const idle = now - pointerAt > 2500;
    if (idle && now - started < DRIFT_MS) { target.x = Math.sin((now - started) / 1600) * 0.7; target.y = Math.cos((now - started) / 2100) * 0.4; }
    else if (idle) { target.x = 0; target.y = 0; }
    cur.x += (target.x - cur.x) * 0.06;
    cur.y += (target.y - cur.y) * 0.06;
    resize();
    gl.uniform2f(lookLoc, cur.x, cur.y);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    const settled = Math.abs(target.x - cur.x) + Math.abs(target.y - cur.y) < 0.002;
    if (visible && !document.hidden && !(idle && now - started >= DRIFT_MS && settled)) raf = requestAnimationFrame(frame);
  };
  const kick = () => { if (!raf && !stopped && visible && !document.hidden) raf = requestAnimationFrame(frame); };

  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    target.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
    target.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    pointerAt = performance.now();
    kick();
  };
  const io = new IntersectionObserver(([e]) => { visible = !!e?.isIntersecting; kick(); });
  io.observe(canvas);
  const ro = new ResizeObserver(() => { resize(); kick(); });
  ro.observe(canvas);
  const onLost = (e: Event) => { e.preventDefault(); stop(); canvas.dataset.lost = "true"; };
  canvas.addEventListener("webglcontextlost", onLost);
  document.addEventListener("visibilitychange", kick);
  window.addEventListener("pointermove", onMove, { passive: true });

  function stop() {
    stopped = true;
    cancelAnimationFrame(raf);
    io.disconnect(); ro.disconnect();
    window.removeEventListener("pointermove", onMove);
    document.removeEventListener("visibilitychange", kick);
    canvas.removeEventListener("webglcontextlost", onLost);
  }
  resize();
  frame(performance.now());
  return stop;
}
