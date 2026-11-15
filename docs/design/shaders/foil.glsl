#ifdef GL_ES
precision mediump float;
#endif

// FERGIE TIME BOOKS · foil.glsl
// Shader EFFECT for display titles only. Recolours the rendered letters as
// prismatic thin-film foil with an embossed bevel. The letter shapes are never
// displaced: every fragment samples the content at its own coordinate.

/** @resolution */
uniform vec2 u_resolution;

/** @time */
uniform float u_time;

/** @mouse */
uniform vec2 u_mouse;

/** @label Content */
uniform sampler2D u_content;

/** @sdf */
uniform sampler2D u_sdf;

/**
 * @label Bevel width (px)
 * @default 3.0
 * @range 0.5, 12
 */
uniform float u_bevel;

/**
 * @label Foil strength
 * @default 0.85
 * @range 0, 1
 */
uniform float u_strength;

/**
 * @label Hue sweep speed
 * @default 0.04
 * @range 0, 0.3
 */
uniform float u_sweep;

/**
 * @label Scratches
 * @default 0.35
 * @range 0, 1
 */
uniform float u_scratch;

/**
 * @label Base tint
 * @color
 * @default #e8d9b8
 */
uniform vec3 u_tint;

float hash1(float n) { return fract(sin(n) * 43758.5453123); }
float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

vec3 film(float phase) {
  return 0.5 + 0.5 * cos(6.28318 * (phase + vec3(0.0, 0.33, 0.67)));
}

float scratchLine(vec2 px, float angle, float spacing, float seed) {
  vec2 d = vec2(cos(angle), sin(angle));
  float along = dot(px, d);
  float across = dot(px, vec2(-d.y, d.x));
  float row = floor(across / spacing);
  float h = hash1(row * 7.13 + seed);
  float on = step(0.93, h);
  float phase = hash1(row * 3.7 + seed + 1.0) * 400.0;
  float len = smoothstep(0.0, 40.0, mod(along + phase, 260.0)) * (1.0 - smoothstep(60.0, 120.0, mod(along + phase, 260.0)));
  float thin = 1.0 - smoothstep(0.0, 0.9, abs(fract(across / spacing) - 0.5) * spacing);
  return on * len * thin;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec4 src = texture2D(u_content, uv);
  if (src.a < 0.003) { gl_FragColor = vec4(0.0); return; }

  vec4 s = texture2D(u_sdf, uv);
  float dist = s.r;
  vec2 grad = s.gb;
  float glen = length(grad);
  vec2 gdir = glen > 1e-4 ? grad / glen : vec2(0.0);

  float bevel = 1.0 - smoothstep(0.0, u_bevel, dist);
  vec3 n = normalize(vec3(-gdir * bevel * 1.6, 1.0));

  vec2 m = (u_mouse / u_resolution) - 0.5;
  m = clamp(m, -0.6, 0.6);
  float t = u_time * u_sweep;
  vec3 l = normalize(vec3(m.x * 1.2 + 0.35 * sin(t * 2.1), m.y * 1.2 + 0.45, 1.1));
  float diff = max(dot(n, l), 0.0);
  vec3 h = normalize(l + vec3(0.0, 0.0, 1.0));
  float spec = pow(max(dot(n, h), 0.0), 36.0);

  float phase = uv.x * 1.6 - uv.y * 0.9 + t + dot(n.xy, vec2(0.9, 0.6)) * 0.7 + m.x * 0.5;
  vec3 iri = film(phase);
  vec3 iri2 = film(phase * 0.5 + 0.25 + bevel * 0.3);
  vec3 foil = mix(u_tint, mix(iri, iri2, 0.4), u_strength);

  vec3 base = src.rgb / src.a;
  vec3 col = mix(base, foil, u_strength);
  col *= 0.55 + 0.75 * diff;
  col += spec * (0.55 + 0.45 * iri);
  col += bevel * 0.12 * (1.0 - diff);

  vec2 px = gl_FragCoord.xy;
  float sc = scratchLine(px, 0.42, 7.0, 1.0) + scratchLine(px, -0.31, 11.0, 7.0) + scratchLine(px, 1.27, 15.0, 13.0);
  sc = clamp(sc, 0.0, 1.0) * u_scratch;
  float grain = (hash2(px) - 0.5) * 0.06 * u_scratch;
  col = mix(col, vec3(0.95), sc * 0.35);
  col += grain;

  col = clamp(col, 0.0, 1.0);
  gl_FragColor = vec4(col * src.a, src.a);
}
