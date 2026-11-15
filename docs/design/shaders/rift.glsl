#ifdef GL_ES
precision mediump float;
#endif

// FERGIE TIME BOOKS · rift.glsl
// Shader FILL. A vertical seam of torn sky with no hard silhouette anywhere:
// the opening is a soft density, feathered into the clouds with 2D noise,
// crossed by a few cloud wisps that pass in front of it, and tapered to a
// hairline at both ends. Inside: a black-violet void with drifting stars, a
// few pulsing in unison, a slow spiral and rift-green light bleeding out.
// Place it over the sky of cover art with blendMode "screen". Slow, breathing.

/** @resolution */
uniform vec2 u_resolution;

/** @time */
uniform float u_time;

/**
 * @label Seam position (0..1)
 * @default 0.56
 * @range 0, 1
 */
uniform float u_center;

/**
 * @label Seam width
 * @default 0.09
 * @range 0.01, 0.4
 */
uniform float u_width;

/**
 * @label Seam top (0..1 from bottom)
 * @default 1.05
 * @range 0.2, 1.2
 */
uniform float u_top;

/**
 * @label Seam bottom (0..1 from bottom)
 * @default 0.42
 * @range -0.2, 0.9
 */
uniform float u_bottom;

/**
 * @label Rift light
 * @color
 * @default #9dffc8
 */
uniform vec3 u_glow;

/**
 * @label Void
 * @color
 * @default #0a0314
 */
uniform vec3 u_void;

/**
 * @label Void tint
 * @color
 * @default #38145c
 */
uniform vec3 u_tint;

/**
 * @label Glow reach
 * @default 0.22
 * @range 0.02, 0.8
 */
uniform float u_reach;

/**
 * @label Breath speed
 * @default 0.35
 * @range 0, 2
 */
uniform float u_breath;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(13.0, 7.0);
    a *= 0.5;
  }
  return v;
}

float stars(vec2 p, float density, float t, out float uni) {
  vec2 cell = floor(p);
  vec2 f = fract(p);
  float h = hash(cell);
  vec2 c = vec2(hash(cell + 1.3), hash(cell + 5.7));
  float d = length(f - c);
  float on = step(1.0 - density, h);
  float r = 0.08 + hash(cell + 9.1) * 0.14;
  float s = on * smoothstep(r, 0.0, d);
  uni = step(0.72, hash(cell + 2.2));
  float tw = 0.75 + 0.25 * sin(t * (1.5 + hash(cell + 3.3) * 2.0) + h * 6.28);
  return s * tw;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  float t = u_time;
  float breath = 0.5 + 0.5 * sin(t * u_breath);
  float pulse = 0.35 + 0.65 * pow(0.5 + 0.5 * sin(t * 0.9), 3.0);
  vec2 q = vec2(uv.x * aspect, uv.y);

  float span = max(u_top - u_bottom, 0.01);
  float v = clamp((uv.y - u_bottom) / span, 0.0, 1.0);
  float s = sin(v * 3.14159);
  float taper = pow(s, 1.3);
  float ends = smoothstep(0.0, 0.22, s);

  float wob = fbm(vec2(uv.y * 5.0 + t * 0.05, 3.1)) - 0.5;
  float cx = u_center + wob * 0.07 * ends;
  float halfW = u_width * (0.012 + taper) * (0.85 + 0.3 * breath);

  float n1 = fbm(q * vec2(7.0, 4.5) + vec2(2.0, t * 0.02)) - 0.5;
  float n2 = fbm(q * vec2(26.0, 17.0) - vec2(t * 0.015, 0.0)) - 0.5;
  float n3 = noise(q * vec2(70.0, 48.0)) - 0.5;
  float dx = abs(uv.x - cx) * aspect;
  float d = dx + (n1 * 1.5 + n2 * 0.8 + n3 * 0.25) * halfW;
  float nd = d / max(halfW, 1e-4);

  float open = 1.0 - smoothstep(0.2, 1.3, nd);
  open *= ends;

  float wf = fbm(vec2(q.x * 2.4 - t * 0.012, q.y * 8.0 + 4.0) + vec2(n1 * 0.8, 0.0));
  float wisp = smoothstep(0.56, 0.74, wf);
  float wispThin = smoothstep(0.42, 0.6, fbm(vec2(q.x * 5.0 + t * 0.02, q.y * 21.0 + 9.0)));
  float veil = clamp(wisp * 0.85 + wispThin * 0.12, 0.0, 0.9);
  open *= 1.0 - veil;

  vec2 sp = (uv - vec2(cx, (u_top + u_bottom) * 0.5)) * vec2(aspect, 1.0);
  float ang = atan(sp.y, sp.x);
  float rad = length(sp) + 0.02;
  float spiral = 0.5 + 0.5 * sin(ang * 3.0 + log(rad) * 6.0 - t * 0.12);
  spiral = pow(spiral, 3.0) * smoothstep(0.6, 0.05, rad);

  vec2 drift = vec2(t * 0.004, -t * 0.0025);
  float u1; float u2;
  float s1 = stars((uv + drift) * vec2(aspect, 1.0) * 30.0, 0.22, t, u1);
  float s2 = stars((uv * 1.7 - drift * 0.6) * vec2(aspect, 1.0) * 18.0, 0.16, t, u2);
  float st = s1 * 1.2 * mix(1.0, pulse, u1) + s2 * 1.5 * mix(1.0, pulse, u2);

  vec3 violet = u_tint;
  vec3 voidCol = u_void + violet * spiral * 0.5 + violet * 0.2 * fbm(uv * 5.0 + t * 0.01);
  voidCol += vec3(0.85, 0.9, 1.0) * st * smoothstep(0.25, 0.7, open);

  float rim = smoothstep(0.0, 0.45, open) * (1.0 - smoothstep(0.45, 0.95, open));
  vec3 iri = 0.5 + 0.5 * cos(6.28318 * (nd * 0.6 + uv.y * 3.0 + t * 0.05 + vec3(0.0, 0.33, 0.67)));
  vec3 rimCol = mix(u_glow, iri, 0.25) * rim * 0.3 * (0.7 + 0.3 * breath);
  vec3 inside = voidCol + rimCol + u_glow * 0.04 * open;

  float reach = u_reach * (0.8 + 0.5 * breath) * (0.15 + 0.85 * sqrt(taper));
  float glowD = max(d - halfW * 0.5, 0.0);
  float glow = exp(-glowD / max(reach, 1e-3) * 3.0);
  glow *= 0.5 + 0.5 * fbm(vec2(q.y * 9.0 + t * 0.04, q.x * 5.0));
  float haze = exp(-glowD / max(reach * 2.5, 1e-3) * 3.0) * 0.18;
  float glowA = clamp((glow * 0.7 + haze) * ends * sqrt(taper + 0.02) * (1.0 - veil * 0.6), 0.0, 1.0);

  float alpha = clamp(open + glowA * (1.0 - open), 0.0, 1.0);
  vec3 col = inside * open + u_glow * glowA * (1.0 - open);
  gl_FragColor = vec4(min(col, vec3(alpha)), alpha);
}
