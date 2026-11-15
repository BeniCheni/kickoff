#ifdef GL_ES
precision mediump float;
#endif

// FERGIE TIME BOOKS · bloodpool.glsl
// Shader FILL. A 3D pool of blood seen in perspective under a torn sky:
// drops fall and ripple outward, the surface reflects the rift light with
// Fresnel falloff, distance fog eats the far shore, and three layers of mist
// waver in front with parallax. Slow and breathing. Numbers never go on it.

/** @resolution */
uniform vec2 u_resolution;

/** @time */
uniform float u_time;

/**
 * @label Blood
 * @color
 * @default #8e0f18
 */
uniform vec3 u_blood;

/**
 * @label Rift light
 * @color
 * @default #9dffc8
 */
uniform vec3 u_light;

/**
 * @label Mist
 * @color
 * @default #9fb8ad
 */
uniform vec3 u_mist;

/**
 * @label Mist density
 * @default 0.6
 * @range 0, 1
 */
uniform float u_mistDensity;

/**
 * @label Ripple strength
 * @default 1.0
 * @range 0, 2
 */
uniform float u_ripple;

/**
 * @label Speed
 * @default 1.0
 * @range 0, 3
 */
uniform float u_speed;

/**
 * @label Camera height
 * @default 0.55
 * @range 0.2, 1.5
 */
uniform float u_camH;

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
    p = p * 2.03 + vec2(11.0, 5.0);
    a *= 0.5;
  }
  return v;
}

float drop(vec2 p, vec2 c, float period, float phase, float t) {
  float lt = mod(t + phase, period);
  float d = length(p - c);
  float r = lt * 1.1;
  float ring = sin((d - r) * 22.0);
  float env = exp(-abs(d - r) * 2.6) * exp(-lt * 0.55) * smoothstep(0.0, 0.1, lt);
  return ring * env * 0.03;
}

float height(vec2 p, float t) {
  float h = 0.0;
  h += drop(p, vec2(0.35, -2.4), 7.0, 0.0, t);
  h += drop(p, vec2(-1.2, -3.6), 9.0, 3.1, t);
  h += drop(p, vec2(1.5, -4.8), 11.0, 6.4, t);
  h += drop(p, vec2(-0.45, -1.5), 8.0, 4.7, t);
  h += drop(p, vec2(0.9, -1.1), 10.0, 8.2, t);
  h += (fbm(p * 1.1 + vec2(t * 0.05, t * 0.03)) - 0.5) * 0.02;
  h += sin(p.x * 5.0 + t * 0.6) * sin(p.y * 3.0 - t * 0.45) * 0.004;
  return h * u_ripple;
}

vec3 sky(vec3 d, float t) {
  vec3 base = vec3(0.015, 0.008, 0.035);
  float column = exp(-abs(d.x) * 7.0) * smoothstep(-0.05, 0.5, d.y);
  float breath = 0.75 + 0.25 * sin(t * 0.35);
  vec3 col = base + u_light * column * 0.7 * breath;
  col += vec3(0.25, 0.10, 0.40) * exp(-abs(d.x) * 2.2) * smoothstep(-0.1, 0.4, d.y) * 0.35;
  vec2 sp = d.xz / max(d.y, 0.05);
  float stars = step(0.985, hash(floor(sp * 30.0))) * smoothstep(0.1, 0.5, d.y);
  col += vec3(0.8, 0.9, 1.0) * stars * (0.6 + 0.4 * sin(t * 1.3 + hash(floor(sp * 30.0)) * 6.28));
  return col;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 q = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
  float t = u_time * u_speed;

  vec3 ro = vec3(0.0, u_camH, 0.0);
  float pitch = -0.22;
  vec3 fwd = normalize(vec3(0.0, sin(pitch), -cos(pitch)));
  vec3 right = vec3(1.0, 0.0, 0.0);
  vec3 up = cross(right, fwd);
  vec3 rd = normalize(fwd * 1.4 + right * q.x + up * q.y);

  vec3 col;
  float dist = 60.0;
  if (rd.y < -0.001) {
    float tt = -ro.y / rd.y;
    dist = tt;
    vec3 p = ro + rd * tt;
    vec2 xz = p.xz;
    float e = 0.02;
    float h = height(xz, t);
    float hx = height(xz + vec2(e, 0.0), t);
    float hz = height(xz + vec2(0.0, e), t);
    vec3 n = normalize(vec3(-(hx - h) / e * 2.4, 1.0, -(hz - h) / e * 2.4));

    vec3 r = reflect(rd, n);
    vec3 env = sky(r, t);
    float cosT = max(dot(-rd, n), 0.0);
    float fres = 0.03 + 0.97 * pow(1.0 - cosT, 5.0);

    vec3 L = normalize(vec3(0.0, 1.0, -0.35));
    float spec = pow(max(dot(r, L), 0.0), 160.0);
    float sheen = pow(max(dot(r, L), 0.0), 12.0);

    vec3 blood = u_blood * (0.7 + 0.5 * cosT);
    blood *= 0.75 + 0.25 * fbm(xz * 0.8 + 3.0);
    vec3 surf = mix(blood, env, clamp(fres * 0.8 + 0.22, 0.0, 1.0));
    surf += u_light * spec * 1.8 + u_light * sheen * 0.14;
    float rip = pow(max(dot(n, normalize(vec3(0.0, 0.55, 0.85))), 0.0), 48.0);
    surf += u_light * rip * 0.35 + u_blood * rip * 0.6;
    surf += u_blood * 0.6 * pow(max(dot(n, normalize(vec3(0.4, 1.0, 0.3))), 0.0), 3.0) * 0.4;

    float fog = 1.0 - exp(-tt * 0.07);
    vec3 fogCol = mix(u_mist * 0.30, u_light * 0.16, 0.35);
    col = mix(surf, fogCol, fog);
  } else {
    col = sky(rd, t);
    float hz = smoothstep(0.0, 0.08, rd.y);
    col = mix(mix(u_mist * 0.30, u_light * 0.16, 0.35), col, hz);
  }

  float horizon = 0.5 + (-fwd.y * 1.4 / up.y);
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float scale = 2.2 + fi * 1.3;
    float speed = 0.035 + fi * 0.02;
    vec2 mp = vec2(uv.x * scale + t * speed + fi * 13.0, uv.y * (1.6 + fi * 0.4) + fi * 7.0);
    vec2 warp = vec2(fbm(mp * 1.3 - t * 0.02), fbm(mp * 1.1 + t * 0.015)) - 0.5;
    float m = fbm(mp + warp * 0.9);
    float band = exp(-pow((uv.y - horizon + 0.06 - fi * 0.12) / (0.22 + fi * 0.05), 2.0));
    float a = u_mistDensity * band * smoothstep(0.42, 0.8, m) * (0.5 - fi * 0.12);
    vec3 mc = u_mist * (0.5 + 0.6 * m) + u_light * 0.25 * exp(-abs(uv.x - 0.5) * 4.0) * m;
    col = mix(col, mc, clamp(a, 0.0, 1.0));
  }

  float vig = smoothstep(1.25, 0.35, length(q * vec2(0.9, 1.3)));
  col *= 0.72 + 0.28 * vig;
  col += (hash(gl_FragCoord.xy + fract(t) * 41.0) - 0.5) * 0.035;
  col = 1.0 - exp(-col * 1.9);
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
