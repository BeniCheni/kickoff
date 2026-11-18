// CSS escapes may consume one whitespace character after a hexadecimal code
// point. CRLF counts as one character after CSS input preprocessing.
const escape = String.raw`\\(?:([0-9a-f]{1,6})(?:\r\n|[ \t\n\r\f])?|([^\n\r\f]))`
const name = new RegExp(String.raw`[#@]?(?:[\w\0\u0080-\uffff-]|${escape})+`, 'iy')
const nameEscape = new RegExp(escape, 'gi')
const stringEscape = new RegExp(String.raw`${escape}|\\(?:\r\n|[\r\n\f])`, 'iy')
const whitespace = /[ \t\n\r\f]*/y

function afterString(css: string, start: number): number {
  const quote = css[start]
  for (let i = start + 1; i < css.length; i++) {
    const char = css.charAt(i)
    if (char === quote) return i + 1
    if (/[\r\n\f]/.test(char)) throw new Error('Unescaped newline in CSS string')
    if (char === '\\') {
      stringEscape.lastIndex = i
      if (stringEscape.test(css)) i = stringEscape.lastIndex - 1
    }
  }
  throw new Error('Unclosed CSS string')
}

function afterUnquotedUrl(css: string, start: number): number {
  // Even the remnants of a bad URL token run through the first unescaped ")".
  for (let i = start; i < css.length; i++) {
    if (css[i] === ')') return i + 1
    if (css[i] === '\\') i++
  }
  return css.length
}

function isUrlName(raw: string): boolean {
  const decoded = raw.replace(nameEscape, (_escape, hex: string | undefined, char: string) => {
    if (!hex) return char
    const codePoint = Number.parseInt(hex, 16)
    return codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : '\ufffd'
  })
  return decoded.toLowerCase() === 'url'
}

// Keep every byte outside real comments for the existing local() guard and
// the offline face parser. CSS tokenizes quoted url() values as strings.
export function stripFaceCssComments(css: string): string {
  let uncommented = ''
  let keptFrom = 0
  let i = 0
  while (i < css.length) {
    const char = css[i]
    if (css.startsWith('/*', i)) {
      const end = css.indexOf('*/', i + 2)
      if (end < 0) throw new Error('Unclosed CSS comment')
      uncommented += css.slice(keptFrom, i)
      i = keptFrom = end + 2
    } else if (char === '"' || char === "'") {
      i = afterString(css, i)
    } else {
      // Scan a whole name so a suffix of a name, hash, at-keyword or
      // dimension does not start an unquoted URL token.
      name.lastIndex = i
      const token = name.exec(css)
      if (!token) {
        i++
        continue
      }
      i = name.lastIndex
      if (css[i] === '(' && isUrlName(token[0])) {
        whitespace.lastIndex = i + 1
        whitespace.test(css)
        i = whitespace.lastIndex
        if (css[i] !== '"' && css[i] !== "'") i = afterUnquotedUrl(css, i)
      }
    }
  }
  return uncommented + css.slice(keptFrom)
}
