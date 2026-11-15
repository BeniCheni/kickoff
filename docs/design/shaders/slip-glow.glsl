#ifdef GL_ES
precision mediump float;
#endif

// FERGIE TIME BOOKS · slip-glow.glsl
// Shader FILL, screen blend, for a photograph only (B7 · The Accumulator): the
// betting slip on the table glows faintly from inside, white-green, as if the
// paper itself were lit. The glow is a soft ellipse that breathes once every
// eight seconds or so and never flickers; a faint paper grain drifts through it.
// It is the crossing in reverse: light that rises instead of fire that takes.
// It sits under the scrim and the title, and never over a figure (rule 5).
// Still = 1 holds one moment (motion off).

/** @resolution */
uniform vec2 u_resolution;

/** @time */
uniform float u_time;

/**
 * @label Centre of the slip (0..1, from the bottom left)
 */
uniform vec2 u_center;

/**
 * @label Size of the glow (share of the width, across and up)
 */
uniform vec2 u_size;

/**
 * @label Tilt of the slip (degrees)
 * @default 0.0
 * @range -90, 90
 */
uniform float u_tilt;

/**
 * @label Strength
 * @default 0.55
 * @range 0, 1
 */
uniform float u_strength;

/**
 * @label Core colour
 * @color
 * @default #F2FFF6
 */
uniform vec3 u_core;

/**
 * @label Halo colour
 * @color
 * @default #9DFFC8
 */
uniform vec3 u_halo;

/**
 * @label Still (motion off)
 * @default 0.0
 * @range 0, 1
 */
uniform float u_still;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

void main() {
  vec2 px = gl_FragCoord.xy;
  float t = u_still > 0.5 ? 0.0 : u_time;
  vec2 d = (px - u_center * u_resolution) / u_resolution.x;
  float a = radians(u_tilt);
  d = vec2(d.x * cos(a) + d.y * sin(a), -d.x * sin(a) + d.y * cos(a));
  float r = length(d / max(u_size, vec2(0.001)));
  float breathe = 0.8 + 0.2 * sin(t * 0.78);
  float grain = 0.85 + 0.3 * noise(px / 9.0 + vec2(t * 0.05, -t * 0.03));
  float core = exp(-r * r * 2.2) * grain;
  float halo = exp(-r * 0.9) * 0.45;
  vec3 col = (u_core * core + u_halo * halo) * u_strength * breathe;
  float al = clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0);
  gl_FragColor = vec4(min(col, vec3(al)), al);
}
