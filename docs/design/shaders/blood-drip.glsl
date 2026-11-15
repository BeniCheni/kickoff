#ifdef GL_ES
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
#endif

// FERGIE TIME BOOKS · blood-drip.glsl
// Shader EFFECT for display titles only. The letters bleed: a wet film climbs
// each glyph from its bottom edge, blood runs off the baseline in slow drips
// that swell, let go and fall, and a dark red halo throbs to a heartbeat.
// Letter shapes are kept; thin rows only flinch a pixel sideways on the beat.

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
 * @label Drip length (px)
 * @default 36.0
 * @range 6, 80
 */
uniform float u_length;

/**
 * @label Drip density
 * @default 0.5
 * @range 0, 1
 */
uniform float u_density;

/**
 * @label Heartbeat (bpm)
 * @default 48.0
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

float upDist(vec2 px) {
  float d = -1.0;
  for (int i = 1; i <= 24; i++) {
    float k = float(i) * 2.0;
    if (d < 0.0 && letter(px + vec2(0.0, k)) > 0.5) d = k;
  }
  return d;
}

float blockedBelow(vec2 px) {
  float b = 0.0;
  for (int i = 1; i <= 5; i++) {
    b = max(b, step(0.5, letter(px - vec2(0.0, float(i) * 2.0))));
  }
  return b;
}

void main() {
  vec2 px = gl_FragCoord.xy;
  float t = (u_time + u_seek) * u_speed;
  float w = u_bpm / 60.0 * 6.2831853;
  float beat = pow(max(sin(t * w), 0.0), 10.0) + 0.55 * pow(max(sin(t * w - 0.9), 0.0), 16.0);

  float row = floor(px.y / 3.0);
  float tq = mod(floor(t * 12.0), 1024.0);
  float dx = (hash2(vec2(row, tq)) - 0.5) * 3.0 * step(0.6, hash2(vec2(row + 5.0, tq))) * beat;
  vec2 p = px + vec2(dx, 0.0);

  vec4 src = content(p);
  float aL = letter(p);
  vec3 base = src.a > 0.001 ? src.rgb / src.a : vec3(1.0);

  float downD = -1.0;
  for (int i = 1; i <= 8; i++) {
    float k = float(i) * 1.5;
    if (downD < 0.0 && letter(p - vec2(0.0, k)) < 0.5) downD = k;
  }
  float film = downD < 0.0 ? 0.0 : (1.0 - smoothstep(0.0, 12.0, downD));
  float colSeed = hash1(floor(p.x / 4.0) * 1.31);
  film *= 0.55 + 0.45 * colSeed;
  film = clamp(film + 0.06 + 0.12 * beat, 0.0, 1.0);
  vec3 wet = mix(u_fresh, u_blood, smoothstep(0.0, 12.0, max(downD, 0.0)));
  vec3 letterCol = mix(base, wet, film * 0.9);
  letterCol += vec3(0.35, 0.12, 0.1) * film * pow(max(sin(p.y * 0.9 + p.x * 0.15 + t * 0.4), 0.0), 8.0);

  float colW = 4.0;
  vec3 dripCol = vec3(0.0);
  float dripA = 0.0;
  if (aL < 0.5) {
    for (int j = -1; j <= 1; j++) {
      float c = floor(px.x / colW) + float(j);
      float sx = (c + 0.5) * colW;
      float on = step(1.0 - u_density, hash1(c * 7.31 + 1.0));
      if (on < 0.5) continue;
      vec2 cp = vec2(sx, px.y);
      float d = upDist(cp);
      if (d < 0.0) continue;
      if (blockedBelow(cp) > 0.5) continue;
      float seed = hash1(c * 3.7 + 2.0);
      float Lmax = u_length * (0.35 + 0.65 * hash1(c * 5.3 + 4.0));
      float phase = fract(t * (0.03 + 0.03 * seed) + hash1(c * 9.1));
      float grow = smoothstep(0.0, 0.78, phase);
      float falling = step(0.78, phase);
      float fall = clamp((phase - 0.78) / 0.22, 0.0, 1.0);
      float L = mix(Lmax * grow, Lmax * 0.3, falling);
      float rel = d / max(L, 1.0);
      float hw = colW * 0.5 * (0.9 - 0.5 * rel);
      float xd = abs(px.x - sx);
      float body = (1.0 - smoothstep(hw - 0.8, hw + 0.4, xd)) * step(d, L) * step(2.0, L);
      vec2 tip = vec2(sx, px.y + d - L);
      float r = 2.0 + 1.3 * grow;
      float bulb = (1.0 - smoothstep(r - 0.8, r + 0.5, length(px - tip))) * (1.0 - falling) * step(2.0, L);
      float dropY = px.y + d - Lmax - fall * fall * 70.0;
      float dropA = (1.0 - smoothstep(1.6, 2.9, length(px - vec2(sx, dropY)))) * falling * (1.0 - smoothstep(0.6, 1.0, fall));
      float a = max(max(body, bulb), dropA);
      if (a > dripA) {
        float shade = 0.6 + 0.4 * (1.0 - clamp(rel, 0.0, 1.0));
        vec3 cc = mix(u_blood, u_fresh, 0.3 + 0.3 * grow) * shade;
        float hl = 1.0 - smoothstep(0.0, 1.0, abs(px.x - (sx - hw * 0.45)));
        cc += vec3(0.45, 0.18, 0.16) * hl * body;
        cc += vec3(0.5, 0.2, 0.18) * pow(max(1.0 - length(px - tip - vec2(-0.8, 0.8)) / r, 0.0), 2.0) * bulb;
        dripCol = cc;
        dripA = a;
      }
    }
  }

  float halo = 0.0;
  for (int i = 0; i < 8; i++) {
    float a = float(i) * 0.7853982;
    vec2 dd = vec2(cos(a), sin(a));
    halo += letter(p + dd * 5.0) * 0.6;
    halo += letter(p + dd * 11.0) * 0.4;
  }
  halo /= 8.0;
  float haloA = clamp(halo, 0.0, 1.0) * (0.3 + 0.7 * beat) * 0.85;
  vec3 col = u_blood * haloA;
  float alpha = haloA;

  col = dripCol * dripA + col * (1.0 - dripA);
  alpha = dripA + alpha * (1.0 - dripA);

  col = letterCol * aL + col * (1.0 - aL);
  alpha = aL + alpha * (1.0 - aL);

  col = min(col, vec3(alpha));
  gl_FragColor = vec4(col, alpha);
}
