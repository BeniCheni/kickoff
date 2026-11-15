#ifdef GL_ES
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
#endif

// FERGIE TIME BOOKS · rack-crossing.glsl
// Shader FILL for the rack's live loop: art, fire, smoke, wire and void only.
// Titles, dates and markers stay out of it and are laid over it as text.
// One cycle per book: hold 7 s (the photograph pushes in 100% to 105%; only
// the charred corners glow, with a rare spark; faint cold vapour hangs low),
// then 1.8 s:
//   ignite 0-0.25 s      real fire, in cold colours, takes in a bed below and
//                        behind the book: short flames in the gutter under it,
//                        flames climbing its sides and thinning as they rise,
//                        only occasional licks over its top; the rim chars; a
//                        fine tremor starts at 0.17 s
//   burn 0.25-1.75       the cover burns as paper burns: fire climbs. The hole
//                        opens low on the rift seam and spreads about three
//                        times faster upward than sideways and slowest of all
//                        downward, a rising teardrop, at a steady share of the
//                        face (about a quarter per third of a second) until it
//                        is gone: a 3 to 6 px scorch, a thin irregular ember
//                        line, black flaking char, then the hole. Flame height
//                        follows the way each stretch of the front faces: 30 to
//                        60 px on edges that face up, low licks running up the
//                        vertical stretches, nothing under edges that face
//                        down. Four plumes of smoke rise from the top of the
//                        hole and its upper flanks, with sparks
//   impact 0.45 s        the seam bursts: photograph, fire and smoke freeze for
//                        70 ms, then release with the strongest sway (8 px,
//                        0.8 degrees, 4 px RGB split, 2% punch-in with one
//                        overshoot, a short smear) and a refractive shockwave
//                        ring that crosses the face in 0.35 s and shoves the
//                        smoke outward; the wire lip rings until 0.67 s
//   develop 0.95-1.60    inside the hole the next cover comes up out of the
//                        void like a print in a tray: shadows, then midtones,
//                        then highlights, while the void fades behind it
//   embers 1.45-1.8      the fire dies, ash falls, the face returns to size,
//                        the smoke lingers and thins over about 3 s
// The whole shake lives between 0.17 and 0.67 s. Freeze >= 0 holds one moment.
// DEPTH (pass 15). Each cover has a depth map in the same framing, and the
// photograph is a 2.5D scene:
//   hold      a slow dolly. As the 100% to 105% push runs, each point is also
//             magnified about the face's centre by how near it is, so near
//             things move outward more than far ones. The largest relative
//             displacement, nearest against farthest at a face's corner at the
//             end of the hold, is u_parallax px (6 by default and at most).
//             It is 0 at the start of a hold, so the still is the plain cover.
//   impact    the same shake as before, weighted by depth: the nearest things
//             take all of it, the farthest half. Same envelope, same 0.5 s.
//   burn      the void in the hole lies behind the farthest thing in the
//             photograph: it takes a quarter of the shake, moves against the
//             dolly, and falls back 6% as the hole spreads.
// u_parallax = 0 and u_jolt = 0 is the motion-off build: no depth is read.
// The fire, its glow, the rim light on the photograph's outer 12 px, the heat
// shimmer above the flames and the light on the wire all read their brightness
// from the same flame photograph, so they flicker together.

/** @resolution */
uniform vec2 u_resolution;

/** @time */
uniform float u_time;

/** @mouse */
uniform vec2 u_mouse;

/** @label Cover 1 */
uniform sampler2D u_cover0;

/** @label Cover 2 */
uniform sampler2D u_cover1;

/** @label Cover 3 */
uniform sampler2D u_cover2;

/** @label The void */
uniform sampler2D u_void;

/** @label Depth of cover 1 (same framing as the cover) */
uniform sampler2D u_depth0;

/** @label Depth of cover 2 */
uniform sampler2D u_depth1;

/** @label Depth of cover 3 (flat mid-grey when there is none) */
uniform sampler2D u_depth2;

/**
 * @label Depth maps: bright is near (1) or dark is near (0, Marigold)
 * @default 1.0
 * @range 0, 1
 */
uniform float u_depthNear;

/**
 * @label Sky line of cover 1 (share of the picture from its bottom; above it nothing reads nearer than the clouds, so a tear in the sky is not a solid thing; 2 = none)
 * @default 2.0
 * @range 0, 2
 */
uniform float u_sky0;

/**
 * @label Sky line of cover 2
 * @default 2.0
 * @range 0, 2
 */
uniform float u_sky1;

/**
 * @label Sky line of cover 3
 * @default 2.0
 * @range 0, 2
 */
uniform float u_sky2;

/**
 * @label Dolly parallax (px, nearest against farthest, 0 = off, max 6)
 * @default 6.0
 * @range 0, 6
 */
uniform float u_parallax;

/**
 * @label Depth-weighted jolt at the impact (0 = flat shake)
 * @default 1.0
 * @range 0, 1
 */
uniform float u_jolt;

/**
 * @label Show the depth map (check only)
 * @default 0.0
 * @range 0, 1
 */
uniform float u_showDepth;

/**
 * @label Flame photograph (Art · Cold flames)
 * @mipmap
 */
uniform sampler2D u_flames;

/**
 * @label Smoke photograph (Art · Smoke)
 * @mipmap
 */
uniform sampler2D u_smokeTex;

/**
 * @label Gutter x (px)
 * @default 20.0
 * @range 0, 80
 */
uniform float u_insetX;

/**
 * @label Gutter y (px)
 * @default 20.0
 * @range 0, 80
 */
uniform float u_insetY;

/**
 * @label Hold (s)
 * @default 7.0
 * @range 1, 20
 */
uniform float u_hold;

/**
 * @label Freeze at (s, -1 = run)
 * @default -1.0
 * @range -1, 30
 */
uniform float u_freeze;

/**
 * @label Rim fire, char and rim light
 * @default 1.0
 * @range 0, 1
 */
uniform float u_rim;

/**
 * @label Smoke and vapour in the gutter
 * @default 1.0
 * @range 0, 1
 */
uniform float u_smoke;

/**
 * @label Void in the gutter
 * @default 1.0
 * @range 0, 1
 */
uniform float u_gutterVoid;

/**
 * @label Wire lip height (px from the bottom, -1 = none)
 * @default -1.0
 * @range -1, 200
 */
uniform float u_wireY;

/**
 * @label Seam of cover 1 (0..1)
 * @default 0.46
 * @range 0, 1
 */
uniform float u_seam0;

/**
 * @label Seam of cover 2 (0..1)
 * @default 0.5
 * @range 0, 1
 */
uniform float u_seam1;

/**
 * @label Seam of cover 3 (0..1)
 * @default 0.51
 * @range 0, 1
 */
uniform float u_seam2;

/**
 * @label Title block starts here (share of the face from the bottom, 0 = no titles)
 * @default 0.0
 * @range 0, 1
 */
uniform float u_titleTop;

/**
 * @label Keep the caption corner clear
 * @default 0.0
 * @range 0, 1
 */
uniform float u_caption;

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
    float yc = clamp(yRel, 0.0, 1.3);
    float wdn = 1.0 + 1.6 * yc;
    float colm = 0.0;
    for (int i = -1; i <= 1; i++) {
      float id = floor(pp.x / 30.0) + float(i);
      float alive = smoothstep(0.3, 0.5, noise(vec2(id * 1.7 + 3.0, t * 0.06)));
      float xc = (id + 0.5) * 30.0 + (hash(vec2(id, 7.0)) - 0.5) * 10.0;
      float sw = sin(t * (0.7 + 0.4 * hash(vec2(id, 9.0))) + yc * 3.5 + id) * 14.0 * yc * yc;
      float curl = sin(yc * 14.0 - t * 0.9 + id) * 6.0 * yc;
      float q = (pp.x - xc - sw - curl) / (5.0 * wdn);
      float rag = noise(vec2(pp.y / 15.0 - t * 1.1, id * 3.7));
      float edge = 1.0 - smoothstep(0.6 + rag * 0.3, 1.4 + rag * 0.5, abs(q));
      float v = log(1.0 + 1.8 * yc) / log(2.8) - t * 0.11;
      float wisps = smokePhoto(tex, vec2(0.5 + q * 0.26 + hash(vec2(id, 4.0)) * 0.2, v));
      colm = max(colm, wisps * edge * alive);
    }
    float along = smoothstep(0.02, 0.18, yRel) * (1.0 - smoothstep(0.55, 1.05, yRel));
    float sa = clamp(colm * smoothstep(0.0, 0.35, prox) * along * amt * 0.9, 0.0, 0.5);
    vec3 lit = vec3(0.17, 0.18, 0.2) + fireL * light * 1.5 + vec3(0.706, 0.549, 1.0) * 0.04;
    vec3 scol = mix(lit, vec3(0.33, 0.34, 0.36), smoothstep(0.2, 0.8, yRel));
    smokeL = vec4(scol * sa, sa);
  }
}

const float CROSS = 1.8;
const float HIT = 0.45;
const float STOP = 0.07;
const float IMG_ASPECT = 0.79918;

vec3 tex3(int i, vec2 uv) {
  uv = clamp(uv, 0.0, 1.0);
  if (i == 0) return texture2D(u_cover0, uv).rgb;
  if (i == 1) return texture2D(u_cover1, uv).rgb;
  return texture2D(u_cover2, uv).rgb;
}

// Each cover is laid over its face as CSS object-fit: cover lays it, from its own
// pixel size, so the plate matches the still face under the live text.
float imgAspect(int i) {
  vec2 s = i == 0 ? vec2(textureSize(u_cover0, 0)) : (i == 1 ? vec2(textureSize(u_cover1, 0)) : vec2(textureSize(u_cover2, 0)));
  return s.x / max(s.y, 1.0);
}

vec2 fit(vec2 c, float faceAspect, float ia) {
  if (faceAspect < ia) c.x *= faceAspect / ia; else c.y *= ia / faceAspect;
  return c;
}

float depthTex(int i, vec2 uv) {
  uv = clamp(uv, 0.0, 1.0);
  if (i == 0) return texture2D(u_depth0, uv).r;
  if (i == 1) return texture2D(u_depth1, uv).r;
  return texture2D(u_depth2, uv).r;
}

// How near the scene is at this point of a cover, 0 = farthest, 1 = nearest,
// softened over about 3 px so a depth edge shears and never tears.
float nearAt(int i, vec2 uv, vec2 e) {
  float d = depthTex(i, uv) * 0.4 + (depthTex(i, uv + vec2(e.x, 0.0)) + depthTex(i, uv - vec2(e.x, 0.0)) + depthTex(i, uv + vec2(0.0, e.y)) + depthTex(i, uv - vec2(0.0, e.y))) * 0.15;
  float m = u_depthNear > 0.5 ? d : 1.0 - d;
  // A depth model reads a tear in the sky as a solid thing in front of the
  // clouds. Above the cover's sky line nothing is nearer than the clouds
  // (0.25): the tear moves with the sky, never in front of it.
  float sky = i == 0 ? u_sky0 : (i == 1 ? u_sky1 : u_sky2);
  return mix(m, min(m, 0.25), smoothstep(sky, sky + 0.06, uv.y));
}

// par = the dolly's extra magnification for the nearest thing against the
// farthest (0 = none); jolt = this frame's shake, in face units; jw = how much
// of the shake depth takes away from the far plane (0 = flat, 1 = half).
vec3 photo(int i, vec2 fuv, float zoom, vec2 off, float rot, float split, float bulge, float faceAspect, vec2 smear, float par, vec2 jolt, float jw, vec2 texel) {
  float ia = imgAspect(i);
  vec2 c = fuv - 0.5;
  c *= 1.0 - bulge * (1.0 - 2.0 * dot(c, c));
  float cs = cos(rot);
  float sn = sin(rot);
  c = vec2(c.x * cs - c.y * sn / faceAspect, c.x * sn * faceAspect + c.y * cs);
  vec2 cz = c / zoom + off;
  c = cz + jolt;
  if (par > 0.0 || (jw > 0.0 && dot(jolt, jolt) > 0.0)) {
    vec2 e = fit(texel * 3.0, faceAspect, ia);
    float m = 0.5;
    for (int it = 0; it < 3; it++) {
      c = (cz + jolt * mix(1.0 - 0.5 * jw, 1.0, m)) * (1.0 - par * (m - 0.5));
      m = nearAt(i, fit(c, faceAspect, ia) + 0.5, e);
    }
    c = (cz + jolt * mix(1.0 - 0.5 * jw, 1.0, m)) * (1.0 - par * (m - 0.5));
  }
  vec2 uv = fit(c, faceAspect, ia) + 0.5;
  if (u_showDepth > 0.5) return vec3(nearAt(i, uv, fit(texel * 3.0, faceAspect, ia)));
  if (split <= 0.0001 && dot(smear, smear) < 1e-10) return tex3(i, uv);
  vec2 sm = fit(smear, faceAspect, ia);
  vec2 sp = fit(vec2(split, 0.0), faceAspect, ia);
  vec3 a = vec3(0.0);
  for (int k = -1; k <= 1; k++) {
    vec2 u2 = uv + sm * float(k);
    a += vec3(tex3(i, u2 + sp).r, tex3(i, u2).g, tex3(i, u2 - sp).b);
  }
  return a / 3.0;
}

float fbm3(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(13.0, 7.0);
    a *= 0.5;
  }
  return v;
}

float seamOf(int i) {
  if (i == 0) return u_seam0;
  if (i == 1) return u_seam1;
  return u_seam2;
}

// When the burn reaches a point of the face. Fire climbs: from a point low on the
// seam the front travels about three times faster upward than sideways and half as
// fast downward as sideways, so the hole is a rising teardrop. Heights are scaled as
// if every face were 1.25 times as tall as wide, so one pace fits every face.
const float BURN_Y0 = 0.30;
const float BURN_NA = 0.085;

float burnField(vec2 fuv, float seam) {
  // Static material coordinates: raising the threshold never un-burns paper.
  // 40–80 px lobes, 10–20 px advancing fingers, 2–4 px fibre fray.
  vec2 size = u_resolution - 2.0 * vec2(u_insetX, u_insetY);
  vec2 px = fuv * size;
  vec2 lobes = vec2(noise(px / 60.0 + 2.7), noise(px / 73.0 + 19.2)) - 0.5;
  vec2 fingers = vec2(noise(px / vec2(15.0, 39.0) + 8.1), noise(px / vec2(19.0, 28.0) + 31.4)) - 0.5;
  vec2 fray = vec2(noise(px / 3.0 + 4.2), noise(px / 2.6 + 11.8)) - 0.5;
  // Keep subpixel fibre variation in the outline, not disconnected threshold islands.
  vec2 warped = fuv + (lobes * 48.0 + fingers * 14.0 + fray * 1.2) / size;
  vec2 p = vec2(warped.x - seam, (warped.y - BURN_Y0) * 1.25);
  p.x += 0.056 * (noise(vec2(p.y * 4.5 + 0.8, 17.3)) - 0.5);
  float sy = mix(0.5, 3.0, smoothstep(-0.05, 0.08, p.y));
  return length(vec2(p.x, p.y / sy));
}

// Broad photographic tongues on the burn front. Overlapping bases share a root;
// each 6-30 px tongue narrows, forks and leans with the rising plume. Cluster
// gaps are spatial noise, not regularly spaced vertical cut-outs.
vec4 burnTongues(float x, float h, float H, float t) {
  if (H < 2.0 || h < 0.0 || h > H) return vec4(0.0);
  float v = h / H;
  float sway = sin(t * 1.4 + v * 3.2) * 16.0 * v * sqrt(v);
  float curl = sin(v * 11.0 - t * 1.1) * (3.0 + 9.0 * v) * v;
  float xx = x - sway - curl;
  float clusters = smoothstep(0.27, 0.52, noise(vec2(xx / 67.0 + 9.0, t * 0.22)));
  vec4 acc = vec4(0.0);
  for (int j = -1; j <= 1; j++) {
    float id = floor(xx / 26.0) + float(j);
    float seed = hash(vec2(id, 81.3));
    float centre = (id + 0.5) * 26.0 + (seed - 0.5) * 16.0;
    float width = 6.0 + 24.0 * hash(vec2(id, 32.7));
    float tip = 0.55 + 0.45 * hash(vec2(id, 49.1));
    float u = clamp(v / tip, 0.0, 1.0);
    float bend = (noise(vec2(id * 3.1, t * 0.9 - u)) - 0.5) * 16.0 * u;
    float d = xx - centre - bend;
    float halfW = (width * 0.5 + 7.0 * (1.0 - smoothstep(0.0, 0.25, u))) * pow(1.0 - u, 0.65);
    float silhouette = 1.0 - smoothstep(max(halfW - 0.6, 0.0), halfW + 0.6, abs(d));
    float fork = smoothstep(0.35, 0.7, u) * (1.0 - smoothstep(0.0, 1.2 + 2.4 * u, abs(d + sin(u * 5.0 + seed * 6.0) * halfW * 0.3)));
    silhouette *= (1.0 - fork * 0.9) * (1.0 - smoothstep(0.92, 1.0, u));
    float texU = 0.12 + 0.76 * mrep1(seed + d / 90.0 + 0.04 * noise(vec2(d / 11.0, u * 4.0 - t)));
    vec4 photo = flamePhoto(u_flames, vec2(texU, mix(FL_V0 + 0.04, FL_V1, u)));
    acc = max(acc, photo * silhouette);
  }
  return acc * clusters;
}

// Smoke over the burning photograph: four plumes. One rises from the top of the hole
// and the others from its upper flanks, where the tallest flames stand; each rides
// the front as it climbs. A plume is a column: 8 to 12 px to each side at its foot and two
// to three times that at its top, 120 to 180 px tall, swaying more the higher it is
// and thinning out toward the top, its edge torn by the smoke photograph.
// x = density 0..1, y = how much of it is still lit from beneath.
vec2 facePlumes(sampler2D tex, vec2 px, vec2 ctr, vec2 halfS, float seam, float front, float t, float kc) {
  vec2 acc = vec2(0.0);
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float h1 = hash(vec2(fi + 1.0, kc * 3.0 + 61.0));
    float h2 = hash(vec2(fi + 4.0, kc * 5.0 + 67.0));
    float th = 1.5708 + (i == 0 ? 0.0 : (i == 1 ? -0.8 : (i == 2 ? 0.72 : (h1 < 0.5 ? -1.2 : 1.2)))) + (h1 - 0.5) * 0.2;
    vec2 e = vec2(cos(th), sin(th) * 3.0 / 1.25);
    vec2 fs = vec2(seam, BURN_Y0) + e * max(front, 0.0);
    // Find the actual ragged front along this plume's ray, not an ellipse.
    float lo = 0.0;
    float hi = max(front + 0.20, 0.25);
    for (int j = 0; j < 9; j++) {
      float mid = (lo + hi) * 0.5;
      if (burnField(vec2(seam, BURN_Y0) + e * mid, seam) < front) lo = mid; else hi = mid;
    }
    fs = vec2(seam, BURN_Y0) + e * ((lo + hi) * 0.5);
    float str = clamp(1.0 - smoothstep(0.98, 1.08, fs.y) - (1.0 - smoothstep(0.0, 0.04, fs.x)) - smoothstep(0.96, 1.0, fs.x), 0.0, 1.0);
    if (str <= 0.0) continue;
    vec2 S = ctr + (fs - 0.5) * 2.0 * halfS;
    float L = 120.0 + 60.0 * h2;
    float h = px.y - S.y - 8.0;
    float u = h / L;
    if (u <= 0.0 || u >= 1.0) continue;
    float w = (8.0 + 4.0 * h1) * (1.0 + (1.3 + 0.7 * h2) * u);
    float sw = sin(t * (1.1 + 0.6 * h1) + fi * 2.1 + u * 3.2) * (10.0 + 10.0 * h2) * u * sqrt(u) + (h1 - 0.5) * 24.0 * u;
    float curl = sin(u * 11.0 - t * 1.1 + fi * 2.7) * (3.0 + 9.0 * u);
    float q = (px.x - S.x - sw - curl) / w;
    float rag = noise(vec2(h / 13.0 - t * 1.3, fi * 7.1));
    float edge = 1.0 - smoothstep(0.65 + rag * 0.3, 1.3 + rag * 0.5, abs(q));
    // Wide photographic slice in path coordinates; no additive grey pedestal.
    // log stretches each wisp longitudinally as the plume climbs.
    float v = log(1.0 + 1.8 * u) / log(2.8) - t * 0.13;
    float bil = smokePhoto(tex, vec2(0.5 + q * 0.27 + fi * 0.11, v + h2 * 0.4));
    float d = clamp(bil, 0.0, 1.0) * edge * smoothstep(0.0, 0.1, u) * (1.0 - smoothstep(0.35, 1.0, u)) * str;
    acc.y = max(acc.y, d * (1.0 - smoothstep(0.0, 0.45, u)));
    acc.x = max(acc.x, d);
  }
  return acc;
}

void main() {
  vec2 px = gl_FragCoord.xy;
  vec2 res = u_resolution;
  vec2 uv = px / res;
  float T = u_hold + CROSS;
  float tt = u_freeze >= 0.0 ? u_freeze : u_time;
  float k = floor(tt / T);
  float lt = tt - k * T;
  float ki = mod(k, 3.0);
  int cur = int(ki + 0.5);
  int nxt = int(mod(ki + 1.0, 3.0) + 0.5);
  float c = lt - u_hold;
  float on = step(0.0, c);
  float lost = c < HIT ? 0.0 : min(c - HIT, STOP);
  float ce = c - lost;
  float ta = tt - STOP * k - on * lost;

  float ignite = smoothstep(0.0, 0.25, ce);
  float fade = 1.0 - smoothstep(1.38, 1.73, ce);
  float I = on * ignite * fade;
  float rel = on * step(HIT + 0.0005, ce);
  float build = on * (1.0 - rel) * smoothstep(0.17, HIT, ce);
  float u = rel * (ce - HIT);
  float trauma = rel * clamp(1.0 - u / 0.15, 0.0, 1.0);
  float sway = max(0.12 * build, trauma * trauma);
  float trem = max(build, trauma);
  float splitA = max(build * build, trauma * trauma);
  // The punch's residual is eased to zero by u = 0.15 (wall c = 0.67), the end
  // of the shake window.
  float punch = rel * 0.02 * exp(-u * 12.0) * cos(u * 18.0) * (1.0 - smoothstep(0.06, 0.15, u));
  float recede = on * smoothstep(0.2, 0.45, ce) * fade;
  float voidVis = on * smoothstep(0.25, 0.6, ce) * (1.0 - smoothstep(1.3, 1.73, ce));
  float sw = clamp(u / 0.35, 0.0, 1.0);
  float swOn = rel * step(u, 0.35);

  // the burn: the share of the face gone so far rises at a steady rate
  float aB = on * clamp((ce - 0.25) / 1.43, 0.0, 1.0);
  float a8 = aB * aB;
  a8 *= a8;
  a8 *= a8;
  float a24 = a8 * a8 * a8;
  float front = -0.00839 + 0.30080 * sqrt(aB) + (((-4.15610 * aB + 6.54467) * aB - 3.50603) * aB + 0.87729) * aB + 0.66091 * a8 + 0.20941 * a24;
  float burning = step(0.0001, aB);
  // 650 ms exposure, with 65 ms quadratic shoulders and a constant-rate middle.
  // Avoid smoothstep's 1.5x velocity spike across most of the photograph.
  float dx = clamp((c - 0.95) / 0.65, 0.0, 1.0);
  float dev = dx < 0.1 ? dx * dx / 0.18 : (dx > 0.9 ? 1.0 - (1.0 - dx) * (1.0 - dx) / 0.18 : (dx - 0.05) / 0.9);

  float impact = on * smoothstep(0.3, HIT, ce) * (1.0 - smoothstep(0.62, 1.25, ce));

  vec2 ctr = res * 0.5;
  bool hasMouse = u_mouse.x > 0.0 || u_mouse.y > 0.0;
  vec2 mp = hasMouse ? clamp((u_mouse - ctr) / res, -0.5, 0.5) : vec2(0.0);
  vec2 halfS = (res * 0.5 - vec2(u_insetX, u_insetY)) * (1.0 - 0.03 * recede);
  vec2 rel2 = px - ctr;
  vec2 dd = abs(rel2) - halfS;
  float sd = length(max(dd, 0.0)) + min(max(dd.x, dd.y), 0.0);
  vec2 n = sd > 0.0 ? normalize(max(dd, 0.0) * sign(rel2) + 1e-5) : (dd.x > dd.y ? vec2(sign(rel2.x), 0.0) : vec2(0.0, sign(rel2.y)));
  float faceAspect = halfS.x / halfS.y;

  vec2 so = ctr + vec2((seamOf(cur) - 0.5) * 2.0 * halfS.x, 0.1 * halfS.y);
  vec2 dv = px - so;
  float dist = length(dv);
  vec2 dirS = dist > 0.5 ? dv / dist : vec2(0.0);
  float ring = swOn * exp(-pow((dist - sw * (length(halfS) * 2.0 + 60.0)) / 16.0, 2.0)) * (1.0 - sw) * (1.0 - sw);

  float flick = fireFlick(u_flames, px.x, ta);
  float fireI = I * u_rim;

  // where the fire is: a bed below and behind the book, climbing its sides
  float faceTop = ctr.y + halfS.y;
  float yb = px.y - BED_Y;
  float yRel = yb / (faceTop - BED_Y);
  float sgn = rel2.x < 0.0 ? -1.0 : 1.0;
  float reach = sideReach(sgn, ta);
  float dens = sideDens(yRel, reach) * step(0.0, yb);
  float pres = sidePresence(yb, 130.0, dens, ta, sgn);
  float dOut = abs(rel2.x) - halfS.x;
  float hTop = px.y - faceTop;
  float curl = smoothstep(0.92, 1.1, reach) * exp(-max(-dOut, 0.0) / 24.0);
  float topE = clamp(topEnv(px.x, ta) + curl, 0.0, 1.0);
  float bedE = bedEnv(px.x, ta);
  float beside = step(0.0, dOut);
  float above = step(0.0, hTop) * (1.0 - beside);

  // heat shimmer above and beside the flames: what is behind is refracted by at most 1.5 px
  float shim = fireI * step(0.0, sd) * (above * (0.2 + 0.8 * topE) + beside * pres) * smoothstep(0.0, 6.0, sd) * (1.0 - smoothstep(10.0, 46.0, sd));
  vec2 shOff = (vec2(noise(vec2(px.x / 9.0, (px.y - ta * 38.0) / 14.0)), noise(vec2(px.x / 9.0 + 7.0, (px.y - ta * 38.0) / 14.0))) - 0.5) * 3.0 * shim;

  vec2 vc = (uv + shOff / res - 0.5) / 1.08 - mp * 0.03 + vec2(0.0, 0.004 * sin(tt * 0.2));
  float resAspect = res.x / res.y;
  if (resAspect < IMG_ASPECT) vc.x *= resAspect / IMG_ASPECT; else vc.y *= IMG_ASPECT / resAspect;
  vec3 voidC = texture2D(u_void, clamp(vc + 0.5, 0.0, 1.0)).rgb;

  vec3 col = mix(vec3(0.024, 0.024, 0.031), voidC, voidVis * 0.9) * u_gutterVoid;
  float alpha = u_gutterVoid;
  vec2 plume = vec2(0.0);
  float veilCap = 0.6;

  vec2 fuv = rel2 / halfS * 0.5 + 0.5;
  float Wpx = halfS.x * 2.0;
  float Hpx = halfS.y * 2.0;
  // fire, sparks and smoke on the photograph stay above the title block and clear of the caption
  float maskT = u_titleTop > 0.0 ? smoothstep(u_titleTop + 8.0 / Hpx, u_titleTop + 16.0 / Hpx, fuv.y) : 1.0;
  float maskC = u_caption > 0.5 ? 1.0 - (1.0 - smoothstep(0.34, 0.4, fuv.x)) * smoothstep(1.0 - 42.0 / Hpx, 1.0 - 32.0 / Hpx, fuv.y) : 1.0;
  float keepOut = maskT * maskC;

  if (sd <= 0.0) {
    float kf = floor(ta * 30.0);
    vec2 tremV = vec2(cos(kf * 2.4), sin(kf * 2.4)) * (mod(kf, 2.0) * 2.0 - 1.0) * 1.5 * trem;
    vec2 swayV = (vec2(noise(vec2(ta * 24.0, 1.7)), noise(vec2(ta * 24.0, 9.3))) - 0.5) * 2.0 * 8.0 * sway;
    float rot = (noise(vec2(ta * 20.0, 4.1)) - 0.5) * 2.0 * 0.01396 * sway;
    vec2 jolt = (tremV + swayV - dirS * ring * 7.0) / (halfS * 2.0);
    vec2 off = mp * 0.008;
    // the dolly: nearest against farthest, at most 6 px at the face's corner
    float dolly = on > 0.5 ? 1.0 : clamp(lt / u_hold, 0.0, 1.0);
    float par = min(u_parallax, 6.0) * dolly / length(halfS);
    vec2 texel = 1.0 / (halfS * 2.0);
    float sl = length(swayV);
    vec2 smear = sl > 0.01 ? swayV / sl * 3.0 * sway / (halfS * 2.0) : vec2(0.0);
    float split = 4.0 * splitA / (halfS.x * 2.0);
    float zoomOld = (on > 0.5 ? 1.05 : 1.0 + 0.05 * clamp(lt / u_hold, 0.0, 1.0)) * (1.0 + punch);
    vec3 fc = photo(cur, fuv, zoomOld, off, rot, split, 0.02 * max(0.4 * build, trauma * trauma), faceAspect, smear, par, jolt, u_jolt, texel);

    if (burning > 0.5) {
      float seam = seamOf(cur);
      float bd = burnField(fuv, seam);
      // which way this stretch of the front faces, and how far away it is in px
      vec2 g = vec2(burnField(fuv + vec2(2.0 / Wpx, 0.0), seam) - bd, burnField(fuv + vec2(0.0, 2.0 / Hpx), seam) - bd) * Wpx * 0.5;
      float gl = max(length(g), 0.15);
      vec2 nF = g / gl;
      float eP = (bd - front) * Wpx;
      float dpx = eP / gl;

      // what shows through the hole: the void, then the next cover developing out of it
      // The void lies behind the farthest thing in the photograph: it takes a
      // quarter of the shake, moves against the dolly, and falls back as the
      // hole spreads. With no depth in play it is the gutter's void, unchanged.
      vec3 holeC = voidC;
      float deep = (par > 0.0 || u_jolt > 0.0) ? 1.0 : 0.0;
      if (deep > 0.5) {
        vec2 hv = (rel2 / res) * (1.0 + par) * (1.0 + 0.06 * aB) + ctr / res - 0.5 + jolt * 0.25 * u_jolt * (halfS * 2.0) / res;
        hv = (hv + shOff / res) / 1.08 - mp * 0.03 + vec2(0.0, 0.004 * sin(tt * 0.2));
        if (resAspect < IMG_ASPECT) hv.x *= resAspect / IMG_ASPECT; else hv.y *= IMG_ASPECT / resAspect;
        holeC = texture2D(u_void, clamp(hv + 0.5, 0.0, 1.0)).rgb;
      }
      if (c > 0.95) {
        vec3 newC = photo(nxt, fuv, 1.0, mp * 0.008, 0.0, 0.0, 0.0, faceAspect, vec2(0.0), 0.0, vec2(0.0), 0.0, texel);
        float Ln = dot(newC, vec3(0.299, 0.587, 0.114));
        // A single exposure dissolve: do not fade the void out before the print
        // has developed (that made a dark dip followed by a broad late brightening).
        float exposure = pow(max(dev, 0.0001), 1.0 + 0.6 * Ln);
        holeC = mix(voidC, newC, exposure);
      }

      // fine irregularity of the burnt outline, 1 to 3 px, in material coordinates. One
      // offset moves the hole's edge, the char and the scorch together, and its slope
      // stays under 1 px per px, so the outline frays without islands or doubled lines.
      vec2 mpx = fuv * (res - 2.0 * vec2(u_insetX, u_insetY));
      float jit = ((noise(mpx / 7.0 + vec2(13.1, 7.7)) - 0.5) * 1.8 + (noise(mpx / 3.0 + vec2(2.3, 41.0)) - 0.5) * 0.7) * keepOut;
      float dE = dpx + jit;
      float cw = 2.0 + 2.0 * noise(px / 7.0 + 5.0);

      // ahead of the char the paper scorches over 3 to 6 px: first greyer and darker
      // (dark and desaturated, never orange), then down into the black char itself, so
      // the char has no drawn outer line. It stays 8 px short of the title block and
      // clear of the caption corner.
      float bw = clamp(3.0 + (3.0 + 3.0 * noise(mpx / 17.0 + 23.0)) - cw, 3.0, 6.0);
      // the scorch's outer limit follows the smooth front, not the fine fray, which
      // fades out across the band: nothing can break off beyond it as a speck.
      // The band's distance is measured over a 12 px baseline, so the fibre fray in the
      // field cannot make it jump.
      vec2 gW = vec2(burnField(fuv + vec2(6.0 / Wpx, 0.0), seam) - burnField(fuv - vec2(6.0 / Wpx, 0.0), seam), burnField(fuv + vec2(0.0, 6.0 / Hpx), seam) - burnField(fuv - vec2(0.0, 6.0 / Hpx), seam)) * Wpx / 12.0;
      float dB = eP / max(length(gW), 0.15);
      float sb = clamp((dB - cw) / bw, 0.0, 1.0);
      float dS = dB + jit * (1.0 - sb);
      float sIn = (1.0 - clamp((dS - cw) / bw, 0.0, 1.0)) * step(0.0, dS) * keepOut;
      // eased at its outer end, so paper about to catch ahead of the front barely shows
      sIn = sIn * sIn * (3.0 - 2.0 * sIn);
      float lum = dot(fc, vec3(0.299, 0.587, 0.114));
      // inside the keep-out (title block, caption corner) the photograph keeps exactly
      // the soft scorch it had before the band was added
      float scorchK = (1.0 - smoothstep(0.0, 8.0 + 2.0 * noise(px / 13.0), dpx)) * step(0.0, dpx) * (1.0 - keepOut);
      fc = mix(fc, vec3(lum) * vec3(1.08, 0.97, 0.86), 0.6 * scorchK) * (1.0 - 0.6 * scorchK);
      lum = dot(fc, vec3(0.299, 0.587, 0.114));
      fc = mix(fc, vec3(lum) * vec3(1.0, 0.98, 0.95), 0.85 * smoothstep(0.0, 0.6, sIn));
      fc *= 1.0 - 0.66 * smoothstep(0.0, 0.9, sIn);
      fc = mix(fc, vec3(0.018, 0.017, 0.019), smoothstep(0.78, 1.0, sIn));

      // the ember line: broken. Glowing segments cover well under half of the front at
      // any moment, 1 to 3 px wide, uneven in brightness, with wandering hot spots and
      // black char between them. Then 2 to 4 px of flaking char, then the hole.
      float ew = 1.0 + 2.0 * noise(px / 9.0 + vec2(0.0, ta * 0.3));
      // A single connected char band on the surviving paper. Its inner edge
      // shares the hole's one-pixel feather; no square flakes or doubled rings.
      float inHole = 1.0 - smoothstep(-0.5, 0.5, dE);
      float inChar = (1.0 - smoothstep(cw - 0.5, cw + 0.5, dE)) * (1.0 - inHole);
      float inEmber = exp(-pow((dE - cw * 0.55) / ew, 2.0)) * inChar;
      float seg = smoothstep(0.56, 0.66, noise(px / 12.0 + vec2(ta * 0.12, -ta * 0.08)));
      float bright = noise(px / 5.0 + vec2(ta * 0.4, 2.0));
      float hotspot = seg * smoothstep(0.74, 0.84, noise(px / 16.0 + vec2(3.0, ta * 0.6)));
      vec3 emberCol = mix(vec3(0.478, 0.039, 0.063), vec3(0.702, 0.071, 0.106), bright) * (0.5 + 0.5 * bright) * (0.8 + 0.2 * sin(ta * 3.2 + bd * 40.0));
      emberCol = mix(emberCol, vec3(0.918, 1.0, 0.949) * 0.95, hotspot);
      fc = mix(fc, vec3(0.018, 0.017, 0.019), inChar);
      fc = mix(fc, emberCol, inEmber * seg);
      fc = mix(fc, holeC, inHole);

      // the blaze. Flames rise off the front and never sit on it. March down from this
      // pixel to the front beneath it: if that stretch faces up, a flame stands on it,
      // 30 to 60 px tall where it faces straight up and shorter as it turns aside.
      float live = 1.0 - smoothstep(0.93, 1.0, aB);
      float clusT = smoothstep(0.35, 0.7, noise(vec2(px.x / 60.0 + 3.0, ta * 0.35)));
      float Hmax = 30.0 + 30.0 * max(impact, clusT);
      float hcF = 0.0;
      float HfF = 0.0;
      float amtF = 0.0;
      float ePrev = eP;
      float hPrev = 0.0;
      float found = 0.0;
      for (int j = 1; j <= 8; j++) {
        float hj = 8.0 * float(j);
        vec2 q = fuv - vec2(0.0, hj / Hpx);
        float e = (burnField(q, seam) - front) * Wpx;
        if (found < 0.5 && ePrev > 0.0 && e <= 0.0) {
          found = 1.0;
          float hc = hPrev + (hj - hPrev) * ePrev / (ePrev - e);
          vec2 qc = fuv - vec2(0.0, hc / Hpx);
          vec2 gc = vec2(burnField(qc + vec2(3.0 / Wpx, 0.0), seam) - burnField(qc - vec2(3.0 / Wpx, 0.0), seam), burnField(qc + vec2(0.0, 3.0 / Hpx), seam) - burnField(qc - vec2(0.0, 3.0 / Hpx), seam));
          float ny = gc.y / max(length(gc), 1e-6);
          float up = smoothstep(0.1, 0.65, ny);
          hcF = hc;
          HfF = Hmax * 1.35 * (0.3 + 0.7 * up);
          amtF = smoothstep(0.28, 0.6, ny);
        }
        ePrev = e;
        hPrev = hj;
      }
      vec4 bf = burnTongues(px.x, hcF, HfF, ta) * amtF;
      // low licks run up the vertical stretches, 7 to 12 px out from the front; under a
      // stretch that faces down there is nothing
      float clus = smoothstep(0.42, 0.66, noise(vec2(px.x / 70.0 + 3.0, px.y / 70.0 - ta * 0.3)));
      float sideF = (1.0 - smoothstep(0.35, 0.65, nF.y)) * smoothstep(-0.3, -0.05, nF.y);
      float lickW = 6.0 + 24.0 * noise(vec2(px.y / 37.0 - ta * 0.6, 4.0));
      float lick = sideF * smoothstep(-0.5, 0.5, dpx) * (1.0 - smoothstep(lickW * 0.4, lickW, dpx));
      float sideH = mod(px.y - ta * 24.0 + 12.0 * noise(vec2(px.x / 50.0, ta * 0.3)), 52.0);
      bf = max(bf, burnTongues(px.x - nF.x * sideH * 0.18, sideH, 52.0, ta) * lick * clus);
      fc += bf.rgb * 1.6 * live * keepOut * (0.75 + 0.5 * impact);

      // smoke: plumes from the top of the hole and the tallest flames. Over the next
      // cover, once it starts to develop, smoke never veils more than 15%.
      plume = facePlumes(u_smokeTex, px, ctr, halfS, seam, front, ta, k) * smoothstep(0.0, 0.08, aB) * (1.0 - smoothstep(1.2, 1.75, c)) * keepOut;
      veilCap = mix(0.6, 0.15, inHole * smoothstep(0.95, 1.15, c));

      // Rare detached flecks are luminous embers, never black material islands.
      float spk = 0.0;
      for (int i = 0; i < 4; i++) {
        float fi = float(i);
        float per = 0.55 + 0.3 * hash(vec2(fi, 41.0));
        float ph = hash(vec2(fi, 42.0)) * per;
        float kk = floor((ta + ph) / per);
        float life = ta + ph - kk * per;
        if (life > 0.5) continue;
        float sth = 0.25 + 2.64 * hash(vec2(fi, kk + 43.0));
        vec2 se = vec2(cos(sth), sin(sth) * 3.0 / 1.25);
        vec2 sf = vec2(seam, BURN_Y0) + se * front;
        sf = vec2(seam, BURN_Y0) + se * max(front - (fbm3(sf * vec2(6.0, 8.0) + 2.0) - 0.5) * BURN_NA, 0.0);
        float x1 = sf.x;
        float sy = sf.y;
        if (x1 < 0.01 || x1 > 0.99 || sy > 0.99 || sy < max(u_titleTop, 0.04)) continue;
        vec2 p0 = ctr + (vec2(x1, sy) - 0.5) * 2.0 * halfS;
        vec2 vel = vec2((hash(vec2(fi, kk + 45.0)) - 0.5) * 50.0, 60.0 + 60.0 * hash(vec2(kk, fi + 46.0)));
        vec2 pos = p0 + vel * life + vec2(sin(life * 22.0 + fi) * 2.0, 0.0);
        vec2 sa = pos - vel * 0.06;
        vec2 pa = px - sa;
        vec2 ba = pos - sa;
        float hs = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
        spk += (1.0 - smoothstep(0.7, 1.7, length(pa - ba * hs))) * (1.0 - life / 0.5) * (0.35 + 0.65 * hs);
      }
      fc += vec3(0.918, 1.0, 0.949) * clamp(spk, 0.0, 1.0) * live * keepOut;
    }

    // the fire lights the photograph's outer 12 px only where there is fire beside it; its rim chars
    float rlS = 1.0 - smoothstep(0.0, 12.0, -dOut);
    float rlT = 1.0 - smoothstep(0.0, 12.0, -hTop);
    fc += GLOW_C * fireI * flick * 0.32 * max(rlS * rlS * pres, rlT * rlT * topE);
    vec2 cd = halfS - abs(rel2);
    float corner = step(cd.x, 10.0) * step(cd.y, 10.0);
    vec4 ch = charRim(px, min(cd.x, halfS.y - rel2.y), max(smoothstep(0.0, 0.3, fireI), 0.45 * corner * u_rim) * step(4.0, px.y - (ctr.y - halfS.y)), ta, 0.0);
    fc = ch.rgb + fc * (1.0 - ch.a);
    col = fc;
    alpha = 1.0;

    // smoke over the photograph: the plumes, and nothing once they have left it. What
    // lingers into the next hold stays in the gutters.
    if (plume.x > 0.01) {
      float sa2 = min(plume.x * 0.8, veilCap);
      vec3 lit = vec3(0.3, 0.33, 0.34) + GLOW_C * 0.2 + vec3(0.706, 0.549, 1.0) * 0.07;
      col = mix(vec3(0.36, 0.37, 0.4), lit, plume.y) * sa2 + col * (1.0 - sa2);
    }
  }

  // smoke and vapour in the gutter
  float prox = sd > 0.0 ? clamp(1.0 - sd / 44.0, 0.0, 1.0) : 0.0;
  float smk = on * smoothstep(0.1, 0.6, ce) * fade;
  float lingerV = on > 0.5 ? smoothstep(0.5, 1.6, ce) : exp(-lt / 1.1) * step(0.5, k);
  vec3 fireL = GLOW_C * I * flick * 0.5 * max(bedE * exp(-max(yb, 0.0) / 30.0), max(pres * beside, topE * above));
  vec4 smokeL;
  vec4 vapL;
  coldSmoke(u_smokeTex, px, prox, yRel, ta, 0.6 * u_smoke, smk * u_smoke, lingerV * u_smoke, 0.7, fireL, dirS * ring * 18.0, smokeL, vapL);
  col = smokeL.rgb + col * (1.0 - smokeL.a);
  alpha = smokeL.a + alpha * (1.0 - smokeL.a);

  // the fire itself: light that only ever adds, and glow only where there is fire
  float fireA = 0.0;
  if (sd > 0.0 && fireI > 0.002) {
    float tall = 0.5 + 0.5 * fireI;
    vec2 mv = hasMouse ? u_mouse - px : vec2(0.0);
    float md = length(mv);
    float pull = md > 0.5 ? mv.x / md * exp(-md / 90.0) * 0.45 : 0.0;
    vec4 f = flameSheet(u_flames, px.x - pull * max(yb, 0.0), yb, 30.0 * bedE * tall, ta, 1.0, 1.4);
    float glow = bedE * exp(-max(yb, 0.0) / 14.0) * 0.16;
    if (beside > 0.5) {
      float wd = mix(34.0, 22.0, clamp(yRel, 0.0, 1.0));
      float across = 1.0 - smoothstep(wd * 0.2, wd, dOut);
      f = max(f, risingFlames(u_flames, px.x, yb, 130.0, dens, ta, sgn, 0.1 * sgn - pull, 1.7) * across);
      glow += pres * exp(-dOut / 9.0) * 0.14;
    }
    if (above > 0.5) {
      f = max(f, flameSheet(u_flames, px.x - pull * hTop, hTop, 20.0 * topE * tall, ta, 7.0, 1.3) * 0.9);
      glow += topE * exp(-hTop / 9.0) * 0.12;
    }
    vec3 lightC = (f.rgb * 1.2 * smoothstep(0.0, 0.15, fireI) + GLOW_C * fireI * flick * glow) * smoothstep(BED_Y - 2.0, BED_Y + 2.0, px.y);
    col += lightC;
    fireA = clamp(max(lightC.r, max(lightC.g, lightC.b)), 0.0, 1.0);
    alpha = max(alpha, fireA);
  }

  // a few sparks from the bed and the sides
  float sparkAmt = max(fireI, 0.4 * u_rim);
  if (sparkAmt > 0.002 && sd > 0.0) {
    float sparks = 0.0;
    for (int i = 0; i < 6; i++) {
      float fi = float(i);
      if (fireI < 0.05 && i > 1) break;
      float per = 0.7 + hash(vec2(fi, 1.0)) * 1.6;
      float ph = hash(vec2(fi, 2.0)) * per;
      float kk = floor((ta + ph) / per);
      float life = ta + ph - kk * per;
      if (life > 0.5) continue;
      float h1 = hash(vec2(fi, kk + 3.0));
      float h2 = hash(vec2(fi + 5.0, kk + 9.0));
      vec2 p0 = h1 < 0.5 ? vec2(h2 * res.x, BED_Y + 4.0) : vec2(ctr.x + (h1 < 0.75 ? -1.0 : 1.0) * (halfS.x + 4.0), BED_Y + h2 * h2 * 0.6 * res.y);
      vec2 vel = vec2((hash(vec2(fi, kk + 7.0)) - 0.5) * 30.0, 55.0 + 40.0 * hash(vec2(kk, fi)));
      vec2 pos = p0 + vel * life + vec2(sin(life * 20.0 + fi) * 1.5, 0.0);
      vec2 sa = pos - vel * 0.035;
      vec2 pa = px - sa;
      vec2 ba = pos - sa;
      float hs = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
      sparks += (1.0 - smoothstep(0.4, 1.1, length(pa - ba * hs))) * (1.0 - life / 0.5) * (0.35 + 0.65 * hs);
    }
    float spA = clamp(sparks, 0.0, 1.0) * sparkAmt;
    col += vec3(0.918, 1.0, 0.949) * spA;
    alpha = max(alpha, spA);
  }

  if (u_wireY >= 0.0) {
    float wu = on * (c - (HIT + STOP + 0.016));
    // The ring starts at c = 0.536 and is eased to rest by c = 0.67, inside the
    // shake window (wEnd = 0.67 - 0.536).
    float wEnd = 0.67 - (HIT + STOP + 0.016);
    float amp = wu > 0.0 ? 3.0 * exp(-wu * 6.0) * (1.0 - smoothstep(0.0, wEnd, wu)) * step(wu, wEnd) : 0.0;
    float wy = u_wireY + amp * sin(3.14159 * uv.x) * sin(wu * 113.0);
    float wl = 1.0 - smoothstep(0.5, 1.5, abs(px.y - wy));
    vec3 chrome = mix(vec3(0.43, 0.45, 0.48), vec3(0.9, 0.92, 0.93), smoothstep(-1.0, 1.0, px.y - wy));
    chrome += GLOW_C * fireI * flick * 0.3 * bedE;
    col = chrome * wl + col * (1.0 - wl);
    alpha = wl + alpha * (1.0 - wl);
  }

  vapL *= 1.0 - 0.85 * clamp(fireA * 1.5, 0.0, 1.0);
  col = vapL.rgb + col * (1.0 - vapL.a);
  alpha = vapL.a + alpha * (1.0 - vapL.a);

  // ash: a few dark grey flakes that tumble slowly and fall through the gutter
  float ashEnv = c > 0.0 ? smoothstep(0.9, 1.3, c) : 1.0 - smoothstep(0.0, 2.5, lt);
  if (k < 0.5 && c <= 0.0) ashEnv = 0.0;
  if (ashEnv > 0.001 && sd > 0.0) {
    float ash = 0.0;
    for (int i = 0; i < 6; i++) {
      float fi = float(i) + 20.0;
      float per = 2.6 + hash(vec2(fi, 1.0)) * 2.2;
      float ph = hash(vec2(fi, 2.0)) * per;
      float kk = floor((ta + ph) / per);
      float life = (ta + ph - kk * per) / per;
      vec2 p0 = vec2(hash(vec2(fi, kk + 3.0)), 0.35 + 0.65 * hash(vec2(fi + 5.0, kk + 9.0))) * res;
      vec2 pos = p0 + vec2(sin(life * 9.0 + fi) * 5.0, -60.0 * life);
      float wd = 0.4 + 1.3 * abs(sin(life * 14.0 + fi * 2.0));
      ash += (1.0 - smoothstep(0.6, 1.0, length((px - pos) / vec2(wd, 1.1)))) * smoothstep(0.0, 0.1, life) * (1.0 - smoothstep(0.75, 1.0, life));
    }
    float aa = clamp(ash, 0.0, 1.0) * ashEnv * 0.8;
    col = col * (1.0 - aa) + vec3(0.13, 0.14, 0.15) * aa;
    alpha = alpha + aa * (1.0 - alpha);
  }

  gl_FragColor = vec4(col, alpha);
}
