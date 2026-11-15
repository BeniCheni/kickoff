#ifdef GL_ES
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
#endif

// FERGIE TIME BOOKS · smoke.glsl
// Shader EFFECT chained after rim-fire.glsl on the Rim mask, so the smoke rises
// from the fire itself. Both layers are sampled from the photograph Art · Smoke
// and drift with slowly moving noise; they stay soft and low in contrast.
// Vapour, pale and cold, lies in low, slow sheets along the bottom edges, about
// 20 to 35% opaque where it is densest; it is never an even haze. Smoke rises
// during a crossing as plumes: columns from the fire bed and the side flames
// that widen two to three times as they climb, sway more with height and thin
// out at the top, 30 to 50% where they are densest; Linger is what is left
// hanging afterwards. Beside the centre face the plumes and the side flames
// stand in front of the neighbours' slivers. Light is
// how strongly the fire's own colours light the smoke's underside; higher smoke
// cools to grey. Smoke and vapour stay off the faces entirely (beyond the 4 px
// char at the rim), so they never cross a title, a date line, the imprint foot,
// a digit or the ART · ILLUSTRATIVE caption.
// It also lays the fire's rim light on the outer 8 px of each face at the top
// and sides, read from the fire's own pixels so it flickers with the fire.
// It finds the rims from the key rim-fire.glsl writes, and removes that key.
// Still = 1 is the motion-off haze: no time.

/** @resolution */
uniform vec2 u_resolution;

/** @time */
uniform float u_time;

/** @label Content */
uniform sampler2D u_content;

/**
 * @label Smoke photograph (Art · Smoke)
 * @mipmap
 */
uniform sampler2D u_smokeTex;

/**
 * @label Vapour
 * @default 0.6
 * @range 0, 1
 */
uniform float u_vapour;

/**
 * @label Smoke
 * @default 0.0
 * @range 0, 1
 */
uniform float u_smoke;

/**
 * @label Linger
 * @default 0.0
 * @range 0, 1
 */
uniform float u_linger;

/**
 * @label Light
 * @default 0.7
 * @range 0, 1
 */
uniform float u_light;

/**
 * @label Blast (shockwave push)
 * @default 0.0
 * @range 0, 1
 */
uniform float u_blast;

/**
 * @label Still (motion off)
 * @default 0.0
 * @range 0, 1
 */
uniform float u_still;

/**
 * @label Seek (s)
 * @default 0.0
 * @range 0, 60
 */
uniform float u_seek;

/**
 * @label Rim light only above this height (px from the bottom; set it to the title block's top where a face is drawn back)
 * @default 0.0
 * @range 0, 600
 */
uniform float u_lightFrom;

/** @label Protected caption (x, y from bottom, width, height; zero disables)
 * @default 0, 0, 0, 0
 */
uniform vec4 u_protectCaption;

/** @label Protected imprint foot (x, y from bottom, width, height; zero disables)
 * @default 0, 0, 0, 0
 */
uniform vec4 u_protectFoot;

bool protectedRect(vec2 p, vec4 r) {
  return r.z > 0.0 && r.w > 0.0 && p.x >= r.x && p.x <= r.x + r.z && p.y >= r.y && p.y <= r.y + r.w;
}

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

float keyAt(vec2 p) {
  vec4 c = texture2D(u_content, p / u_resolution);
  return (c.a > 0.006 && c.a < 0.02 && c.r + c.g + c.b < 0.01) ? 1.0 : 0.0;
}

vec3 lightAt(vec2 p) {
  vec4 c = texture2D(u_content, p / u_resolution);
  return (c.a > 0.006 && c.a < 0.02 && c.r + c.g + c.b < 0.01) ? vec3(0.0) : c.rgb;
}

void main() {
  vec2 px = gl_FragCoord.xy;
  // Final chain output: neither the earlier fire nor this smoke reaches protected ink.
  if (protectedRect(px, u_protectCaption) || protectedRect(px, u_protectFoot)) {
    gl_FragColor = vec4(0.0);
    return;
  }
  vec4 src = texture2D(u_content, px / u_resolution);
  float cIn = keyAt(px);
  float t = u_still > 0.5 ? 0.0 : u_time + u_seek;

  if (cIn > 0.5) {
    vec3 lightC = vec3(0.0);
    float nearEdge = 0.0;
    for (int j = 0; j < 8; j++) {
      float a = float(j) * 0.7853982;
      vec2 d = vec2(cos(a), sin(a));
      if (d.y < -0.3) continue;
      float k = 1.0 - keyAt(px + d * 4.0);
      nearEdge += k;
      lightC += (lightAt(px + d * 10.0) + lightAt(px + d * 16.0)) * k;
    }
    float nearBottom = 0.0;
    for (int i = 1; i <= 5; i++) nearBottom = max(nearBottom, 1.0 - keyAt(px - vec2(0.0, 8.0 * float(i))));
    vec3 rl = lightC * 0.1 * u_light * (1.0 - nearBottom) * step(0.5, nearEdge) * smoothstep(u_lightFrom, u_lightFrom + 6.0, px.y);
    float ra = clamp(max(rl.r, max(rl.g, rl.b)), 0.0, 0.6);
    gl_FragColor = vec4(min(rl, vec3(ra)), ra);
    return;
  }

  vec2 ds = vec2(0.0);
  float ws = 0.0;
  float acc = 0.0;
  for (int i = 0; i < 5; i++) {
    float r = 5.0 + 9.0 * float(i);
    float wr = 1.0 - float(i) / 5.5;
    for (int j = 0; j < 8; j++) {
      float a = float(j) * 0.7853982 + float(i) * 0.39;
      vec2 d = vec2(cos(a), sin(a));
      float k = keyAt(px + d * r);
      acc += k * wr;
      ds += d * k * wr;
      ws += wr;
    }
  }
  float prox = clamp(acc / ws * 2.4 + u_blast * 0.15 * step(0.001, acc), 0.0, 1.0);
  float dl = length(ds);
  vec2 n = dl > 1e-4 ? -ds / dl : vec2(0.0, 1.0);

  vec3 fl = vec3(0.0);
  for (int j = 0; j < 6; j++) {
    float a = float(j) * 1.0472;
    vec2 d = vec2(cos(a), sin(a));
    fl += lightAt(px + d * 7.0);
    fl += lightAt(px + d * 16.0 - vec2(0.0, 8.0)) * 0.7;
  }
  fl /= 10.2;

  vec4 smokeL;
  vec4 vapL;
  float yRel = (px.y - BED_Y) / (u_resolution.y - BED_Y - 17.5);
  coldSmoke(u_smokeTex, px, prox, yRel, t, u_vapour, u_smoke, u_linger, u_light, fl, n * u_blast * 14.0 * prox, smokeL, vapL);
  // smoke and vapour end at the char: nothing within 3 px of a face's clear inside
  float clearIn = 1.0 - max(max(keyAt(px + vec2(3.0, 0.0)), keyAt(px - vec2(3.0, 0.0))), max(keyAt(px + vec2(0.0, 3.0)), keyAt(px - vec2(0.0, 3.0))));
  smokeL *= clearIn;
  vapL *= clearIn;
  vec4 o1 = src + smokeL * (1.0 - src.a);
  vapL *= 1.0 - 0.85 * clamp(src.a * 1.5, 0.0, 1.0);
  gl_FragColor = vapL + o1 * (1.0 - vapL.a);
}
