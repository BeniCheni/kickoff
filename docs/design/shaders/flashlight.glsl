#ifdef GL_ES
precision mediump float;
#endif

// FERGIE TIME BOOKS · flashlight.glsl
// Shader FILL, normal blend, above the paper and BELOW all content (B8).
// A warm torch pool (#E8B36F at 0.20 over B8's blue-black paper: the lit paper reads warm grey,
// hue about 30°, never yellow or amber) follows the pointer, lighting paper only, never ink. With no pointer, as on a phone, or with the pointer
// off the page, it rests on the NEXT match. It only ever adds light: nothing is
// moved, bent or hidden, and the text outside the pool keeps its full contrast.
// Between Keep-clear from and to (px from the bottom) the pool is switched off,
// so the black-stock covers on the shelf stay exactly as they are.

/** @resolution */
uniform vec2 u_resolution;

/** @mouse */
uniform vec2 u_mouse;

/**
 * @label Rest x (0..1 from the left)
 * @default 0.5
 * @range 0, 1
 */
uniform float u_restX;

/**
 * @label Rest y (0..1 from the bottom): the NEXT match
 * @default 0.84
 * @range 0, 1
 */
uniform float u_restY;

/**
 * @label Pool radius (px)
 * @default 130.0
 * @range 40, 400
 */
uniform float u_radius;

/**
 * @label Strength
 * @default 0.20
 * @range 0, 0.5
 */
uniform float u_strength;

/**
 * @label Light
 * @color
 * @default #E8B36F
 */
uniform vec3 u_color;

/**
 * @label Keep clear from (px from the bottom)
 * @default 0.0
 * @range 0, 4000
 */
uniform float u_keepFrom;

/**
 * @label Keep clear to (px from the bottom)
 * @default 0.0
 * @range 0, 4000
 */
uniform float u_keepTo;

void main() {
  vec2 px = gl_FragCoord.xy;
  // Pen reports the middle of the node when there is no pointer over it, and a
  // phone reports nothing at all: both mean "rest on the NEXT match".
  vec2 off = abs(u_mouse / u_resolution - 0.5);
  bool has = (u_mouse.x > 0.0 || u_mouse.y > 0.0) && u_mouse.x < u_resolution.x && u_mouse.y < u_resolution.y && (off.x > 0.01 || off.y > 0.01);
  vec2 c = has ? u_mouse : vec2(u_restX, u_restY) * u_resolution;
  vec2 d = (px - c) / vec2(u_radius * 1.25, u_radius);
  float r = length(d);
  float pool = 0.7 * exp(-r * r * 1.6) + 0.3 * (1.0 - smoothstep(0.7, 1.3, r));
  float clear = u_keepTo > u_keepFrom ? 1.0 - smoothstep(u_keepFrom - 24.0, u_keepFrom, px.y) * (1.0 - smoothstep(u_keepTo, u_keepTo + 24.0, px.y)) : 1.0;
  float a = clamp(pool * u_strength * clear, 0.0, 1.0);
  // Premultiplied warm white over paper; live ink is composited afterwards.
  gl_FragColor = vec4(u_color * a, a);
}
