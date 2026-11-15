#ifdef GL_ES
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
#endif

// FERGIE TIME BOOKS · blood-burst.glsl
// Shader EFFECT for display titles only. The letters charge up dark red and
// blow: a radial shock pulls a red ghost off the glyphs, droplets spray out and
// arc down under gravity, land as splats that dry and fade, and a pool spreads
// under the baseline. Between bursts a dark halo throbs to a heartbeat.
// The letters are composited last: spray, ghost, pool and halo sit behind or
// around them and never cover a letter's core. The letters' own shake is
// capped at 2 px. Time zero (the export frame, and the frame reduced motion
// freezes on) is the calm middle of the period; the burst fires half a period
// later.

/** @resolution */
uniform vec2 u_resolution;

/** @time */
uniform float u_time;

/** @label Content */
uniform sampler2D u_content;

/**
 * @label Blood
 * @color
 * @default #8e0f18
 */
uniform vec3 u_blood;

/**
 * @label Fresh blood
 * @color
 * @default #d41f2a
 */
uniform vec3 u_fresh;

/**
 * @label Burst every (s)
 * @default 7.0
 * @range 2, 20
 */
uniform float u_period;

/**
 * @label Spray reach (px)
 * @default 34.0
 * @range 10, 120
 */
uniform float u_reach;

/**
 * @label Heartbeat (bpm)
 * @default 52.0
 * @range 20, 120
 */
uniform float u_bpm;

/**
 * @label Speed
 * @default 1.0
 * @range 0, 3
 */
uniform float u_speed;

/**
 * @label Seek (s)
 * @default 0.0
 * @range 0, 60
 */
uniform float u_seek;

float hash1(float n) { return fract(sin(n) * 43758.5453123); }
float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

vec4 content(vec2 px) { return texture2D(u_content, px / u_resolution); }
float letter(vec2 px) { return smoothstep(0.1, 0.35, content(px).a); }

void main() {
  vec2 px = gl_FragCoord.xy;
  vec2 res = u_resolution;
  vec2 center = res * 0.5;
  float t = (u_time + u_seek) * u_speed;
  float tc = t + u_period * 0.5;
  float cycle = mod(floor(tc / u_period), 64.0);
  float ph = fract(tc / u_period);
  float ex = clamp(ph * u_period / 1.1, 0.0, 1.0);
  float eo = 1.0 - pow(1.0 - ex, 3.0);
  float shock = ex < 1.0 ? pow(1.0 - ex, 2.0) : 0.0;
  float charge = smoothstep(0.85, 1.0, ph);
  float w = u_bpm / 60.0 * 6.2831853 * (1.0 + charge * 0.6);
  float beat = pow(max(sin(t * w), 0.0), 10.0) + 0.55 * pow(max(sin(t * w - 0.9), 0.0), 16.0);

  float tq = mod(floor(t * 14.0), 1024.0);
  float row = floor(px.y / 3.0);
  float dx = (hash2(vec2(row, tq)) - 0.5) * 2.0 * (charge * 1.0 + shock * 1.5) * step(0.5, hash2(vec2(row + 5.0, tq)));
  vec2 p = px + vec2(dx, 0.0);
  vec2 rc = p - center;
  float rl = length(rc);
  vec2 dirc = rl > 1e-3 ? rc / rl : vec2(0.0, 1.0);

  vec2 shake = vec2(dx, 0.0) - dirc * shock * 2.0;
  float sl = length(shake);
  if (sl > 2.0) shake *= 2.0 / sl;
  vec2 lp = px + shake;
  vec4 src = content(lp);
  float aL = letter(lp);
  vec3 base = src.a > 0.001 ? src.rgb / src.a : vec3(1.0);
  float tint = clamp(charge * 0.3 + shock * 0.25, 0.0, 0.4);
  vec3 letterCol = mix(base, u_blood, tint);
  letterCol += u_fresh * tint * 0.5 * pow(max(sin(lp.y * 0.7 + lp.x * 0.2 + t * 0.5), 0.0), 6.0);
  letterCol += u_fresh * shock * 0.25;

  float aG = letter(p - dirc * shock * 10.0) * shock * 0.6;
  vec3 ghostCol = u_fresh;

  vec3 sprayCol = vec3(0.0);
  float sprayA = 0.0;
  float splatFade = 1.0 - smoothstep(0.55, 0.98, ph);
  for (int i = 0; i < 28; i++) {
    float fi = float(i) + cycle * 31.0;
    float h1 = hash1(fi * 1.37 + 0.3);
    float h2 = hash1(fi * 2.71 + 0.7);
    float h3 = hash1(fi * 3.91 + 1.1);
    float h4 = hash1(fi * 5.13 + 1.9);
    vec2 origin = center + (vec2(h1, h2) - 0.5) * res * vec2(0.9, 0.6);
    float ang = h3 * 6.2831853;
    vec2 dir = vec2(cos(ang), sin(ang));
    float sp = u_reach * (0.35 + 0.65 * h4);
    vec2 pos = origin + dir * sp * eo - vec2(0.0, 16.0 * ex * ex);
    float r = (0.9 + 2.2 * hash1(fi * 7.7)) * (1.0 - 0.3 * ex);
    vec2 d = px - pos;
    vec2 vel = dir * sp * 3.0 * pow(1.0 - ex, 2.0) - vec2(0.0, 36.0 * ex);
    float vl = length(vel);
    vec2 vd = vl > 1e-3 ? vel / vl : vec2(1.0, 0.0);
    float along = dot(d, vd);
    float across = dot(d, vec2(-vd.y, vd.x));
    float stretch = 1.0 + min(vl * 0.03, 3.0) * (1.0 - ex);
    float dist = length(vec2(along / stretch, across));
    float rr = r * (1.0 + 0.35 * ex) * (1.0 + 0.1 * sin(atan(d.y, d.x) * 7.0 + fi) * ex + 0.08 * sin(atan(d.y, d.x) * 3.0 - fi) * ex);
    float a = (1.0 - smoothstep(rr - 0.7, rr + 0.5, dist)) * mix(1.0, splatFade, ex);
    if (a > sprayA) {
      sprayA = a;
      float dark = hash1(fi * 9.9);
      vec3 cc = mix(u_fresh, u_blood, dark * 0.6 + 0.4 * ph);
      cc += vec3(0.5, 0.2, 0.18) * pow(max(1.0 - dist / max(rr, 0.1), 0.0), 3.0) * 0.6 * (1.0 - ph * 0.6);
      sprayCol = cc;
    }
  }

  float poolGrow = smoothstep(0.04, 0.6, ph) * (1.0 - smoothstep(0.75, 0.98, ph));
  vec2 pc = vec2(center.x, -3.0);
  float wob = 1.0 + 0.25 * sin(px.x * 0.21 + cycle) + 0.15 * sin(px.x * 0.57 + 2.0 + cycle * 3.0) + 0.1 * sin(px.x * 1.3 + cycle * 5.0);
  vec2 prad = vec2(res.x * 0.58, 6.5 * wob) * max(poolGrow, 1e-3);
  float pn = length((px - pc) / prad);
  float poolA = (1.0 - smoothstep(0.88, 1.05, pn)) * step(0.01, poolGrow);
  vec3 poolCol = u_blood * (0.85 + 0.15 * (1.0 - pn)) + vec3(0.4, 0.15, 0.12) * pow(max(1.0 - abs(px.y - pc.y - prad.y * 0.35) / 1.5, 0.0), 2.0) * 0.6;

  float halo = 0.0;
  for (int i = 0; i < 8; i++) {
    float a = float(i) * 0.7853982;
    vec2 dd = vec2(cos(a), sin(a));
    halo += letter(p + dd * 5.0) * 0.6;
    halo += letter(p + dd * 12.0) * 0.4;
  }
  halo /= 8.0;
  float haloStrength = (0.3 + 0.7 * beat) * 0.8 + shock * 1.2;
  float haloA = clamp(halo * haloStrength, 0.0, 1.0);
  vec3 col = mix(u_blood, u_fresh, shock) * haloA;
  float alpha = haloA;

  col = poolCol * poolA + col * (1.0 - poolA);
  alpha = poolA + alpha * (1.0 - poolA);

  col = sprayCol * sprayA + col * (1.0 - sprayA);
  alpha = sprayA + alpha * (1.0 - sprayA);

  col = ghostCol * aG + col * (1.0 - aG);
  alpha = aG + alpha * (1.0 - aG);

  col = letterCol * aL + col * (1.0 - aL);
  alpha = aL + alpha * (1.0 - aL);

  col = min(col, vec3(alpha));
  gl_FragColor = vec4(col, alpha);
}
