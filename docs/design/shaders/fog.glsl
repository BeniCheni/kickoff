#ifdef GL_ES
precision mediump float;
#endif

/** @resolution */
uniform vec2 u_resolution;

/** @time */
uniform float u_time;

/**
 * @label Density
 * @default 0.55
 * @range 0, 1
 */
uniform float u_density;

/**
 * @label Fog Color
 * @color
 * @default #9fd8c4
 */
uniform vec3 u_color;

/**
 * @label Drift speed
 * @default 1.0
 * @range 0, 20
 */
uniform float u_speed;

/**
 * @label Grain
 * @default 0.05
 * @range 0, 0.3
 */
uniform float u_grain;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.02 + vec2(17.0, 9.0);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 p = vec2(uv.x * (u_resolution.x / u_resolution.y), uv.y) * 2.2;
  float t = u_time * 0.03 * u_speed;
  float warp = fbm(p * 1.7 - vec2(t * 0.6, 0.0));
  float f = fbm(p + vec2(t, t * 0.3) + warp);
  float band = clamp(1.0 - abs(uv.y - 0.5) * 1.5, 0.0, 1.0);
  float a = clamp((f - (1.0 - u_density)) * 1.9, 0.0, 1.0) * band;
  float g = hash(gl_FragCoord.xy + fract(u_time) * 97.0) * u_grain;
  float alpha = clamp(a * 0.55 + g, 0.0, 1.0);
  gl_FragColor = vec4(u_color * a * 0.55 + vec3(g), alpha);
}
