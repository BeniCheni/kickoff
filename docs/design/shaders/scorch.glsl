#ifdef GL_ES
precision mediump float;
#endif

// FERGIE TIME BOOKS · scorch.glsl
// Shader FILL. The burnt bottom edge of a page: clear at the top, the paper
// browns, then chars to black along a ragged edge, with a few burnt pinholes
// and a trace of rift light from below. Static: there is no time uniform, so
// paper never moves. Use it on an empty strip under the last row of a page;
// never put a figure on it.

/** @resolution */
uniform vec2 u_resolution;

/**
 * @label Char
 * @color
 * @default #0a0a0c
 */
uniform vec3 u_char;

/**
 * @label Scorch
 * @color
 * @default #3a2410
 */
uniform vec3 u_scorch;

/**
 * @label Rift light
 * @color
 * @default #9dffc8
 */
uniform vec3 u_glow;

/**
 * @label Edge height (0..1 from bottom)
 * @default 0.42
 * @range 0.05, 0.9
 */
uniform float u_edge;

/**
 * @label Raggedness
 * @default 0.5
 * @range 0, 1
 */
uniform float u_ragged;

/**
 * @label Scorch reach
 * @default 0.5
 * @range 0.05, 1
 */
uniform float u_reach;

/**
 * @label Rift light amount
 * @default 0.12
 * @range 0, 1
 */
uniform float u_light;

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
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(13.0, 7.0);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 px = gl_FragCoord.xy;
  vec2 uv = px / u_resolution;
  float h = u_resolution.y;

  float rag = (fbm(vec2(px.x / 46.0, 2.7)) - 0.5) * 0.55 + (fbm(vec2(px.x / 9.0, 8.1)) - 0.5) * 0.16;
  float edge = u_edge + rag * u_ragged;
  float d = uv.y - edge;

  float charA = 1.0 - smoothstep(-1.5 / h, 2.5 / h, d);

  float mott = 0.55 + 0.9 * fbm(px / 22.0 + vec2(4.0, 1.0));
  float topFade = 1.0 - smoothstep(0.55, 1.0, uv.y);
  float sc = exp(-max(d, 0.0) / max(u_reach * 0.5, 1e-3)) * mott * topFade;
  sc = clamp(sc, 0.0, 0.92);

  float cell = hash(floor(px / 7.0));
  vec2 hc = (floor(px / 7.0) + vec2(hash(floor(px / 7.0) + 3.1), hash(floor(px / 7.0) + 7.7))) * 7.0;
  float hole = step(0.93, cell) * (1.0 - smoothstep(0.8, 2.2, length(px - hc))) * smoothstep(0.35, 0.0, d) * step(0.0, d);
  sc = max(sc, hole * 0.9);

  float rim = exp(-abs(d) * h / 3.0) * 0.5;
  vec3 scCol = mix(u_scorch, u_char, clamp(sc * 0.8 + rim, 0.0, 1.0));

  float light = u_light * smoothstep(0.5, 0.0, uv.y) * (0.6 + 0.4 * fbm(px / 30.0));
  vec3 charCol = u_char + u_glow * light * 0.35;

  float a = charA + sc * (1.0 - charA);
  vec3 col = charCol * charA + scCol * sc * (1.0 - charA);
  gl_FragColor = vec4(col, a);
}
