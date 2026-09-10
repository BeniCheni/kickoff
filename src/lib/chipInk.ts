/** Black/white foregrounds on unchanged competition fills. White on the UCL
 * fill is only 3.79:1. Apply the same contrast rule to every chip, never a UCL exception.
 * Tests measure all configured fills and both inactive theme grounds independently. */
export function chipInk(hex: string): '#ffffff' | '#000000' {
  const channels = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const luminance = channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722
  return 1.05 / (luminance + 0.05) >= 4.5 ? '#ffffff' : '#000000'
}
