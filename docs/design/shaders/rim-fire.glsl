#ifdef GL_ES
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
#endif

// FERGIE TIME BOOKS · rim-fire.glsl
// Shader EFFECT for a "Rim mask": a frame holding only plain rectangles that
// match the silhouettes of the rack's faces, laid over them, with no text in
// it. The rectangles are not drawn. What is drawn is real fire in the wrong
// colours, with a physical source: it burns in a bed below and behind the
// books. In the gutter under the faces the bed shows as short flames and glow.
// From it flames climb the faces' sides: tallest and densest near the bottom,
// thinning and breaking up as they rise, leaning a little outward, and passing
// the top corners only now and then. A top edge gets only occasional licks.
// Everywhere the local flame height follows slow noise, so the fire gathers in
// clusters with dark gaps, and there is glow only where there is fire. The
// neighbours are further back: their fire is smaller and fainter, and the centre
// face's side flames rise in front of them, in a band about 30 px wide beside
// each of its sides, whatever stands behind that band. The flames
// are sampled from the photograph Art · Cold flames and added as light; they
// lean only with a swipe (Lean) or toward the pointer. The outer 3 to 4 px of
// each face char, with a slow, broken, dull-red ember line. A few sparks rise
// and fade within half a second; dark ash flakes fall.
// Intensity 0 leaves the smoulder: charred corners and a rare spark.
// Still = 1 is the motion-off rim: a still scorch, no fire, no time.
// When Rim key is on, the inside of each rectangle (more than 4 px in) is
// written as an invisible key (black at about 1% alpha) so that smoke.glsl,
// chained after this effect, can find the rims; smoke.glsl removes it again.

/** @resolution */
uniform vec2 u_resolution;

/** @time */
uniform float u_time;

/** @mouse */
uniform vec2 u_mouse;

/** @label Content */
uniform sampler2D u_content;

/**
 * @label Shape distance
 * @sdf
 */
uniform sampler2D u_sdf;

/**
 * @label Flame photograph (Art · Cold flames)
 * @mipmap
 */
uniform sampler2D u_flames;

/**
 * @label Intensity
 * @default 0.0
 * @range 0, 1
 */
uniform float u_intensity;

/**
 * @label Lean
 * @default 0.0
 * @range -1, 1
 */
uniform float u_lean;

/**
 * @label Smoulder
 * @default 0.5
 * @range 0, 1
 */
uniform float u_smoulder;

/**
 * @label Tallest tongue (px)
 * @default 22.0
 * @range 6, 90
 */
uniform float u_reach;

/**
 * @label Still (motion off)
 * @default 0.0
 * @range 0, 1
 */
uniform float u_still;

/**
 * @label Rim key for smoke.glsl
 * @default 1.0
 * @range 0, 1
 */
uniform float u_key;

/**
 * @label Seek (s)
 * @default 0.0
 * @range 0, 60
 */
uniform float u_seek;

/**
 * @label Centre face, left edge (px)
 * @default 30.0
 * @range -400, 1200
 */
uniform float u_centreL;

/**
 * @label Centre face, right edge (px)
 * @default 360.0
 * @range -400, 1200
 */
uniform float u_centreR;

/**
 * @label Gutter beside the centre face (px)
 * @default 8.5
 * @range 0, 80
 */
uniform float u_gutter;

/**
 * @label Left and right fire differ at this share of the width (-1 = one fire)
 * @default 0.5
 * @range -1, 1
 */
uniform float u_split;

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

float mrep1(float u) { return 1.0 - abs(mod(u, 2.0) - 1.0); }
vec2 mrep(vec2 u) { return 1.0 - abs(mod(u, 2.0) - 1.0); }

// Where the flames sit in Art · Cold flames: bases, highest tips, and how many
// screen px the photograph's width is laid across at scale 1.
const float FL_V0 = 0.17;
const float FL_V1 = 0.90;
const float FL_W = 130.0;
const vec3 GLOW_C = vec3(0.43, 0.92, 0.63);
// The fire burns in a bed below and behind the books. Its flames stand on a
// line this many px above the bottom of the stage, clear of the control row.
const float BED_Y = 6.0;

vec3 fireRamp(float heat) {
  vec3 hot = vec3(0.918, 1.0, 0.949);
  vec3 rift = vec3(0.616, 1.0, 0.784);
  vec3 boric = vec3(0.247, 0.839, 0.478);
  vec3 c = mix(boric, rift, smoothstep(0.25, 0.6, heat));
  return mix(c, hot, smoothstep(0.62, 0.95, heat));
}

// One sample of the flame photograph, recoloured as cold fire: near-white green
// where it is hottest, rift-green and boric green in the body, lilac only where
// the photograph's own flame has cooled to violet. xyz = light, w = brightness.
vec4 flamePhoto(sampler2D tex, vec2 uvp) {
  vec3 c = texture2D(tex, uvp).rgb;
  float L = max(c.r, max(c.g, c.b));
  float heat = pow(L, 1.35) * 0.86;
  float lil = smoothstep(0.03, 0.22, (c.r + c.b) * 0.5 - c.g) * (1.0 - smoothstep(0.7, 0.95, L));
  vec3 col = mix(fireRamp(heat), vec3(0.706, 0.549, 1.0), lil);
  return vec4(col * L, L);
}

// How bright the fire is near this column right now, read from the same
// photograph and the same kind of moving noise that shape the flames, so glow,
// rim light and the wire flicker with the fire and not on a timer.
float fireFlick(sampler2D tex, float x, float t) {
  float u = 0.08 + 0.84 * mrep1((x * 0.33 + (noise(vec2(x / 50.0, t * 1.3)) - 0.5) * 30.0 + t * 3.0) / (FL_W * 0.84));
  float v = FL_V0 + (0.28 + (noise(vec2(x / 37.0 + 3.0, t * 1.7)) - 0.5) * 0.2) * (FL_V1 - FL_V0);
  vec3 c = texture2D(tex, vec2(u, v)).rgb;
  return 0.55 + 0.9 * max(c.r, max(c.g, c.b));
}

// Where the fire is. Each of these changes slowly, over a few seconds, so the
// fire gathers in clusters with dark gaps between them. Flames, glow, rim light
// and shimmer all read the same values: there is light only where there is fire.
// How tall the bed's flames stand at this column, 0..1.
float bedEnv(float x, float t) {
  float a = noise(vec2(x / 46.0, t * 0.28)) * 0.75 + noise(vec2(x / 17.0 + 11.0, t * 0.6)) * 0.25;
  return smoothstep(0.4, 0.7, a);
}

// Occasional licks over a top edge, 0..1: nothing along most of it, most of the time.
float topEnv(float x, float t) {
  return smoothstep(0.66, 0.86, noise(vec2(x / 38.0 + 23.0, t * 0.33)));
}

// How far up a side the fire climbs right now, as a share of the height from the
// bed to the top of the face: usually half to nine tenths, now and then past the top.
float sideReach(float seed, float t) {
  return 0.3 + 0.9 * noise(vec2(t * 0.3, 5.0 + seed * 3.0));
}

// Densest at the bottom, thinning to nothing at the reach.
float sideDens(float yRel, float reach) { return 1.0 - smoothstep(reach * 0.35, reach, yRel); }

// How much flame is beside this height right now (the packets of risingFlames,
// without the photograph), 0..1.
float sidePresence(float y, float per, float dens, float t, float seed) {
  float p = 0.0;
  for (int L = 0; L < 2; L++) {
    float fl = float(L);
    float pl = L == 0 ? per : per * 0.7;
    float spd = L == 0 ? 52.0 : 74.0;
    float yy = (y - t * spd) / pl + fl * 0.41;
    float id = floor(yy);
    float h1 = hash(vec2(id, 3.0 + seed + fl * 17.0));
    p = max(p, smoothstep(0.0, 0.3, dens * 1.25 - h1) * sin(3.14159 * (yy - id)));
  }
  return p;
}

// Flames climbing: packets of the flame photograph, each `per` px long (and a
// second, shorter and faster layer), rising past a fixed point. Every packet
// takes its own slice of the photograph at its own scale and mirroring, so the
// pattern never repeats; fewer packets are alight where dens is low, so the fire
// thins and breaks up as it climbs. lean = px sideways per px risen.
// Returns light (xyz) and brightness (w).
vec4 risingFlames(sampler2D tex, float x, float y, float per, float dens, float t, float seed, float lean, float wsc) {
  if (dens <= 0.002) return vec4(0.0);
  vec2 q = vec2(x, y);
  vec2 w1 = vec2(noise(q / 19.0 + vec2(seed * 4.0, -t * 1.3)), noise(q / 19.0 + vec2(7.3, -t * 1.3))) - 0.5;
  vec2 w2 = vec2(noise(q / 6.5 + vec2(3.1, -t * 3.0)), noise(q / 6.5 + vec2(9.7, -t * 3.0))) - 0.5;
  vec2 wv = w1 * 10.0 + w2 * 3.5;
  vec4 acc = vec4(0.0);
  for (int L = 0; L < 2; L++) {
    float fl = float(L);
    float pl = L == 0 ? per : per * 0.7;
    float spd = L == 0 ? 52.0 : 74.0;
    float yy = (y - t * spd) / pl + fl * 0.41 + (noise(vec2(x / 31.0 + seed, y / 170.0 + fl)) - 0.5) * 0.9;
    float id = floor(yy);
    float v = yy - id;
    float h1 = hash(vec2(id, 3.0 + seed + fl * 17.0));
    float h2 = hash(vec2(id + 5.0, 9.0 + seed * 2.0 + fl * 5.0));
    float alive = smoothstep(0.0, 0.3, dens * 1.25 - h1);
    if (alive <= 0.0) continue;
    float sc = mix(0.75, 1.35, h2) * wsc;
    float mir = fract(h1 * 13.7) < 0.5 ? -1.0 : 1.0;
    float u0 = 0.14 + 0.72 * fract(h1 * 7.31 + h2 * 3.17);
    float bend = 0.3 + 0.9 * v;
    float u = u0 + mir * (x - lean * v * pl + wv.x * bend) / (FL_W * sc);
    u = 0.08 + 0.84 * mrep1((u - 0.08) / 0.84);
    float vv = FL_V0 + (0.1 + 0.9 * clamp(v + wv.y * bend / pl * 0.6, 0.0, 1.0)) * (FL_V1 - FL_V0);
    acc = max(acc, flamePhoto(tex, vec2(u, vv)) * alive * smoothstep(0.0, 0.3, v) * (1.0 - smoothstep(0.82, 1.0, v)));
  }
  return acc;
}

// Flames standing on a line: h = px above the line, H = how tall the fire is
// here (from bedEnv or topEnv), x = px along it. Two overlapping runs of
// clusters, each with its own slice, scale and mirroring of the photograph. The
// lookup is bent by two scales of rising noise, faster toward the tips, and the
// tips are worn away by noise so flamelets tear off.
vec4 flameSheet(sampler2D tex, float x, float h, float H, float t, float seed, float wsc) {
  if (H < 2.0 || h < 0.0) return vec4(0.0);
  float v = h / H;
  if (v > 1.1) return vec4(0.0);
  vec2 q = vec2(x, h);
  float sp = 1.0 + 1.2 * v;
  vec2 w1 = vec2(noise(q / 19.0 + vec2(seed, -t * 1.1 * sp)), noise(q / 19.0 + vec2(7.3 + seed, -t * 1.1 * sp))) - 0.5;
  vec2 w2 = vec2(noise(q / 6.5 + vec2(3.1, -t * 2.6 * sp)), noise(q / 6.5 + vec2(9.7, -t * 2.6 * sp))) - 0.5;
  vec2 warp = (w1 * 10.0 + w2 * 3.5) * (0.3 + 0.9 * v);
  float cw = 58.0 * wsc;
  float xw = x + (noise(vec2(x / 90.0, seed)) - 0.5) * 50.0;
  float vv = FL_V0 + (0.12 + 0.88 * clamp(v + warp.y / H * 0.6, 0.0, 1.0)) * (FL_V1 - FL_V0);
  vec4 acc = vec4(0.0);
  for (int L = 0; L < 2; L++) {
    float fl = float(L);
    float xc = xw / cw + fl * 0.5;
    float id = floor(xc);
    float fr = xc - id;
    float win = smoothstep(0.0, 0.35, fr) * (1.0 - smoothstep(0.65, 1.0, fr));
    float h1 = hash(vec2(id, seed + fl * 17.0));
    float h2 = hash(vec2(id + 3.0, seed * 1.3 + fl * 5.0));
    float sc = mix(0.7, 1.4, h1) * wsc;
    float mir = h2 < 0.5 ? -1.0 : 1.0;
    float u0 = 0.14 + 0.72 * fract(h1 * 7.31 + h2 * 3.17);
    float u = u0 + mir * ((fr - 0.5) * cw + warp.x) / (FL_W * sc);
    u = 0.08 + 0.84 * mrep1((u - 0.08) / 0.84);
    acc = max(acc, flamePhoto(tex, vec2(u, vv)) * win);
  }
  float er = noise(vec2(x / 7.0, (h - t * 46.0) / 11.0)) * 0.7 + noise(vec2(x / 3.1 + 5.0, (h - t * 70.0) / 5.0)) * 0.3;
  float keep = smoothstep(v * 1.1 - 0.3, v * 1.1 + 0.1, er);
  return acc * keep * (1.05 - 0.4 * v) * (1.0 - smoothstep(0.95, 1.1, v));
}

// The rim of a face chars: its outer 3 to 4 px become ragged, flaking black with
// a thin dull blood-red ember line, in broken segments, that pulses slowly
// (about once every two seconds) and never flickers. di = px inside the rim,
// amt = 0..1. Returns premultiplied rgba.
vec4 charRim(vec2 px, float di, float amt, float t, float still) {
  if (di < 0.0 || di > 4.0 || amt <= 0.002) return vec4(0.0);
  float r = 1.2 + 2.2 * fbm(px / 4.0);
  float flake = step(0.8, hash(floor(px / 1.5)));
  float ca = (1.0 - smoothstep(r - 0.8, r, di)) * (1.0 - 0.7 * flake * smoothstep(r - 1.8, r, di));
  float pulse = still > 0.5 ? 0.55 : 0.6 + 0.4 * sin(t * 3.2 + fbm(px / 30.0) * 12.0);
  float line = exp(-pow((di - r) / 0.6, 2.0)) * (1.0 - smoothstep(3.3, 4.0, di)) * smoothstep(0.5, 0.72, noise(px / 11.0 + 3.0)) * pulse * 0.8;
  vec3 ember = mix(vec3(0.478, 0.039, 0.063), vec3(0.702, 0.071, 0.106), pulse);
  vec3 col = vec3(0.012) * ca * (1.0 - line) + ember * line;
  float al = max(ca, line);
  return vec4(col, al) * amt;
}

// Smoke density from Art · Smoke: two depths of the photograph drifting at
// different speeds, the lookup bent by slowly moving noise. Mirror-repeated so
// it never shows a seam. drift is in px per second.
float smokePhoto(sampler2D tex, vec2 uvp) {
  vec3 c = texture2D(tex, mrep(uvp)).rgb;
  return max(dot(c, vec3(0.3333)) - 0.035, 0.0) * 1.6;
}

float smokeField(sampler2D tex, vec2 px, float t, vec2 drift, float scale, float seed) {
  vec2 wob = vec2(noise(px / 70.0 + vec2(seed, t * 0.11)), noise(px / 70.0 + vec2(seed + 4.7, t * 0.09))) - 0.5;
  vec2 p = px + wob * 36.0 - drift * t;
  float a = smokePhoto(tex, vec2(p.x / (520.0 * scale), p.y / (284.0 * scale)) + seed);
  vec2 p2 = p + drift * t * 0.4;
  float b = smokePhoto(tex, vec2(p2.x / (330.0 * scale) + 0.31, p2.y / (180.0 * scale) + 0.57) + seed * 1.7);
  return clamp(a * 0.65 + b * 0.55, 0.0, 1.0);
}

// Vapour and smoke in the gutters, both sampled from the smoke photograph.
// prox = 0..1 closeness to a rim from outside; yRel = height above the fire bed
// as a share of the stage; fireL = the fire's light nearby; push = px the smoke
// is shoved by a shockwave.
// Vapour: pale and cold. It lies in three low, slow sheets along the bottom
// edges, each a few px thick, long and broken, drifting sideways in opposite
// directions, 20 to 35% where it is densest. It is never an even haze.
// Smoke: plumes, not haze. One column per 30 px of gutter at most, each rising
// from the bed and the side flames, two to three times wider at the top than at
// its foot, swaying more with height and thinning out at the top; lit green and
// lilac from beneath, grey higher up, 30 to 50% where it is densest.
// Both return premultiplied rgba.
void coldSmoke(sampler2D tex, vec2 px, float prox, float yRel, float t, float vap, float smk, float linger, float light, vec3 fireL, vec2 push, out vec4 smokeL, out vec4 vapL) {
  smokeL = vec4(0.0);
  vapL = vec4(0.0);
  if (prox <= 0.002) return;
  vec2 pp = px - push;
  if (vap > 0.001) {
    float sh = 0.0;
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      float y0 = 4.0 + 7.0 * fi + 2.0 * fi * fi;
      float th = 2.2 + 1.6 * fi;
      float dir = i == 1 ? -1.0 : 1.0;
      float xs = pp.x - dir * t * (3.0 + 1.5 * fi);
      float wav = (noise(vec2(xs / 90.0, fi * 5.3 + t * 0.03)) - 0.5) * 7.0;
      float len = smoothstep(0.3, 0.62, noise(vec2(xs / 130.0 + fi * 9.1, t * 0.04 + fi)));
      float q = (pp.y - y0 - wav) / th;
      sh = max(sh, exp(-q * q) * len * (1.0 - 0.22 * fi));
    }
    float d = smokeField(tex, vec2(pp.x * 0.35, pp.y * 1.6), t, vec2(2.0, 0.0), 1.0, 0.0);
    float breathe = 0.85 + 0.15 * sin(t * 0.4 + px.x * 0.013);
    float va = clamp(sh * (0.55 + 0.45 * smoothstep(0.02, 0.42, d)) * smoothstep(0.0, 0.4, prox) * vap * breathe, 0.0, 0.35);
    vec3 vc = vec3(0.72, 0.84, 0.83) + fireL * light * 0.6;
    vapL = vec4(vc * va, va);
  }
  float amt = smk + linger * 0.6;
  if (amt > 0.001) {
    float d = smokeField(tex, pp, t, vec2(-6.0, 30.0), 0.8, 2.3);
    float yc = clamp(yRel, 0.0, 1.3);
    float wdn = 1.0 + 1.6 * yc;
    float colm = 0.0;
    for (int i = -1; i <= 1; i++) {
      float id = floor(pp.x / 30.0) + float(i);
      float alive = smoothstep(0.3, 0.5, noise(vec2(id * 1.7 + 3.0, t * 0.06)));
      float xc = (id + 0.5) * 30.0 + (hash(vec2(id, 7.0)) - 0.5) * 10.0;
      float sw = sin(t * (0.7 + 0.4 * hash(vec2(id, 9.0))) + yc * 3.5 + id) * 14.0 * yc * yc;
      float q = (pp.x - xc - sw) / (5.0 * wdn);
      colm = max(colm, exp(-q * q) * alive);
    }
    float along = smoothstep(0.02, 0.18, yRel) * (1.0 - 0.8 * smoothstep(0.65, 1.15, yRel));
    float sa = clamp((0.4 + 0.6 * smoothstep(0.02, 0.4, d)) * smoothstep(0.12, 0.6, colm) * smoothstep(0.0, 0.35, prox) * along * amt * 0.9, 0.0, 0.5);
    vec3 lit = vec3(0.17, 0.18, 0.2) + fireL * light * 1.5 + vec3(0.706, 0.549, 1.0) * 0.04;
    vec3 scol = mix(lit, vec3(0.33, 0.34, 0.36), smoothstep(0.2, 0.8, yRel));
    smokeL = vec4(scol * sa, sa);
  }
}

float outAt(vec2 p) { return -texture2D(u_sdf, p / u_resolution).r; }

void main() {
  vec2 px = gl_FragCoord.xy;
  vec2 res = u_resolution;
  vec4 s = texture2D(u_sdf, px / res);
  float o = -s.r;
  float gl = length(s.gb);
  vec2 n = gl > 1e-4 ? -s.gb / gl : vec2(0.0, 1.0);
  float still = step(0.5, u_still);
  float t = still > 0.5 ? 0.0 : u_time + u_seek;
  float I = still > 0.5 ? 0.0 : u_intensity;
  vec2 mv = (u_mouse.x > 0.0 || u_mouse.y > 0.0) ? u_mouse - px : vec2(0.0);
  vec3 col = vec3(0.0);
  float al = 0.0;

  // beside the centre face: its side flames get about 30 px, in front of the neighbours
  float dC = max(u_centreL - px.x, px.x - u_centreR);
  float zone = (dC > 0.0 && dC < 34.0) ? 1.0 : 0.0;
  vec3 frontL = vec3(0.0);
  if (zone > 0.5 && I > 0.002) {
    float sdC = px.x < u_centreL ? -1.0 : 1.0;
    float seedC = u_split < 0.0 ? 1.0 : sdC;
    float ybC = px.y - BED_Y;
    float yRelC = ybC / (res.y - BED_Y - 17.5);
    float mdC = length(mv);
    float pullC = u_lean * 0.6 + (mdC > 0.5 ? mv.x / mdC * exp(-mdC / 90.0) * 0.45 : 0.0);
    float reachC = sideReach(seedC, t);
    float densC = sideDens(yRelC, reachC) * step(0.0, ybC);
    float wdC = mix(34.0, 22.0, clamp(yRelC, 0.0, 1.0));
    float acrossC = 1.0 - smoothstep(wdC * 0.2, wdC, dC);
    vec4 fC = risingFlames(u_flames, px.x, ybC, 130.0, densC, t, seedC, 0.1 * seedC - pullC, 1.7) * acrossC;
    float glowC = sidePresence(ybC, 130.0, densC, t, seedC) * exp(-dC / 9.0) * 0.14;
    frontL = (fC.rgb * 1.2 * smoothstep(0.0, 0.15, I) + GLOW_C * I * fireFlick(u_flames, px.x, t) * glowC) * smoothstep(BED_Y - 2.0, BED_Y + 2.0, px.y);
  }

  if (o > 0.0) {
    float nb = (zone < 0.5 && (px.x < u_centreL - u_gutter || px.x > u_centreR + u_gutter)) ? 0.6 : 1.0;
    float seed = u_split < 0.0 ? 1.0 : (px.x < res.x * u_split ? -1.0 : 1.0);
    float up = smoothstep(0.15, 0.75, n.y);
    float down = smoothstep(0.15, 0.75, -n.y);
    float side = clamp(1.0 - up - down, 0.0, 1.0);
    float yb = px.y - BED_Y;
    float yRel = yb / (res.y - BED_Y - 17.5);
    float flick = fireFlick(u_flames, px.x, t);
    float tall = (0.5 + 0.5 * I) * nb;
    float md = length(mv);
    float pull = u_lean * 0.6 + (md > 0.5 ? mv.x / md * exp(-md / 90.0) * 0.45 : 0.0);
    float gI = smoothstep(0.0, 0.15, I);

    float bedE = bedEnv(px.x, t);
    vec4 f = flameSheet(u_flames, px.x - pull * max(yb, 0.0), yb, 30.0 * bedE * tall, t, 1.0, nb * 1.4);
    float glow = bedE * exp(-max(yb, 0.0) / 14.0) * 0.16;
    if (side > 0.01) {
      float reach = sideReach(seed, t);
      float dens = sideDens(yRel, reach) * step(0.0, yb);
      float per = 130.0 * nb;
      float wd = mix(18.0, 8.0, clamp(yRel, 0.0, 1.0)) * nb;
      float across = 1.0 - smoothstep(wd * 0.2, wd, o);
      f = max(f, risingFlames(u_flames, px.x, yb, per, dens, t, seed, 0.1 * seed - pull, nb * 1.7) * across * side);
      glow += sidePresence(yb, per, dens, t, seed) * exp(-o / 9.0) * 0.14 * side;
    }
    if (up > 0.01) {
      float topE = topEnv(px.x, t);
      f = max(f, flameSheet(u_flames, px.x - pull * o, o, 20.0 * topE * tall, t, 7.0, nb * 1.3) * 0.9 * up);
      glow += topE * exp(-o / 9.0) * 0.12 * up;
    }
    col = (f.rgb * 1.2 * gI + GLOW_C * I * flick * glow) * nb * smoothstep(BED_Y - 2.0, BED_Y + 2.0, px.y);

    float sparks = 0.0;
    for (int i = 0; i < 8; i++) {
      float fi = float(i);
      if (I < 0.05 && i > 1) break;
      float per = 0.7 + hash(vec2(fi, 1.0)) * 1.6;
      float ph = hash(vec2(fi, 2.0)) * per;
      float k = floor((t + ph) / per);
      float life = t + ph - k * per;
      if (life > 0.5) continue;
      float hy = hash(vec2(fi + 5.0, k + 9.0));
      vec2 p0 = vec2(hash(vec2(fi, k + 3.0)), hy * hy) * res;
      float o0 = outAt(p0);
      if (o0 < 1.0 || o0 > 24.0) continue;
      vec2 vel = vec2((hash(vec2(fi, k + 7.0)) - 0.5) * 30.0, 55.0 + 40.0 * hash(vec2(k, fi)));
      vec2 pos = p0 + vel * life + vec2(sin(life * 20.0 + fi) * 1.5, 0.0);
      vec2 a = pos - vel * 0.035;
      vec2 pa = px - a;
      vec2 ba = pos - a;
      float hs = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
      sparks += (1.0 - smoothstep(0.4, 1.1, length(pa - ba * hs))) * (1.0 - life / 0.5) * (0.35 + 0.65 * hs);
    }
    col += vec3(0.918, 1.0, 0.949) * clamp(sparks, 0.0, 1.0) * max(I, 0.4 * u_smoulder * (1.0 - still));

    float ash = 0.0;
    for (int i = 0; i < 6; i++) {
      float fi = float(i) + 20.0;
      float per = 2.6 + hash(vec2(fi, 1.0)) * 2.2;
      float ph = hash(vec2(fi, 2.0)) * per;
      float k = floor((t + ph) / per);
      float life = (t + ph - k * per) / per;
      vec2 p0 = vec2(hash(vec2(fi, k + 3.0)), 0.35 + 0.65 * hash(vec2(fi + 5.0, k + 9.0))) * res;
      vec2 pos = p0 + vec2(sin(life * 9.0 + fi) * 5.0, -60.0 * life);
      float wd = 0.4 + 1.3 * abs(sin(life * 14.0 + fi * 2.0));
      ash += (1.0 - smoothstep(0.6, 1.0, length((px - pos) / vec2(wd, 1.1)))) * smoothstep(0.0, 0.1, life) * (1.0 - smoothstep(0.75, 1.0, life));
    }
    ash = clamp(ash, 0.0, 1.0) * 0.8 * I;
    col = col * (1.0 - ash) + vec3(0.13, 0.14, 0.15) * ash;
    al = clamp(max(max(col.r, max(col.g, col.b)), ash), 0.0, 1.0);
    col = min(col, vec3(1.0));
  }

  float di = -o;
  // The bottom and its corners stay clean, including the motion-off still.
  if (di >= 0.0 && di < 5.0 && n.y > -0.15 && outAt(px - vec2(0.0, 4.0)) < 0.0) {
    vec2 tg = vec2(-n.y, n.x);
    float corner = max(step(0.0, outAt(px + tg * 9.0)), step(0.0, outAt(px - tg * 9.0)));
    float amt = still > 0.5 ? max(u_intensity, u_smoulder) : max(smoothstep(0.0, 0.3, I), u_smoulder * corner * 0.9);
    vec4 ch = charRim(px, di, amt, t, still);
    col = ch.rgb + col * (1.0 - ch.a);
    al = ch.a + al * (1.0 - ch.a);
  }

  if (zone > 0.5) {
    col = min(max(col, frontL), vec3(1.0));
    al = max(al, clamp(max(frontL.r, max(frontL.g, frontL.b)), 0.0, 1.0));
  }

  vec4 outc = vec4(col, al);
  if (u_key > 0.5 && o < -4.5 && zone < 0.5) outc = vec4(0.0, 0.0, 0.0, 0.0118);
  gl_FragColor = outc;
}
