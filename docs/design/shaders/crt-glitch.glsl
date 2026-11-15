#ifdef GL_ES
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
#endif

// FERGIE TIME BOOKS · crt-glitch.glsl
// Shader EFFECT for display titles only. Pair it with an outer shadow in the
// neon colour placed BEFORE it in the effect list: the shadow is the glow, the
// shader keeps the letters a crisp near-white core on top of it. Most of the
// time nothing else happens. In short bursts the signal tears into shifted
// rows, a blood-red and a green ghost pull off the glyphs, scanlines and static
// cut through, and now and then, inside a burst only, the picture dims.
// Letters only ever shift sideways, never bend.

/** @resolution */
uniform vec2 u_resolution;

/** @time */
uniform float u_time;

/** @label Content */
uniform sampler2D u_content;

/**
 * @label Neon
 * @color
 * @default #9dffc8
 */
uniform vec3 u_neon;

/**
 * @label Ghost
 * @color
 * @default #b3121b
 */
uniform vec3 u_ghost;

/**
 * @label Glitch amount
 * @default 1.0
 * @range 0, 2
 */
uniform float u_amount;

/**
 * @label Speed
 * @default 1.0
 * @range 0, 3
 */
uniform float u_speed;

/**
 * @label Scanlines
 * @default 0.4
 * @range 0, 1
 */
uniform float u_scan;

/**
 * @label Seek (s)
 * @default 0.0
 * @range 0, 60
 */
uniform float u_seek;

float hash1(float n) { return fract(sin(n) * 43758.5453123); }
float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

float alphaAt(vec2 px) { return texture2D(u_content, px / u_resolution).a; }
float core(vec2 px) { return smoothstep(0.55, 0.85, alphaAt(px)); }

void main() {
  vec2 px = gl_FragCoord.xy;
  float t = (u_time + u_seek) * u_speed;
  float tq = mod(floor(t * 15.0), 1024.0);
  float win = mod(floor(t * 1.6), 512.0);
  float burst = step(0.78, hash1(win * 3.17 + 1.85)) * u_amount;

  float sliceH = 2.0 + floor(hash1(win + 7.0) * 3.0);
  float row = floor(px.y / sliceH);
  float rh = hash2(vec2(row, tq));
  float dir = sign(hash2(vec2(row * 1.7, tq + 3.0)) - 0.5);
  float dx = dir * burst * step(0.8, rh) * (1.0 + 1.5 * hash2(vec2(row, tq + 9.0)));
  float band = floor(px.y / (sliceH * 3.0));
  float bandPick = floor(hash1(win * 5.3 + 1.0) * 6.0);
  float big = step(0.5, hash1(win * 7.9 + 2.0)) * step(0.7, hash1(tq * 0.61 + 4.0)) * burst * (1.0 - step(0.5, abs(band - bandPick)));
  dx += big * (hash1(win * 2.3 + 6.0) - 0.5) * 8.0;
  vec2 p = px + vec2(dx, 0.0);

  float a = alphaAt(p);
  float aC = smoothstep(0.55, 0.85, a);
  float pulse = 0.85 + 0.15 * sin(t * 2.6) + burst * 0.2 * hash1(tq);
  float glowA = clamp(a / 0.6, 0.0, 1.0) * (1.0 - aC) * pulse;
  vec3 col = u_neon * glowA;
  float alpha = glowA;

  float split = 1.0 + 1.5 * hash1(win * 4.1 + 3.0);
  float aR = core(p + vec2(split, 0.0)) * burst;
  float aB = core(p - vec2(split, 0.0)) * burst;
  vec3 ghost = u_ghost * aR + u_neon * aB;
  float ghostA = clamp(max(aR, aB) * 0.9, 0.0, 1.0);
  col = ghost * 0.9 + col * (1.0 - ghostA);
  alpha = ghostA + alpha * (1.0 - ghostA);

  vec3 coreCol = mix(u_neon, vec3(1.0), 0.85);
  col = coreCol * aC + col * (1.0 - aC);
  alpha = aC + alpha * (1.0 - aC);

  float scan = 1.0 - burst * u_scan * 0.5 * (0.5 + 0.5 * sin(px.y * 3.14159));
  float track = exp(-pow((fract(px.y / 80.0 + t * 0.12) - 0.5) * 7.0, 2.0));
  col *= scan * (1.0 + 0.25 * track * glowA);

  float stat = step(0.985, hash2(floor(px / 2.0) + tq)) * burst;
  col += vec3(1.0) * stat * alpha * 0.7;
  // The dim is gated to the glitch window (burst carries u_amount and is 0
  // outside it), so nothing dims between bursts.
  float dim = 1.0 - 0.45 * step(0.97, hash1(tq * 0.37 + 2.0)) * burst;
  col *= dim;

  col = min(col, vec3(alpha));
  gl_FragColor = vec4(col, alpha);
}
