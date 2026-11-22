import { expect, test } from 'vitest'
import { DESKTOP_TABLE_CONTROLS, DESKTOP_TABLE_SORTS, TABLE_FOOT_LAST, TABLE_LEAGUE_KEYS, bandFaults, dotFaults, firstFrameFaults, focusFaults, handoffFaults, heldResults, hitAreaFaults, leagueFaults, longestLeague, momentsPaintFaults, nextCellFaults, pinFaults, revealFaults, ringPaintFaults, ringPixels, sortFaults, sortOrder, sweepFaults, tabFaults, columnFaults, tableHitFaults, tableStateFaults } from '../scripts/evidence.mjs'

const box = (name: string, left: number, top: number, w: number, h = 44) => ({ name, left, top, right: left + w, bottom: top + h, w, h })

test('a 44px control passes, a short one fails, and a shared edge is not an overlap', () => {
  const ok = box('Stop motion', 0, 0, 44)
  const next = box('Dark mode', 44, 0, 44)
  expect(hitAreaFaults([ok, next])).toEqual([])
  expect(hitAreaFaults([{ ...ok, w: 26, h: 26 }])).toEqual(['Stop motion 26.00×26.00'])
  expect(hitAreaFaults([ok, { ...next, left: 40, right: 84 }])).toEqual(['Stop motion overlaps Dark mode'])
})

test('H1 is 44, not 43.5, and H2 has no half-pixel of grace', () => {
  // The layout unit is a sixty-fourth of a pixel. One unit short is short.
  expect(hitAreaFaults([box('a', 0, 0, 44 - 1 / 64, 44)])).toEqual(['a 43.98×44.00'])
  expect(hitAreaFaults([box('a', 0, 0, 43.99, 43.99)])).toEqual(['a 43.99×43.99'])
  expect(hitAreaFaults([box('a', 0, 0, 43.5, 43.5)])).toEqual(['a 43.50×43.50'])
  expect(hitAreaFaults([box('a', 0, 0, 44), box('b', 43.5, 0, 44)])).toEqual(['a overlaps b'])
  expect(hitAreaFaults([box('a', 0, 0, 44), box('b', 43.98, 0, 44)])).toEqual(['a overlaps b'])
  expect(hitAreaFaults([box('a', 0, 0, 44), box('b', 44, 0, 44)])).toEqual([])
  expect(hitAreaFaults([box('a', 0, 0, 44), box('b', 0, 44, 44)])).toEqual([])
})

const PITCH = 'rgb(86, 192, 131)'
const UNDERLINE = `${PITCH} 0px -2.5px 0px 0px inset`

/** A tab's hit area with the tab drawn inside it: 22 tall at its centre, as wide as its label. */
function tabBox(name: string, left: number, current: boolean) {
  return {
    ...box(name, left, 44, 80), row: 'tabs', current, shadow: 'none',
    drawn: { ...box('', left + 12, 55, 56, 22), label: 56, underline: current ? UNDERLINE : 'none' },
  }
}

/** A band control as the runner reads it. Only a tab has a drawing, a current state and a shadow. */
type Control = ReturnType<typeof box> & { row: string; current?: boolean; shadow?: string; drawn?: ReturnType<typeof tabBox>['drawn'] | null }

/** Moves a control, and what is drawn inside it, down the page. */
function lower(control: Control, by: number) {
  control.top += by
  control.bottom += by
  if (control.drawn) { control.drawn.top += by; control.drawn.bottom += by }
}

/** The band as measured at 360: 133 tall, the provenance wrapped under the tab row. */
function band(tabs = ['Fixtures', 'Table', 'Moments']) {
  let left = 16
  const tabBoxes = tabs.map((name, i) => { const tab = tabBox(name, left, i === 0); left += 84; return tab })
  return {
    landmark: true, pitch: PITCH, className: 'imprint-band', box: { left: 0, top: 0, width: 360, height: 133 }, innerWidth: 360, height: 133,
    rows: [{ name: 'controls', top: 0, bottom: 44, h: 44 }, { name: 'tabs', top: 44, bottom: 88, h: 44 }],
    controls: [
      { ...box('Stop motion', 116, 0, 44), row: 'controls' }, { ...box('Dark mode', 160, 0, 44), row: 'controls' },
      { ...box('Poster', 204, 0, 57), row: 'controls' }, { ...box('Ledger', 261, 0, 57), row: 'controls' },
      ...tabBoxes,
    ] as Control[],
    provenance: { top: 88, bottom: 133 },
    strap: { transform: 'uppercase', tracking: 1.2, size: 10, lines: 1, right: 90 },
    data: [
      { name: 'wordmark', rects: [box('', 16, 8, 67, 22)] },
      { name: 'strap', rects: [box('', 16, 31, 62, 10)] },
      { name: 'provenance line', rects: [box('', 16, 96, 150, 15), box('', 16, 111, 190, 15)] },
    ],
  }
}

test('the band passes whole, with three tabs online and two offline', () => {
  expect(bandFaults(band())).toEqual([])
  expect(bandFaults(band(['Fixtures', 'Table']), { tabs: ['Fixtures', 'Table'] })).toEqual([])
  // The offline file holds two tabs, and the online shell is not excused a third.
  expect(bandFaults(band(['Fixtures', 'Table']))).toEqual(['controls are [Stop motion, Dark mode, Poster, Ledger, Fixtures, Table], expected [Stop motion | Start motion, Dark mode | Light mode, Poster, Ledger, Fixtures, Table, Moments]'])
  expect(bandFaults(band(), { tabs: ['Fixtures', 'Table'] })[0]).toContain('expected [Stop motion | Start motion, Dark mode | Light mode, Poster, Ledger, Fixtures, Table]')
})

test('a missing band, landmark, row or control is a fault and never a skipped gate', () => {
  expect(bandFaults(null)).toEqual(['the band is missing'])
  expect(bandFaults({ ...band(), landmark: false })).toEqual(['the band has lost its header landmark, data-moments-background="header"'])
  const noTheme = band()
  noTheme.controls.splice(1, 1)
  expect(bandFaults(noTheme)).toEqual(['controls are [Stop motion, Poster, Ledger, Fixtures, Table, Moments], expected [Stop motion | Start motion, Dark mode | Light mode, Poster, Ledger, Fixtures, Table, Moments]'])
  const noRow = band()
  noRow.rows.pop()
  expect(bandFaults(noRow)).toContain('rows are [controls], expected [controls, tabs]')
  const swapped = band()
  ;[swapped.controls[2], swapped.controls[3]] = [swapped.controls[3]!, swapped.controls[2]!]
  expect(bandFaults(swapped)[0]).toContain('controls are [Stop motion, Dark mode, Ledger, Poster,')
  expect(bandFaults({ ...band(), box: { left: 20, top: 0, width: 320, height: 133 } })).toEqual(['the band is 320.00 wide at 20.00, and the page is 360'])
})

test('H3: nine pixels before the tab row breaks the 44px pitch', () => {
  const pushed = band()
  pushed.rows[1] = { name: 'tabs', top: 53, bottom: 97, h: 44 }
  pushed.provenance = { top: 97, bottom: 142 }
  for (const control of pushed.controls.slice(4)) lower(control, 9)
  for (const rect of pushed.data[2]!.rects) { rect.top += 9; rect.bottom += 9 }
  expect(bandFaults(pushed)).toEqual(['the tab row sits 53.00 below the control row, expected a 44px pitch'])
})

test('H4: tabs moved thirty pixels down cover the provenance line', () => {
  const moved = band()
  moved.rows[1] = { name: 'tabs', top: 74, bottom: 118, h: 44 }
  for (const control of moved.controls.slice(4)) lower(control, 30)
  expect(bandFaults(moved)).toEqual([
    'the tab row sits 74.00 below the control row, expected a 44px pitch',
    "the provenance line starts at 88.00, above the tab row's foot at 118.00",
    'Fixtures covers the provenance line',
    'Table covers the provenance line',
    'Moments covers the provenance line',
  ])
  // A tab that slides alone leaves its row and is caught without the row moving.
  const one = band()
  lower(one.controls[4]!, 30)
  expect(bandFaults(one)).toEqual(['Fixtures at 74.00 to 118.00 leaves the tabs row', 'Fixtures covers the provenance line'])
})

test('the drawn contract: a disc is 44 wide and a lens segment 57', () => {
  const thin = band()
  Object.assign(thin.controls[2]!, { w: 50, right: 254 })
  expect(bandFaults(thin)).toEqual(['Poster hit area is 50.00×44.00, expected 57×44'])
  const short = band()
  Object.assign(short.controls[5]!, { h: 40, bottom: 84 })
  // The drawing stays at the centre of the shorter hit area, so the fault is the hit area's alone.
  Object.assign(short.controls[5]!.drawn!, { top: 53, bottom: 75 })
  expect(bandFaults(short)).toEqual(['Table hit area is 80.00×40.00, expected at least 44×44', 'Table 80.00×40.00'])
})

test('the strap is a caps label tracked .12em on one line, and a band without one is a fault', () => {
  // As built before the ruling: sentence case at 0.6px.
  expect(bandFaults({ ...band(), strap: { transform: 'none', tracking: 0.6, size: 10, lines: 1, right: 75.44 } })).toEqual([
    'the strap is set as typed, expected caps',
    'the strap is tracked 0.60px at 10px, expected .12em (1.20px)',
  ])
  // The handoff's range runs to .18em; the ruling is its low end.
  expect(bandFaults({ ...band(), strap: { transform: 'uppercase', tracking: 1.8, size: 10, lines: 1, right: 97.8 } }))
    .toEqual(['the strap is tracked 1.80px at 10px, expected .12em (1.20px)'])
  expect(bandFaults({ ...band(), strap: { transform: 'uppercase', tracking: 1.2, size: 10, lines: 2, right: 60 } })).toEqual(['the strap runs to 2 lines'])
  expect(bandFaults({ ...band(), strap: null })).toEqual(['the band has no strap'])
  // Tracked wide enough to reach the first control, the strap is under its hit area: H4.
  const wide = band()
  wide.data[1]!.rects[0] = box('', 16, 31, 104, 10)
  expect(bandFaults(wide)).toEqual(['Stop motion covers the strap'])
})

test('a tab is drawn 22px tall at the centre of its 44px hit area, underlined at its label’s width', () => {
  const on = tabBox('Fixtures', 16, true)
  const off = tabBox('Table', 100, false)
  expect(tabFaults(on, PITCH)).toEqual([])
  expect(tabFaults(off, PITCH)).toEqual([])
  // As built before the ruling: no drawn tab, and the underline on the hit area's own foot.
  expect(tabFaults({ ...on, drawn: null, shadow: UNDERLINE }, PITCH)).toEqual(['Fixtures has no drawn tab inside its hit area'])
  expect(tabFaults({ ...on, shadow: UNDERLINE }, PITCH)).toEqual([`Fixtures draws on its hit area: ${UNDERLINE}`])
  // A drawing that fills the hit area puts the underline back at the row's foot.
  expect(tabFaults({ ...on, drawn: { ...on.drawn, ...box('', 28, 44, 56, 44) } }, PITCH)).toEqual(['Fixtures is drawn 44.00 tall, expected 22'])
  expect(tabFaults({ ...on, drawn: { ...on.drawn, ...box('', 28, 50, 56, 22) } }, PITCH))
    .toEqual(['Fixtures is drawn at 50.00 to 72.00, off the centre of its hit area at 44.00 to 88.00'])
  // As wide as the hit area's content box and no wider than the label.
  expect(tabFaults({ ...on, drawn: { ...on.drawn, ...box('', 16, 55, 80, 22) } }, PITCH)).toEqual(['Fixtures is drawn 80.00 wide, and its label is 56.00'])
  expect(tabFaults({ ...on, drawn: { ...on.drawn, label: 56 + 1 / 64 } }, PITCH)).toEqual([])
  expect(tabFaults({ ...on, drawn: { ...on.drawn, underline: 'none' } }, PITCH))
    .toEqual(['Fixtures is the current tab, and the foot of its drawn tab reads none, expected a 2.5px underline'])
  expect(tabFaults({ ...on, drawn: { ...on.drawn, underline: 'rgb(86, 192, 131) 0px -1px 0px 0px inset' } }, PITCH))
    .toEqual(['Fixtures is the current tab, and the foot of its drawn tab reads rgb(86, 192, 131) 0px -1px 0px 0px inset, expected a 2.5px underline'])
  expect(tabFaults({ ...on, drawn: { ...on.drawn, underline: 'rgb(110, 75, 0) 0px -2.5px 0px 0px inset' } }, PITCH))
    .toEqual(["Fixtures's underline is rgb(110, 75, 0), expected the band's pitch rgb(86, 192, 131)"])
  expect(tabFaults({ ...off, drawn: { ...off.drawn, underline: UNDERLINE } }, PITCH)).toEqual(['Table is not the current tab and is underlined'])
})

test('the gate reads every tab’s drawing, and exactly one tab is the current page', () => {
  const none = band()
  none.controls[4]!.current = false
  none.controls[4]!.drawn!.underline = 'none'
  expect(bandFaults(none)).toEqual(['0 tabs are marked as the current page'])
  const filled = band()
  Object.assign(filled.controls[5]!.drawn!, { top: 44, bottom: 88, h: 44 })
  expect(bandFaults(filled)).toEqual(['Table is drawn 44.00 tall, expected 22'])
  const bare = band()
  bare.controls[6]!.drawn = null
  expect(bandFaults(bare)).toEqual(['Moments has no drawn tab inside its hit area'])
})

/** Takes the current mark and the underline off one tab and puts them on another. */
function markCurrent(shown: ReturnType<typeof band>, from: number, to: number) {
  Object.assign(shown.controls[from]!, { current: false })
  shown.controls[from]!.drawn!.underline = 'none'
  Object.assign(shown.controls[to]!, { current: true })
  shown.controls[to]!.drawn!.underline = UNDERLINE
  return shown
}

test('the current tab is the tab the cell asked for: the mark and the underline on another are a fault', () => {
  // The Fixtures page with aria-current and the underline moved to Table. One tab is
  // current, it is underlined in the band's pitch, and the reviewed head found no fault.
  const onTable = markCurrent(band(), 4, 5)
  expect(bandFaults(onTable, { current: 'Fixtures' })).toEqual(['Table is marked as the current page, and the cell asked for Fixtures'])
  // That band is what a Table cell has to show, and the untouched one is not.
  expect(bandFaults(onTable, { current: 'Table' })).toEqual([])
  expect(bandFaults(band(), { current: 'Table' })).toEqual(['Fixtures is marked as the current page, and the cell asked for Table'])
  expect(bandFaults(markCurrent(band(), 4, 6), { current: 'Moments' })).toEqual([])
  expect(bandFaults(markCurrent(band(), 4, 6), { current: 'Table' })).toEqual(['Moments is marked as the current page, and the cell asked for Table'])
  // A cell that names no tab asked for the shell's first, which is what a URL without one shows.
  expect(bandFaults(onTable)).toEqual(['Table is marked as the current page, and the cell asked for Fixtures'])
  // The offline file's two tabs are held the same way.
  const two = ['Fixtures', 'Table']
  expect(bandFaults(band(two), { tabs: two, current: 'Table' })).toEqual(['Fixtures is marked as the current page, and the cell asked for Table'])
  expect(bandFaults(markCurrent(band(two), 4, 5), { tabs: two, current: 'Table' })).toEqual([])
  // A tab the shell does not hold cannot be the current one.
  expect(bandFaults(band(two), { tabs: two, current: 'Moments' })).toEqual(['Fixtures is marked as the current page, and the cell asked for Moments'])
  // The mark on the tab that was asked for and the underline on another: each tab is named.
  const split = band()
  split.controls[4]!.drawn!.underline = 'none'
  split.controls[5]!.drawn!.underline = UNDERLINE
  expect(bandFaults(split, { current: 'Fixtures' })).toEqual([
    'Fixtures is the current tab, and the foot of its drawn tab reads none, expected a 2.5px underline',
    'Table is not the current tab and is underlined',
  ])
  // Two marks, one of them right, is still two.
  const both = band()
  Object.assign(both.controls[5]!, { current: true })
  both.controls[5]!.drawn!.underline = UNDERLINE
  expect(bandFaults(both, { current: 'Fixtures' })).toEqual(['2 tabs are marked as the current page'])
})

test('pinned rows: flush under what pins above them, and topmost at their own centre', () => {
  const pinned = {
    band: { top: 0, bottom: 133 },
    labels: { name: 'labels', top: 133, bottom: 161, topmost: 'itself' },
    divider: { name: 'Knockout play-offs', top: 161, bottom: 188.5, topmost: 'itself' },
    focus: { text: 'GF', focusVisible: true, top: 127.4, topmost: 'itself' },
  }
  expect(pinFaults(pinned)).toEqual([])
  expect(pinFaults({ ...pinned, divider: null, focus: undefined })).toEqual([])
  // The reviewed head: both rows pinned at the top of the page, behind the band.
  expect(pinFaults({
    band: { top: 0, bottom: 133 },
    labels: { name: 'labels', top: 0, bottom: 28, topmost: 'the band' },
    divider: { name: 'Knockout play-offs', top: 28, bottom: 55.5, topmost: 'the band' },
    focus: { text: 'GF', focusVisible: true, top: 9.4, topmost: 'the band' },
  })).toEqual([
    'the labels are under the band',
    'the labels pin at 0.00, and the band ends at 133.00',
    'the Knockout play-offs divider is under the band',
    'the focused GF sort is under the band',
  ])
})

test('a control focused behind the band is brought out to the band’s foot', () => {
  expect(revealFaults({ text: '2:30 PM Bayern', before: 20, top: 118, band: 118, topmost: 'itself' })).toEqual([])
  expect(revealFaults({ text: '2:30 PM Bayern', before: 20, top: 20, band: 118, topmost: 'the band' }))
    .toEqual(['"2:30 PM Bayern" took focus at 20.00 and rests at 20.00, under the band; the band ends at 118.00'])
})

test('a standings row that takes focus under the labels and a divider is a fault', () => {
  const row = {
    text: '16. LASK, 6 points from 4 played', active: '16. LASK, 6 points from 4 played', landed: true, row: true,
    focusVisible: true, before: 119.06, top: 191.56, bottom: 245.56, points: 15, under: {},
    // The row's ring is the page's 2px line, drawn inside the row.
    ring: { offset: -2, width: 2 }, ringUnder: {},
  }
  expect(focusFaults(row)).toEqual([])
  // The reviewed head at 390: the browser counts the row as in view and leaves it where it is.
  expect(focusFaults({ ...row, top: 119.06, bottom: 173.06, under: { 'the labels': 5, 'the Knockout play-offs divider': 10 }, ringUnder: { 'the labels': 5 } })).toEqual([
    '"16. LASK, 6 points from 4 played" took focus at 119.06 and rests at 119.06 to 173.06, with 15 of 15 points under the labels and the Knockout play-offs divider',
    'the focus ring of "16. LASK, 6 points from 4 played" is under the labels',
  ])
  // The ring as PR 2's cycle left it: 2px drawn 2px outside the row. The row is whole, out
  // from under the stack, and the upper edge of its ring is under the zone's header, which
  // is positioned and paints over it whether or not it has pinned yet.
  expect(focusFaults({ ...row, ring: { offset: 2, width: 2 }, ringUnder: { 'the Knockout play-offs divider': 5, 'another element': 5 } })).toEqual([
    'the focus ring of "16. LASK, 6 points from 4 played" is drawn 4.00px outside its row, where a zone header paints over it',
    'the focus ring of "16. LASK, 6 points from 4 played" is under the Knockout play-offs divider and another element',
  ])
  // Flush with the row's edge is inside it: nothing is drawn beyond the row.
  expect(focusFaults({ ...row, ring: { offset: -2, width: 2 } })).toEqual([])
  expect(focusFaults({ ...row, ring: { offset: -1, width: 2 } }))
    .toEqual(['the focus ring of "16. LASK, 6 points from 4 played" is drawn 1.00px outside its row, where a zone header paints over it'])
  // A control that is not a row carries no ring reading and is not held to one.
  expect(focusFaults({ ...row, row: false, ring: undefined, ringUnder: undefined })).toEqual([])
  // One point is enough: 2.4.11 asks for not entirely hidden, and this asks for whole.
  expect(focusFaults({ ...row, top: 160, bottom: 214, under: { 'the Knockout play-offs divider': 1 } }))
    .toEqual(['"16. LASK, 6 points from 4 played" took focus at 119.06 and rests at 160.00 to 214.00, with 1 of 15 points under the Knockout play-offs divider'])
})

test('a sweep that lands on another control, or a control with no ring, is a fault and not a pass', () => {
  const chip = { text: 'La Liga', active: 'La Liga', landed: true, row: false, focusVisible: true, before: 20, top: 421, bottom: 451, points: 15, under: {} }
  expect(focusFaults(chip)).toEqual([])
  expect(focusFaults({ ...chip, landed: false, active: 'Premier League' })).toEqual(['Tab before "La Liga" went to "Premier League"'])
  expect(focusFaults({ ...chip, focusVisible: false })).toEqual(['"La Liga" took focus and shows no focus ring'])
  expect(focusFaults({ ...chip, top: 20, bottom: 50, under: { 'the band': 15 } }))
    .toEqual(['"La Liga" took focus at 20.00 and rests at 20.00 to 50.00, with 15 of 15 points under the band'])
})

// One press as the sweep records it: `owed` is its target's place among the table's controls, or -1.
const press = (owed: number, text = owed < 0 ? 'La Liga' : `${owed + 1}. Club`) => ({ text, row: owed >= 0, owed })
// The phone Table as the sweep reads it off the page: a row for each club in the standings,
// carrying that club's id, and one control in each row.
const clubs = [1, 2, 3, 4, 5].map((n) => ({ id: `${n}0`, name: `Club ${n}` }))
const rowControl = (place: number) => ({ name: `${place + 1}. Club`, row: place, reachable: true })
const phone = { within: '.page-measure', clubs, rows: clubs.map((club) => club.id), controls: clubs.map((_, place) => rowControl(place)) }
const whole = [press(-1), press(0), press(1), press(2), press(3), press(4)]

test('a sweep that pressed nothing is a fault, and so is a table control no press was aimed at', () => {
  expect(sweepFaults(whole, phone)).toEqual([])
  // The reviewed head on a page with no .page-measure: the rows were counted, nothing was pressed, and it passed.
  expect(sweepFaults([], phone)).toEqual([
    'no Tab was pressed: nothing a keyboard can reach is inside .page-measure',
    '5 of the table’s 5 controls were never the target of a press: "1. Club", "2. Club", "3. Club", …',
  ])
  // Not empty is not enough. The picker was reached and the table was not.
  expect(sweepFaults([press(-1)], phone)).toEqual(['5 of the table’s 5 controls were never the target of a press: "1. Club", "2. Club", "3. Club", …'])
  expect(sweepFaults(whole.filter((seen) => seen.owed !== 3), phone)).toEqual(['1 of the table’s 5 controls was never the target of a press: "4. Club"'])
  // A press is counted by the control it was aimed at, not by how many there were.
  expect(sweepFaults([press(-1), press(0), press(0), press(1), press(2), press(3)], phone)).toEqual(['1 of the table’s 5 controls was never the target of a press: "5. Club"'])
  // A judge told of no club and no named control would hold the table to nothing, so that is a fault.
  expect(sweepFaults(whole, { ...phone, clubs: null })).toEqual(['the sweep was not told what the table is owed: no club and no named control'])
  expect(sweepFaults(whole, { ...phone, clubs: [], named: [] })).toEqual(['the sweep was not told what the table is owed: no club and no named control'])
})

test('on the phone, each club in the standings has a row of its own that holds one control', () => {
  // The reviewed head: the second row's control sits in the first row. The rows held five
  // controls for five clubs, every one of them was pressed, and it passed.
  const moved = { ...phone, controls: phone.controls.map((control, place) => (place === 1 ? { ...control, row: 0 } : control)) }
  expect(sweepFaults(whole, moved)).toEqual([
    '1 of the standings’ 5 clubs has a row that holds no control a keyboard can reach: Club 2',
    '1 of the standings’ 5 clubs has a row that holds more than one control a keyboard can reach: Club 1 (2)',
  ])
  // So did two rows that carry one club's id, with a control in each.
  expect(sweepFaults(whole, { ...phone, rows: ['10', '10', '30', '40', '50'] })).toEqual([
    '1 of the standings’ 5 clubs has no row in the table: Club 2',
    '1 of the standings’ 5 clubs has more than one row in the table: Club 1 (2)',
  ])
  // A club is matched by its id, in the committed standings and on the page's row. The
  // standings hold a club the page has no row for:
  expect(sweepFaults(whole, { ...phone, clubs: [...clubs, { id: '60', name: 'Club 6' }] })).toEqual(['1 of the standings’ 6 clubs has no row in the table: Club 6'])
  // the fifth row is gone, and its control with it:
  expect(sweepFaults(whole.slice(0, 5), { ...phone, rows: phone.rows.slice(0, 4), controls: phone.controls.slice(0, 4) })).toEqual(['1 of the standings’ 5 clubs has no row in the table: Club 5'])
  // and the rows have lost their marker, so none is read as a row and no control sits in one.
  expect(sweepFaults(whole, { ...phone, rows: [], controls: phone.controls.map((control) => ({ ...control, row: -1 })) })).toEqual(['5 of the standings’ 5 clubs have no row in the table: Club 1, Club 2, Club 3, …'])
  // A row with no control of its own: gone from the page, or there and out of a keyboard's reach.
  expect(sweepFaults([press(-1), press(0), press(1), press(2), press(3, '5. Club')], { ...phone, controls: phone.controls.filter((_, place) => place !== 3) }))
    .toEqual(['1 of the standings’ 5 clubs has a row that holds no control a keyboard can reach: Club 4'])
  expect(sweepFaults(whole.filter((seen) => seen.owed !== 3), { ...phone, controls: phone.controls.map((control, place) => (place === 3 ? { ...control, reachable: false } : control)) }))
    .toEqual(['1 of the standings’ 5 clubs has a row that holds no control a keyboard can reach: Club 4'])
  // A row for a club the standings do not hold.
  expect(sweepFaults([...whole, press(5)], { ...phone, rows: [...phone.rows, '99'], controls: [...phone.controls, rowControl(5)] }))
    .toEqual(['1 of the table’s 6 rows is for a club the standings do not hold: "99"'])
})

test('on the desktop, the table is owed its six sort controls by name, each within reach and pressed', () => {
  // The names are the browser's: it folds the stylesheet's capitals into a name taken from
  // text, so the labels written Pl and Pts are the controls named PL and PTS. W, D and L
  // sort nothing, so they are text and no control carries their name.
  expect(DESKTOP_TABLE_CONTROLS).toEqual(['PL', 'GF', 'GA', 'GD', 'PTS', 'PPG'])
  // The desktop rows hold no control: the six are in the pinned row above them.
  const desk = {
    within: '.page-measure', named: DESKTOP_TABLE_CONTROLS, rows: clubs.map((club) => club.id),
    controls: DESKTOP_TABLE_CONTROLS.map((name) => ({ name, row: -1, reachable: true })),
  }
  const all = [press(-1), ...DESKTOP_TABLE_CONTROLS.map((name, place) => press(place, name))]
  expect(sweepFaults(all, desk)).toEqual([])
  // The reviewed head: the table held no control, the league picker was pressed, and it passed.
  expect(sweepFaults([press(-1)], { ...desk, controls: [] })).toEqual(['6 of the 6 controls owed by name are not in the table: "PL", "GF", "GA", …'])
  // In the table and out of a keyboard's reach is not held either.
  expect(sweepFaults([press(-1)], { ...desk, controls: desk.controls.map((control) => ({ ...control, reachable: false })) }))
    .toEqual(['6 of the 6 controls owed by name cannot be reached by a keyboard: "PL", "GF", "GA", …'])
  // Six controls are not the six: PTS reads PL, and every one of them was pressed.
  expect(sweepFaults(all, { ...desk, controls: desk.controls.map((control) => (control.name === 'PTS' ? { ...control, name: 'PL' } : control)) })).toEqual([
    '1 of the 6 controls owed by name is not in the table: "PTS"',
    '1 of the 6 controls owed by name is in the table more than once: "PL" (2)',
  ])
  // The label as it is written is not the name: a runner that read the text would have
  // passed "Pl" and "Pts", which no screen reader is handed.
  expect(sweepFaults(all, { ...desk, controls: desk.controls.map((control) => ({ ...control, name: { PL: 'Pl', PTS: 'Pts' }[control.name] ?? control.name })) })).toEqual([
    '2 of the 6 controls owed by name are not in the table: "PL", "PTS"',
  ])
  // W, D and L as the do-nothing buttons they were: three controls nothing owes, each a
  // stop for a keyboard, so each is owed a press the sweep never aimed.
  expect(sweepFaults(all, { ...desk, controls: [...desk.controls, ...['W', 'D', 'L'].map((name) => ({ name, row: -1, reachable: true }))] }))
    .toEqual(['3 of the table’s 9 controls were never the target of a press: "W", "D", "L"'])
  // Each is owed a press, and so is a control the list does not name: a row's, if one arrives.
  expect(sweepFaults(all.filter((seen) => seen.text !== 'PTS'), desk)).toEqual(['1 of the table’s 6 controls was never the target of a press: "PTS"'])
  expect(sweepFaults(all, { ...desk, controls: [...desk.controls, { name: '3. Club', row: 2, reachable: true }] }))
    .toEqual(['1 of the table’s 7 controls was never the target of a press: "3. Club"'])
  expect(sweepFaults([], desk)).toEqual([
    'no Tab was pressed: nothing a keyboard can reach is inside .page-measure',
    '6 of the table’s 6 controls were never the target of a press: "PL", "GF", "GA", …',
  ])
})

test('a control a keyboard reaches and the browser cannot name is a fault', () => {
  // A row that has lost its label and its text: it is in its row, within reach and pressed.
  const unnamed = { ...phone, controls: phone.controls.map((control, place) => (place === 2 ? { ...control, name: '' } : control)) }
  expect(sweepFaults(whole, unnamed)).toEqual(['1 of the table’s 5 controls has no name the browser computes'])
  expect(sweepFaults(whole, { ...phone, controls: phone.controls.map((control) => ({ ...control, name: '' })) }))
    .toEqual(['5 of the table’s 5 controls have no name the browser computes'])
  // Out of a keyboard's reach it is not a stop, so it is not held to a name here.
  expect(sweepFaults(whole.filter((seen) => seen.owed !== 2), { ...phone, clubs: null, named: ['1. Club'], controls: unnamed.controls.map((control, place) => (place === 2 ? { ...control, reachable: false } : control)) }))
    .toEqual([])
})

test('the Table’s own hit areas: six tabs, the key, and a row for each club or six sorts', () => {
  const at = (kind: string, name: string, left: number, top: number, w = 44, h = 44) => ({ kind, name: `${kind} ${name}`, left, right: left + w, top, bottom: top + h, w, h })
  const tabs = ['La Liga', 'Premier League', 'Serie A', 'Ligue 1', 'Bundesliga', 'Champions League'].map((name, i) => at('tab', name, 20 + (i % 3) * 106, 300 + Math.floor(i / 3) * 44, 106))
  const key = at('key', 'Zones & key', 20, 388, 320)
  const rows = [0, 1, 2].map((n) => at('row', `${n + 1}0`, 0, 520 + n * 91, 360, 91))
  const sorts = DESKTOP_TABLE_CONTROLS.map((name, i) => at('sort', name, 400 + i * 44, 432))
  expect(tableHitFaults([...tabs, key, ...rows], { layout: 'mobile', clubs: 3 })).toEqual([])
  expect(tableHitFaults([...tabs, key, ...sorts], { layout: 'desktop', clubs: 3 })).toEqual([])
  // A control that is not there has no hit area to fail, so the count is held first.
  expect(tableHitFaults([...tabs.slice(0, 5), key, ...rows.slice(0, 2)], { layout: 'mobile', clubs: 3 }))
    .toEqual(['5 tab hit areas, expected 6', '2 row hit areas, expected 3'])
  expect(tableHitFaults([...tabs, ...rows], { layout: 'mobile', clubs: 3 })).toEqual(['0 key hit areas, expected 1'])
  // A row control on the desktop, or a seventh sort, is a control nothing owes.
  expect(tableHitFaults([...tabs, key, ...sorts, rows[0]!], { layout: 'desktop', clubs: 3 })).toEqual(['1 row hit area, expected 0'])
  expect(tableHitFaults([...tabs, key, ...sorts, at('sort', 'W', 444, 500)], { layout: 'desktop', clubs: 3 })).toEqual(['7 sort hit areas, expected 6'])
  // The sort controls as the first edition drew them: a 15px line of text in a 34px row.
  expect(tableHitFaults([...tabs, key, ...sorts.map((box) => ({ ...box, h: 15, bottom: box.top + 15 }))], { layout: 'desktop', clubs: 3 }))
    .toEqual(DESKTOP_TABLE_CONTROLS.map((name) => `sort ${name} 44.00×15.00`))
  // Two tabs that overlap, and a tab drawn 30 tall with no padding to make its 44.
  expect(tableHitFaults([...tabs.slice(0, 5), { ...tabs[5]!, top: 330, bottom: 374 }, key, ...rows], { layout: 'mobile', clubs: 3 }))
    .toEqual(['tab Serie A overlaps tab Champions League'])
  expect(tableHitFaults([{ ...tabs[0]!, h: 30, bottom: 330 }, ...tabs.slice(1), key, ...rows], { layout: 'mobile', clubs: 3 }))
    .toEqual(['tab La Liga 106.00×30.00'])
})

test('before the app runs, the pinned rows and the scroll padding already start at the band’s foot', () => {
  const held = {
    hydrated: false, padding: 133, band: { top: 0, bottom: 133 },
    labels: { name: 'labels', top: 133, bottom: 161, topmost: 'itself' },
    divider: { name: 'Knockout play-offs', top: 161, bottom: 188.5, topmost: 'itself' },
  }
  expect(firstFrameFaults(held)).toEqual([])
  // The reviewed head at 360: the sheet's 118 stood in for a band that had wrapped to 133.
  expect(firstFrameFaults({
    ...held, padding: 118,
    labels: { name: 'labels', top: 118, bottom: 146, topmost: 'the band' },
    divider: { name: 'Knockout play-offs', top: 146, bottom: 173.5, topmost: 'itself' },
  })).toEqual([
    'the scroll padding is 118.00, and the band ends at 133.00',
    'the labels are under the band',
    'the labels pin at 118.00, and the band ends at 133.00',
  ])
  // A figure that is too tall hides nothing and is still wrong: the rows hang 15px under the band.
  expect(firstFrameFaults({
    ...held, band: { top: 0, bottom: 118 },
  })).toEqual([
    'the scroll padding is 133.00, and the band ends at 118.00',
    'the labels pin at 133.00, and the band ends at 118.00',
  ])
  // Held means held: a reading taken after the app ran proves nothing about the first frame.
  expect(firstFrameFaults({ ...held, hydrated: true })).toEqual(['the app ran while its scripts were held'])
})

test('one observer has the band: the server’s script until the app arrives, and the app’s alone after', () => {
  const script = { by: 'script', live: true }
  const app = { by: 'app', live: true }
  const stopped = { by: 'script', live: false }
  // `owned` is whether the app's observer was watching when the height was written.
  const write = (by: string, owned: boolean, value = '133px') => ({ value, by, owned })
  expect(handoffFaults('held', { watchers: [script], writes: [write('script', false), write('script', false, '118px')] })).toEqual([])
  expect(handoffFaults('hydrated', { watchers: [stopped, app], writes: [] })).toEqual([])
  expect(handoffFaults('wrapped', { watchers: [stopped, app], writes: [write('app', true, '118px')] })).toEqual([])
  // The reviewed head: the script never stops, and it is the one that publishes each wrap.
  expect(handoffFaults('hydrated', { watchers: [script, app], writes: [] })).toEqual(['the server’s script and the app watch the band, expected the app alone'])
  expect(handoffFaults('wrapped', { watchers: [script, app], writes: [write('script', true)] })).toEqual([
    'the server’s script and the app watch the band, expected the app alone',
    'the server’s script wrote the band’s height after the app had it',
    'the band changed height and the app published nothing',
  ])
  // What the script wrote before the app had the band is its own to write, whenever it is read.
  expect(handoffFaults('hydrated', { watchers: [stopped, app], writes: [write('script', false)] })).toEqual([])
  // One watcher is not enough: it has to be the right one. An app that never took the band
  // leaves the script on it, and a held page has no app to watch.
  expect(handoffFaults('hydrated', { watchers: [script], writes: [] })).toEqual(['the server’s script watches the band, expected the app alone'])
  expect(handoffFaults('held', { watchers: [app], writes: [write('script', false)] })).toEqual(['the app watches the band, expected the server’s script alone'])
  // A handoff made before the app's observer is watching leaves nothing watching.
  expect(handoffFaults('hydrated', { watchers: [stopped], writes: [] })).toEqual(['nothing watches the band, expected the app alone'])
  // The script told to stop while the app is still held.
  expect(handoffFaults('held', { watchers: [stopped], writes: [write('script', false)] })).toEqual(['nothing watches the band, expected the server’s script alone'])
  expect(handoffFaults('held', { watchers: [], writes: [] })).toEqual([
    'nothing watches the band, expected the server’s script alone',
    'the server’s script published no height before the app ran',
  ])
  // The app alone watches, and the wrap is not published: the figure is stale.
  expect(handoffFaults('wrapped', { watchers: [stopped, app], writes: [] })).toEqual(['the band changed height and the app published nothing'])
  // StrictMode mounts the effect twice. The observer it dropped is not a second watcher.
  expect(handoffFaults('hydrated', { watchers: [stopped, { by: 'app', live: false }, app], writes: [] })).toEqual([])
  expect(handoffFaults('hydrated', { watchers: [stopped, app, app], writes: [] })).toEqual(['the app and the app watch the band, expected the app alone'])
})

test('Moments paint: pulp ground and pulp-ink pass; the first edition’s ground or ink is a fault', () => {
  const pulp = 'rgb(235, 221, 190)'
  const pulpInk = 'rgb(28, 22, 17)'
  expect(momentsPaintFaults({ ground: pulp, ink: pulpInk, heading: pulpInk, pulp, pulpInk })).toEqual([])
  expect(momentsPaintFaults({ ground: pulp, ink: pulpInk, heading: null, pulp, pulpInk })).toEqual([])
  expect(momentsPaintFaults({ ground: 'rgb(247, 245, 238)', ink: pulpInk, heading: pulpInk, pulp, pulpInk }))
    .toEqual(['ground rgb(247, 245, 238), expected pulp rgb(235, 221, 190)'])
  expect(momentsPaintFaults({ ground: pulp, ink: 'rgb(22, 33, 27)', heading: 'rgb(22, 33, 27)', pulp, pulpInk })).toEqual([
    'inherited ink rgb(22, 33, 27), expected pulp-ink rgb(28, 22, 17)',
    'heading ink rgb(22, 33, 27), expected pulp-ink rgb(28, 22, 17)',
  ])
  expect(momentsPaintFaults(null)).toEqual(['the Moments route is missing'])
})

test('the desktop table has fifteen columns, in order, inside the 780px measure', () => {
  // The head as it is drawn at 1000: the table from 110 to 890, the club's column taking what is left.
  const widths = [3, 34, 36, 131, 44, 26, 26, 26, 44, 44, 44, 44, 44, 88, 146]
  const names = ['', 'Pos', '', 'Club', 'Pl', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'Pts', 'PPG', 'Form →', 'Next']
  let left = 110
  const cells = widths.map((width, i) => { const cell = { name: names[i]!, left, right: left + width }; left += width; return cell })
  const drawn = { cells, table: { right: 890, width: 780 }, overflow: [] as string[] }
  expect(columnFaults(drawn)).toEqual([])
  // A column gone, as a head that dropped W, D and L would be.
  expect(columnFaults({ ...drawn, cells: cells.filter((cell) => !['W', 'D', 'L'].includes(cell.name)) })).toEqual(['12 columns in the head, expected 15'])
  // The last column pushed past the table, and a column drawn over the one before it.
  expect(columnFaults({ ...drawn, cells: cells.map((cell, i) => (i === 14 ? { ...cell, right: 902 } : cell)) }))
    .toEqual(['the last column ends at 902.00, past the table’s edge at 890.00'])
  expect(columnFaults({ ...drawn, cells: cells.map((cell, i) => (i === 8 ? { ...cell, left: cell.left - 6 } : cell)) }))
    .toEqual(['column 9 (GF) starts at 430.00, inside column 8'])
  // A table that has left the measure, and a row whose cell is wider than its column.
  expect(columnFaults({ ...drawn, table: { right: 950, width: 900 } })).toEqual(['the table is 900.00 wide, past the 780px measure'])
  expect(columnFaults({ ...drawn, overflow: ['359', '382', '360', '367'] })).toEqual(['4 rows have a cell wider than its column: 359, 382, 360, …'])
  expect(columnFaults({ ...drawn, overflow: ['359'] })).toEqual(['1 row has a cell wider than its column: 359'])
})

// The next-fixture cells of the harness's cells state, as the runner reads them off the page.
const lead = 'Sat · S03 (H)'
const cell = (club: string, state: string, ...rest: string[]) => ({ club, state, units: [lead, ...rest], text: [lead, ...rest].join(' ') })
const phoneCells = [
  cell('Specimen Unset', 'unset', 'Sat 2026-11-21 — kickoff time not yet set by the league'),
  cell('Specimen Kicked', 'kicked-off', 'KICKED OFF'),
  cell('Specimen Nozone', 'set', '2:30 PM', 'local time not known'),
  cell('Specimen 04', 'set', '3:00 PM', '21:00 local'),
]
const deskCells = phoneCells.map((each) => (each.state === 'unset' ? cell(each.club, 'unset', 'time TBC') : each))

test('a Table state on the harness shows what it is there to show, in the layout the width draws', () => {
  const words = 'GAMES IN HAND\n2 clubs have a game in hand\nSpecimen Unset +1\nSat 2026-11-21 — kickoff time not yet set by the league\nSat · S03 (H) KICKED OFF\nlocal time not known'
  const drawn = { marks: 30, tables: 2, cells: phoneCells }
  expect(tableStateFaults('cells', 'mobile', { text: words, ...drawn })).toEqual([])
  // The desktop cell keeps its short words, so the phone's sentence does not answer for it.
  expect(tableStateFaults('cells', 'desktop', { text: words, ...drawn, cells: deskCells })).toEqual(['cells does not show /time TBC/i'])
  expect(tableStateFaults('cells', 'mobile', { text: words.replace('KICKED OFF', '3:00 PM'), ...drawn })).toEqual(['cells does not show /kicked off/i'])
  // The first edition's phone line, without the weekday and without "by the league", is not string 24.
  expect(tableStateFaults('cells', 'mobile', { text: words.replace('Sat 2026-11-21 — kickoff time not yet set by the league', '2026-11-21 — kickoff time not yet set'), ...drawn }))
    .toEqual(['cells does not show /kickoff time not yet set by the league/i'])
  // The sort is the desktop's: a phone is owed nothing by that state, and a desktop its note.
  expect(tableStateFaults('ppg', 'mobile', { text: '', ...drawn })).toEqual([])
  expect(tableStateFaults('ppg', 'desktop', { text: '', ...drawn, cells: deskCells })).toEqual(['ppg does not show /sorted by points per game\\./i'])
  // A season the zone data does not describe: the note in the app's words, and no band anywhere.
  const note = 'Zone bands are hidden: the snapshot is the 2025-26 season but the zone metadata describes 2026-27.'
  expect(tableStateFaults('season', 'mobile', { text: note, ...drawn, marks: 0 })).toEqual([])
  expect(tableStateFaults('season', 'mobile', { text: note, ...drawn, marks: 6 })).toEqual(['season draws 6 zone marks, and its bands are hidden'])
  expect(tableStateFaults('season', 'desktop', { text: `${note} Update LEAGUE_TABLES.`.replace('2026-27.', '2026-27'), ...drawn, marks: 0, cells: deskCells }))
    .toEqual(['season does not show /zone bands are hidden: the snapshot is the 2025-26 season but the zone metadata describes 2026-27\\./i'])
  // Every other state draws its bands, and an empty snapshot draws no table at all.
  expect(tableStateFaults('key', 'mobile', { text: 'Qualification zones Columns How ties are broken', ...drawn, marks: 0 })).toEqual(['key draws no zone mark'])
  expect(tableStateFaults('empty', 'mobile', { text: 'No table in the snapshot for Ligue 1 — run npm run sync.', marks: 0, tables: 0 })).toEqual([])
  expect(tableStateFaults('empty', 'mobile', { text: 'No table in the snapshot for Ligue 1 — run npm run sync.', marks: 0, tables: 2 })).toEqual(['empty draws 2 tables, and the snapshot holds none'])
  const open = [{ club: 'Specimen Kicked', more: 'W-D-L 1-1-2 PPG 1.00', expanded: 'true', owed: { wdl: '1-1-2', ppg: '1.00' } }]
  expect(tableStateFaults('opened', 'mobile', { text: 'W-D-L 1-1-2 PPG 1.00', ...drawn, tables: 1, opened: open })).toEqual(['opened draws 1 tables, expected the phone’s and the desktop’s'])
  expect(tableStateFaults('nope', 'mobile', { text: '', marks: 0, tables: 0 })).toEqual(['nope is not a Table state the runner knows'])
  // A state that draws a table and was handed no cells was not read, and that is not a pass.
  expect(tableStateFaults('key', 'mobile', { text: 'Qualification zones Columns How ties are broken', marks: 30, tables: 2 })).toEqual(['key: the next-fixture cells were not read'])
})

// The review of PR #352, finding 6. The state passed with "3:00 PM · 2–1" added to the
// KICKED OFF cell: every word it was owed was still somewhere on the page.
test('a next-fixture cell is held whole: its units and nothing more, and no clock or score its state forbids', () => {
  expect(nextCellFaults(phoneCells, 'mobile')).toEqual([])
  expect(nextCellFaults(deskCells, 'desktop')).toEqual([])
  const kicked = phoneCells[1]!
  // Text added to the cell beside its units, as the review added it.
  expect(nextCellFaults([{ ...kicked, text: `${kicked.text} 3:00 PM · 2–1` }], 'mobile')).toEqual([
    'Specimen Kicked’s cell shows "Sat · S03 (H) KICKED OFF 3:00 PM · 2–1", and its units read "Sat · S03 (H) KICKED OFF"',
    'Specimen Kicked’s cell prints a score: "Sat · S03 (H) KICKED OFF 3:00 PM · 2–1"',
    'Specimen Kicked has kicked off and the cell prints a clock: "Sat · S03 (H) KICKED OFF 3:00 PM · 2–1"',
  ])
  // The same clock as a unit of its own, and a kicked-off cell that kept its stadium clock.
  expect(nextCellFaults([cell('Specimen Kicked', 'kicked-off', 'KICKED OFF', '3:00 PM')], 'mobile')).toEqual([
    'Specimen Kicked has kicked off and the cell reads "KICKED OFF 3:00 PM", expected KICKED OFF alone',
    'Specimen Kicked has kicked off and the cell prints a clock: "Sat · S03 (H) KICKED OFF 3:00 PM"',
  ])
  expect(nextCellFaults([cell('Specimen Kicked', 'kicked-off', 'KICKED OFF', 'local time not known')], 'desktop')).toEqual([
    'Specimen Kicked has kicked off and the cell reads "KICKED OFF local time not known", expected KICKED OFF alone',
    'Specimen Kicked has kicked off and the cell prints a clock: "Sat · S03 (H) KICKED OFF local time not known"',
  ])
  // A kickoff the league has not set: the date in its line is not a clock, and a clock is.
  expect(nextCellFaults([cell('Specimen Unset', 'unset', 'Sat 2026-11-21 — kickoff time not yet set by the league', '8:00 PM')], 'mobile')).toEqual([
    'Specimen Unset’s kickoff is not set and the cell reads "Sat 2026-11-21 — kickoff time not yet set by the league 8:00 PM", expected the weekday, the date and “kickoff time not yet set by the league”',
    'Specimen Unset’s kickoff is not set and the cell prints a clock: "Sat · S03 (H) Sat 2026-11-21 — kickoff time not yet set by the league 8:00 PM"',
  ])
  // Each layout has its own words for it: the phone's are string 24 and the desktop's "time TBC".
  expect(nextCellFaults([cell('Specimen Unset', 'unset', '2026-11-21 — kickoff time not yet set')], 'mobile'))
    .toEqual(['Specimen Unset’s kickoff is not set and the cell reads "2026-11-21 — kickoff time not yet set", expected the weekday, the date and “kickoff time not yet set by the league”'])
  expect(nextCellFaults([cell('Specimen Unset', 'unset', 'time TBC')], 'mobile')).toHaveLength(1)
  expect(nextCellFaults([cell('Specimen Unset', 'unset', 'Sat 2026-11-21 — kickoff time not yet set by the league')], 'desktop'))
    .toEqual(['Specimen Unset’s kickoff is not set and the cell reads "Sat 2026-11-21 — kickoff time not yet set by the league", expected “time TBC”'])
  // A set cell is two clocks, or one and the words that stand for the other; never a score.
  expect(nextCellFaults([cell('Specimen 04', 'set', '3:00 PM')], 'mobile')).toEqual(['Specimen 04’s cell reads "3:00 PM", expected the Brooklyn clock and the stadium’s'])
  expect(nextCellFaults([cell('Specimen 04', 'set', '3:00 PM', '21:00 local', '2–1')], 'mobile')).toEqual([
    'Specimen 04’s cell prints a score: "Sat · S03 (H) 3:00 PM 21:00 local 2–1"',
    'Specimen 04’s cell reads "3:00 PM 21:00 local 2–1", expected the Brooklyn clock and the stadium’s',
  ])
  expect(nextCellFaults([{ club: 'Specimen 05', state: 'live', units: [lead], text: lead }], 'mobile')).toEqual(['Specimen 05’s cell is in the state "live", which is none of set, unset and kicked-off'])
  expect(nextCellFaults([{ club: 'Specimen 05', state: 'set', units: ['3:00 PM', '21:00 local'], text: '3:00 PM 21:00 local' }], 'mobile')).toEqual([
    'Specimen 05’s cell begins "3:00 PM", expected a day, an opponent and (H) or (A)',
    'Specimen 05’s cell reads "21:00 local", expected the Brooklyn clock and the stadium’s',
  ])
})

test('the cells state names three clubs, each in its own state, and the opened state one row with its own figures', () => {
  const words = 'Games in hand +1 Sat 2026-11-21 — kickoff time not yet set by the league KICKED OFF local time not known'
  const drawn = { text: words, marks: 30, tables: 2 }
  expect(tableStateFaults('cells', 'mobile', { ...drawn, cells: phoneCells })).toEqual([])
  // The review's case, through the state: the page still held every word it was owed.
  const tampered = phoneCells.map((each) => (each.club === 'Specimen Kicked' ? { ...each, text: `${each.text} 3:00 PM · 2–1` } : each))
  expect(tableStateFaults('cells', 'mobile', { ...drawn, cells: tampered })).toEqual([
    'cells: Specimen Kicked’s cell shows "Sat · S03 (H) KICKED OFF 3:00 PM · 2–1", and its units read "Sat · S03 (H) KICKED OFF"',
    'cells: Specimen Kicked’s cell prints a score: "Sat · S03 (H) KICKED OFF 3:00 PM · 2–1"',
    'cells: Specimen Kicked has kicked off and the cell prints a clock: "Sat · S03 (H) KICKED OFF 3:00 PM · 2–1"',
  ])
  // The words are on the page and the named club's cell is another club's state.
  expect(tableStateFaults('cells', 'mobile', { ...drawn, cells: phoneCells.map((each) => (each.club === 'Specimen Kicked' ? cell('Specimen Kicked', 'set', '3:00 PM', '21:00 local') : each)) }))
    .toEqual(['cells: Specimen Kicked’s cell is "set", expected "kicked-off"'])
  expect(tableStateFaults('cells', 'mobile', { ...drawn, cells: phoneCells.filter((each) => each.club !== 'Specimen Unset') })).toEqual(['cells: Specimen Unset has no next-fixture cell'])
  expect(tableStateFaults('cells', 'mobile', { ...drawn, cells: phoneCells.map((each) => (each.club === 'Specimen Nozone' ? cell('Specimen Nozone', 'set', '2:30 PM', '20:30 local') : each)) }))
    .toEqual(['cells: Specimen Nozone’s cell ends "20:30 local", expected “local time not known”'])

  const open = { club: 'Specimen Kicked', more: 'W-D-L 1-1-2 PPG 1.00', expanded: 'true', owed: { wdl: '1-1-2', ppg: '1.00' } }
  const opened = { text: 'W-D-L 1-1-2 PPG 1.00', marks: 30, tables: 2, cells: phoneCells }
  expect(tableStateFaults('opened', 'mobile', { ...opened, opened: [open] })).toEqual([])
  expect(tableStateFaults('opened', 'mobile', opened)).toEqual(['opened: the opened rows were not read'])
  // The count, the club, the figures and the state a screen reader is told.
  expect(tableStateFaults('opened', 'mobile', { ...opened, opened: [] })).toEqual(['opened draws 0 opened rows, expected one'])
  expect(tableStateFaults('opened', 'mobile', { ...opened, opened: [open, { ...open, club: 'Specimen 04' }] })).toEqual(['opened draws 2 opened rows, expected one', 'opened opens Specimen 04, expected Specimen Kicked'])
  expect(tableStateFaults('opened', 'mobile', { ...opened, opened: [{ ...open, more: 'W-D-L 2-1-1 PPG 1.75' }] })).toEqual(['opened: Specimen Kicked reads "W-D-L 2-1-1 PPG 1.75", and its row holds W-D-L 1-1-2 and PPG 1.00'])
  expect(tableStateFaults('opened', 'mobile', { ...opened, opened: [{ ...open, expanded: 'false' }] })).toEqual(['opened: Specimen Kicked’s row is drawn open and says aria-expanded="false"'])
  expect(tableStateFaults('opened', 'mobile', { ...opened, opened: [{ ...open, owed: null }] })).toEqual(['opened: Specimen Kicked is not a club of the specimen'])
  // The desktop's rows hold no control, so none of them is open there.
  expect(tableStateFaults('opened', 'desktop', { ...opened, cells: deskCells, opened: [] })).toEqual([])
  expect(tableStateFaults('opened', 'desktop', { ...opened, cells: deskCells, opened: [open] })).toEqual(['opened draws 1 opened row on the desktop, whose rows hold no control'])
})

// The review of PR #352, finding 3: Played and Points exchanged names, and the six names were still there once each.
test('a sort control’s name is bound to its column and to what a press on it does', () => {
  expect(DESKTOP_TABLE_SORTS.map((sort) => [sort.name, sort.column])).toEqual([['PL', 5], ['GF', 9], ['GA', 10], ['GD', 11], ['PTS', 12], ['PPG', 13]])
  const desk = {
    within: '.page-measure', named: DESKTOP_TABLE_CONTROLS, placed: DESKTOP_TABLE_SORTS, rows: clubs.map((club) => club.id),
    controls: DESKTOP_TABLE_SORTS.map((sort) => ({ name: sort.name, row: -1, column: sort.column, reachable: true })),
  }
  const all = [press(-1), ...DESKTOP_TABLE_CONTROLS.map((name, place) => press(place, name))]
  expect(sweepFaults(all, desk)).toEqual([])
  // The two-way swap: each name is in the table once, within reach and pressed, in the other's column.
  const swapped = desk.controls.map((control) => ({ ...control, name: ({ PL: 'PTS', PTS: 'PL' } as Record<string, string>)[control.name] ?? control.name }))
  expect(sweepFaults(all, { ...desk, controls: swapped })).toEqual(['2 of the 6 controls owed by name are not in the column of that name: "PL" (in column 12, and its column is 5), "PTS" (in column 5, and its column is 12)'])
  // Without the binding it passed, which is the review's finding.
  expect(sweepFaults(all, { ...desk, placed: null, controls: swapped })).toEqual([])
  // A named control outside the head stands in no column.
  expect(sweepFaults(all, { ...desk, controls: desk.controls.map((control) => (control.name === 'GD' ? { ...control, column: 0 } : control)) }))
    .toEqual(['1 of the 6 controls owed by name is not in the column of that name: "GD" (in column none, and its column is 11)'])

  // Four clubs whose figures all order them differently, so every press is its own order.
  const table = [
    { teamId: 'a', rank: 1, played: 10, gf: 20, ga: 12, pts: 24 },
    { teamId: 'b', rank: 2, played: 11, gf: 14, ga: 6, pts: 23 },
    { teamId: 'c', rank: 3, played: 9, gf: 25, ga: 20, pts: 20 },
    { teamId: 'd', rank: 4, played: 10, gf: 9, ga: 9, pts: 12 },
  ]
  const order = (name: string) => sortOrder(table, DESKTOP_TABLE_SORTS.find((sort) => sort.name === name)!)
  expect([order('PL'), order('GF'), order('GA'), order('GD'), order('PTS'), order('PPG')]).toEqual([
    ['b', 'a', 'd', 'c'], ['c', 'a', 'b', 'd'], ['b', 'd', 'a', 'c'], ['a', 'b', 'c', 'd'], ['a', 'b', 'c', 'd'], ['a', 'c', 'b', 'd'],
  ])
  // Equal figures fall back to league position: three clubs level on goal difference.
  expect(sortOrder([{ teamId: 'x', rank: 2, gf: 5, ga: 3 }, { teamId: 'y', rank: 1, gf: 4, ga: 2 }, { teamId: 'z', rank: 3, gf: 9, ga: 1 }], DESKTOP_TABLE_SORTS[3]!)).toEqual(['z', 'y', 'x'])
  const clean = DESKTOP_TABLE_SORTS.map((sort) => ({ name: sort.name, found: true, column: sort.column, marked: [sort.column], order: sortOrder(table, sort) }))
  expect(sortFaults(clean, table)).toEqual([])
  // The swap as a press sees it: the control named PL is the Points control, and the other way about.
  const crossed = clean.map((each) => (each.name === 'PL' ? { ...each, column: 12, marked: [12], order: order('PTS') } : each.name === 'PTS' ? { ...each, column: 5, marked: [5], order: order('PL') } : each))
  expect(sortFaults(crossed, table)).toEqual([
    'the control named "PL" stands in column 12 of the head, and that name’s column is 5',
    'a press on "PL" marked column 12 as sorted, expected column 5',
    'a press on "PL" did not order the table by matches played: it begins a, b, c, and the snapshot’s order begins b, a, d',
    'the control named "PTS" stands in column 5 of the head, and that name’s column is 12',
    'a press on "PTS" marked column 5 as sorted, expected column 12',
    'a press on "PTS" did not order the table by league position: it begins b, a, d, and the snapshot’s order begins a, b, c',
  ])
  // A press that sorts by nothing, a name no control computes, and a press that marked nothing.
  expect(sortFaults(clean.map((each) => (each.name === 'GA' ? { ...each, order: order('PTS') } : each)), table))
    .toEqual(['a press on "GA" did not order the table by goals against: it begins a, b, c, and the snapshot’s order begins b, d, a'])
  expect(sortFaults(clean.filter((each) => each.name !== 'PPG'), table)).toEqual(['no control is named "PPG", so its sort was never pressed'])
  expect(sortFaults(clean.map((each) => (each.name === 'GF' ? { ...each, marked: [] } : each)), table)).toEqual(['a press on "GF" marked no column as sorted, expected column 9'])
})

// The review of PR #352, finding 4: a transparent ring has the right width and offset, and nothing lies over it.
test('a focus ring is read as painted: its own colour on every edge with focus, and something else without', () => {
  const pulp = { r: 239, g: 234, b: 217 }
  const pitch = { r: 44, g: 122, b: 75 }
  // A 60 by 44 box, the height of a control. `ringed` draws a line `width` deep inside every edge but the ones in `bare`.
  const [W, H] = [60, 44]
  const image = (paint: (x: number, y: number) => { r: number; g: number; b: number }) => {
    const data = new Uint8Array(W * H * 4)
    for (let y = 0; y < H; y += 1) for (let x = 0; x < W; x += 1) data.set([paint(x, y).r, paint(x, y).g, paint(x, y).b, 255], 4 * (y * W + x))
    return { width: W, height: H, data }
  }
  const rested = image(() => pulp)
  const ringed = (colour = pitch, bare: string[] = [], width = 2) => image((x, y) => {
    const on = (y < width && !bare.includes('top')) || (y >= H - width && !bare.includes('bottom')) || (x < width && !bare.includes('left')) || (x >= W - width && !bare.includes('right'))
    return on ? colour : pulp
  })
  const read = (focused: ReturnType<typeof image>, ring = pitch) => ringPixels({ focused, rested, ring, width: 2, offset: -2 })
  const whole = read(ringed())
  expect(whole.edges).toEqual({ top: [2, 2, 2, 2, 2], bottom: [2, 2, 2, 2, 2], left: [2, 2, 2, 2, 2], right: [2, 2, 2, 2, 2] })
  expect(whole.ground).toBe('rgb(239, 234, 217)')
  expect(whole.contrast).toBeGreaterThan(4)
  const paint = { color: 'rgb(44, 122, 75)', alpha: 1, cut: [] as string[], ...whole }
  expect(ringPaintFaults('"1. Club"', paint)).toEqual([])

  // Transparent: the two captures are the same picture, and the colour says so first.
  const clear = read(rested, { r: 0, g: 0, b: 0 })
  expect(clear.edges).toEqual({ top: [0, 0, 0, 0, 0], bottom: [0, 0, 0, 0, 0], left: [0, 0, 0, 0, 0], right: [0, 0, 0, 0, 0] })
  expect(ringPaintFaults('"1. Club"', { color: 'rgba(0, 0, 0, 0)', alpha: 0, cut: [], ...clear })).toEqual(['the focus ring of "1. Club" is rgba(0, 0, 0, 0), which paints nothing'])
  // A zone header over the row's upper edge: three edges are the ring's and the top is the header's.
  expect(ringPaintFaults('"9. Club"', { ...paint, ...read(ringed(pitch, ['top'])) })).toEqual(['the focus ring of "9. Club" is not painted at 5 of 5 points on its top edge'])
  // A ring in the colour of the page it is on changes no pixel, so no point is the ring's.
  expect(ringPaintFaults('"1. Club"', { ...paint, color: 'rgb(239, 234, 217)', ...read(rested, pulp) })).toEqual([
    'the focus ring of "1. Club" is not painted at 5 of 5 points on its top edge',
    'the focus ring of "1. Club" is not painted at 5 of 5 points on its bottom edge',
    'the focus ring of "1. Club" is not painted at 5 of 5 points on its left edge',
    'the focus ring of "1. Club" is not painted at 5 of 5 points on its right edge',
    'the focus ring of "1. Club" is rgb(239, 234, 217), 1.00:1 against the rgb(239, 234, 217) it is drawn on',
  ])
  // Painted, and too close to the page to be seen: 3:1 is the floor for a ring.
  const faint = { r: 200, g: 196, b: 180 }
  const pale = read(ringed(faint), faint)
  expect(pale.edges.top).toEqual([2, 2, 2, 2, 2])
  expect(ringPaintFaults('"1. Club"', { ...paint, color: 'rgb(200, 196, 180)', ...pale })).toEqual([`the focus ring of "1. Club" is rgb(200, 196, 180), ${pale.contrast.toFixed(2)}:1 against the rgb(239, 234, 217) it is drawn on`])
  expect(ringPaintFaults('"1. Club"', { ...paint, alpha: 0.5, color: 'rgba(44, 122, 75, 0.5)' })).toEqual(['the focus ring of "1. Club" is rgba(44, 122, 75, 0.5), which the page shows through'])
  expect(ringPaintFaults('"1. Club"', { ...paint, cut: ['bottom'] })).toEqual(['the focus ring of "1. Club" is cut off at the bottom of the page'])

  // Through the press: a table control carries its reading, and one that was not sampled is no pass.
  const row = {
    text: '1. Club', active: '1. Club', landed: true, row: true, owed: 0, focusVisible: true, before: 163, top: 163, bottom: 254, points: 15, under: {},
    ring: { offset: -2, width: 2 }, ringUnder: {},
  }
  expect(focusFaults({ ...row, paint })).toEqual([])
  expect(focusFaults({ ...row, paint: { color: 'rgba(0, 0, 0, 0)', alpha: 0, cut: [], ...clear } })).toEqual(['the focus ring of "1. Club" is rgba(0, 0, 0, 0), which paints nothing'])
  expect(focusFaults(row)).toEqual(['the focus ring of "1. Club" was not sampled'])
  // A control outside the table is not held to a reading: its ring is the page's, drawn outside it.
  expect(focusFaults({ ...row, row: false, owed: -1, ring: undefined, ringUnder: undefined })).toEqual([])
})

// The review of PR #352, findings 5 and 2: a La Liga capture that showed Serie A, and a league the snapshot holds no table for.
test('a capture of a league is that league’s: the tab pressed and the provider’s clubs in order, or the empty page', () => {
  expect(TABLE_LEAGUE_KEYS).toEqual(['laliga', 'pl', 'seriea', 'ligue1', 'bundesliga', 'ucl'])
  const laliga = ['86', '83', '1068']
  const seriea = ['110', '103', '111']
  const page = { tabs: TABLE_LEAGUE_KEYS, pressed: ['laliga'], ids: laliga, empty: null, tables: 2 }
  expect(leagueFaults('laliga', laliga, page)).toEqual([])
  // Asked for La Liga, and Serie A opened: the same number of rows, and a cover that agrees with its own tab.
  expect(leagueFaults('laliga', laliga, { ...page, pressed: ['seriea'], ids: seriea })).toEqual([
    'asked for laliga, and the tab pressed is seriea',
    'row 1 is club "110", and the snapshot’s laliga table has "86" there',
  ])
  // The right tab over another league's rows, the right clubs out of the provider's order, and a row short.
  expect(leagueFaults('laliga', laliga, { ...page, ids: seriea })).toEqual(['row 1 is club "110", and the snapshot’s laliga table has "86" there'])
  expect(leagueFaults('laliga', laliga, { ...page, ids: ['86', '1068', '83'] })).toEqual(['row 2 is club "1068", and the snapshot’s laliga table has "83" there'])
  expect(leagueFaults('laliga', laliga, { ...page, ids: laliga.slice(0, 2) })).toEqual(['the page draws 2 rows, and the snapshot holds 3 laliga clubs'])
  expect(leagueFaults('laliga', laliga, { ...page, pressed: [] })).toEqual(['asked for laliga, and the tab pressed is none'])
  expect(leagueFaults('laliga', laliga, { ...page, pressed: ['laliga', 'pl'] })).toEqual(['asked for laliga, and the tab pressed is laliga and pl'])
  expect(leagueFaults('laliga', laliga, { ...page, tabs: TABLE_LEAGUE_KEYS.slice(0, 5) })).toEqual(['the tabs are laliga, pl, seriea, ligue1, bundesliga, expected laliga, pl, seriea, ligue1, bundesliga, ucl'])
  expect(leagueFaults('laliga', laliga, { ...page, empty: 'No table in the snapshot for La Liga — run npm run sync.', tables: 0, ids: [] })).toEqual([
    'the snapshot holds 3 laliga clubs, and the page says it has no table',
    'the page draws 0 rows, and the snapshot holds 3 laliga clubs',
  ])

  // The snapshot holds no Champions League table: the page owes its note, no table and no row.
  const none = { tabs: TABLE_LEAGUE_KEYS, pressed: ['ucl'], ids: [] as string[], empty: 'No table in the snapshot for Champions League — the provider no longer supplies the configured league-phase table.', tables: 0 }
  expect(leagueFaults('ucl', [], none)).toEqual([])
  expect(leagueFaults('ucl', [], { ...none, empty: null })).toEqual(['the snapshot holds no ucl table, and the page does not say so'])
  expect(leagueFaults('ucl', [], { ...none, tables: 2, ids: ['160'] })).toEqual(['the snapshot holds no ucl table, and the page draws 2 tables and 1 row'])
  expect(leagueFaults('ucl', [], { ...none, pressed: ['laliga'] })).toEqual(['asked for ucl, and the tab pressed is laliga'])
})

/** One fixture as the snapshot holds it: two clubs by id, a day, a status, and a score when it has one. */
const played = (competition: string, day: number, home: string, away: string, score: [number, number] | null, status = 'full_time') => ({
  competition, status, kickoffUtc: `2026-11-${String(day).padStart(2, '0')}T15:00:00.000Z`,
  home: { sourceId: home }, away: { sourceId: away }, ...(score ? { result: { home: score[0], away: score[1] } } : {}),
})

// The review of PR #352, question 11: the dot sentence as approved on 21 Nov 2026, bound to what it says.
test('the foot’s dot sentence is on the page as approved, and every dot is a result the snapshot does not hold for that club in that competition', () => {
  const fixtures = [
    played('pl', 3, 'a', 'b', [2, 0]),
    played('pl', 1, 'b', 'a', [1, 1]),
    played('pl', 5, 'a', 'c', [0, 3]),
    // Another competition's result, a match not played, and a score on a match that has not ended.
    played('ucl', 4, 'a', 'z', [4, 0]),
    played('pl', 7, 'a', 'b', null, 'scheduled'),
    played('pl', 6, 'c', 'b', [1, 0], 'suspended'),
  ]
  // Counted from the fixtures: this competition's alone, oldest to newest, for the clubs of this table.
  const held = heldResults('pl', ['a', 'b', 'c'], fixtures)
  expect(Object.fromEntries(held)).toEqual({
    a: { letters: ['D', 'W', 'L'], finished: 3 },
    b: { letters: ['D', 'L'], finished: 2 },
    c: { letters: ['W'], finished: 1 },
  })
  const page = {
    foot: ['Table read from the standings feed.', TABLE_FOOT_LAST],
    strips: [{ id: 'a', pips: ['D', 'W', 'L', '·', '·'] }, { id: 'b', pips: ['D', 'L', '·', '·', '·'] }, { id: 'c', pips: ['W', '·', '·', '·', '·'] }],
  }
  expect(dotFaults('pl', held, page)).toEqual([])

  // The words: the sentence before it was approved, string 8's clause with no qualifier, no foot, and the sentence anywhere but last.
  const short = 'Zones & key, opened, reads: form runs oldest to newest. A dot is an empty slot.'
  expect(TABLE_FOOT_LAST).toBe('Zones & key, opened, reads: form runs oldest to newest. A dot is an empty slot: the snapshot holds fewer than five finished results for that club in this competition.')
  expect(dotFaults('pl', held, { ...page, foot: [page.foot[0]!, short] })).toEqual([`the foot ends "${short}", and the approved sentence is "${TABLE_FOOT_LAST}"`])
  expect(dotFaults('pl', held, { ...page, foot: [page.foot[0]!, TABLE_FOOT_LAST.replace(' in this competition', '')] })).toHaveLength(1)
  expect(dotFaults('pl', held, { ...page, foot: [] })).toEqual([`the foot ends with no paragraph, and the approved sentence is "${TABLE_FOOT_LAST}"`])
  expect(dotFaults('pl', held, { ...page, foot: [TABLE_FOOT_LAST, page.foot[0]!] })).toHaveLength(1)

  // The dots. A dot where the snapshot holds a result, and a letter where it holds none.
  const withStrip = (id: string, pips: string[]) => ({ ...page, strips: page.strips.map((strip) => (strip.id === id ? { id, pips } : strip)) })
  expect(dotFaults('pl', held, withStrip('a', ['D', 'W', '·', '·', '·']))).toEqual(['club "a" draws DW···, and the snapshot’s pl fixtures give DWL··'])
  expect(dotFaults('pl', held, withStrip('c', ['W', 'W', '·', '·', '·']))).toEqual(['club "c" draws WW···, and the snapshot’s pl fixtures give W····'])
  // The other competition's win joined to this table's strip, the results newest first, and a strip of four slots.
  expect(dotFaults('pl', held, withStrip('a', ['D', 'W', 'W', 'L', '·']))).toHaveLength(1)
  expect(dotFaults('pl', held, withStrip('a', ['L', 'W', 'D', '·', '·']))).toHaveLength(1)
  expect(dotFaults('pl', held, withStrip('b', ['D', 'L', '·', '·']))).toHaveLength(1)
  // A row whose strip is not shown, a club with no row, and a club with two.
  expect(dotFaults('pl', held, withStrip('b', []))).toEqual(['club "b" draws no strip, and the snapshot’s pl fixtures give DL···'])
  expect(dotFaults('pl', held, { ...page, strips: page.strips.slice(0, 2) })).toEqual(['the page draws 2 strips, and the snapshot holds 3 pl clubs', 'club "c" has 0 rows with a strip'])
  expect(dotFaults('pl', held, { ...page, strips: [...page.strips, page.strips[0]!] })).toEqual(['the page draws 4 strips, and the snapshot holds 3 pl clubs', 'club "a" has 2 rows with a strip'])

  // Seven results: the latest five, oldest to newest, and no dot. The oldest five are a fault.
  const seven = heldResults('pl', ['a'], [1, 2, 3, 4, 5, 6, 7].map((day) => played('pl', day, 'a', `visitor-${day}`, [day % 3, 1])))
  expect(seven.get('a')).toEqual({ letters: ['D', 'W', 'L', 'D', 'W', 'L', 'D'], finished: 7 })
  expect(dotFaults('pl', seven, { foot: page.foot, strips: [{ id: 'a', pips: ['L', 'D', 'W', 'L', 'D'] }] })).toEqual([])
  expect(dotFaults('pl', seven, { foot: page.foot, strips: [{ id: 'a', pips: ['D', 'W', 'L', 'D', 'W'] }] })).toHaveLength(1)

  // What the sentence says cannot be: a dot beside five finished results. A strip has a letter for a
  // full-time result alone, so four of those and a fifth after extra time is a dot the sentence is not true of.
  const ended = [...[1, 2, 3, 4].map((day) => played('pl', day, 'a', `visitor-${day}`, [1, 0])), played('pl', 5, 'a', 'visitor-5', [2, 1], 'after_extra_time')]
  expect(dotFaults('pl', heldResults('pl', ['a'], ended), { foot: page.foot, strips: [{ id: 'a', pips: ['W', 'W', 'W', 'W', '·'] }] })).toEqual(['club "a" draws a dot, and the snapshot holds 5 finished results for it in pl'])
  // Three and one on penalties is four finished results: fewer than five, and the dots stand.
  const four = [...ended.slice(1, 4), played('pl', 6, 'visitor-6', 'a', [0, 0], 'after_penalties')]
  expect(heldResults('pl', ['a'], four).get('a')).toEqual({ letters: ['W', 'W', 'W'], finished: 4 })
  expect(dotFaults('pl', heldResults('pl', ['a'], four), { foot: page.foot, strips: [{ id: 'a', pips: ['W', 'W', 'W', '·', '·'] }] })).toEqual([])
})

test('the proofs that need rows open the longest table the snapshot holds', () => {
  const rows = (count: number) => Array.from({ length: count }, (_, i) => ({ teamId: String(i) }))
  const domestic = { laliga: rows(20), pl: rows(20), seriea: rows(20), ligue1: rows(18), bundesliga: rows(18) }
  expect(longestLeague({ ...domestic, ucl: rows(36) })).toBe('ucl')
  // Once the provider supplies no Champions League table: the first of the longest, in the tabs' order.
  expect(longestLeague(domestic)).toBe('laliga')
  expect(longestLeague({ ...domestic, ucl: [] })).toBe('laliga')
  expect(longestLeague({ pl: rows(20), ligue1: rows(18) })).toBe('pl')
  expect(() => longestLeague({})).toThrow('the snapshot holds no table for any league')
})

test('the empty page’s hit areas are its six tabs and nothing else', () => {
  const at = (kind: string, name: string, left: number, top: number, w = 44, h = 44) => ({ kind, name: `${kind} ${name}`, left, right: left + w, top, bottom: top + h, w, h })
  const tabs = ['La Liga', 'Premier League', 'Serie A', 'Ligue 1', 'Bundesliga', 'Champions League'].map((name, i) => at('tab', name, 20 + (i % 3) * 106, 300 + Math.floor(i / 3) * 44, 106))
  expect(tableHitFaults(tabs, { layout: 'empty', clubs: 0 })).toEqual([])
  expect(tableHitFaults(tabs.slice(0, 5), { layout: 'empty', clubs: 0 })).toEqual(['5 tab hit areas, expected 6'])
  // A key bar or a row on a page with no table is a control nothing owes.
  expect(tableHitFaults([...tabs, at('key', 'Zones & key', 20, 388, 320)], { layout: 'empty', clubs: 0 })).toEqual(['1 key hit area, expected 0'])
  expect(tableHitFaults([...tabs, at('row', '160', 0, 520, 360, 91)], { layout: 'empty', clubs: 0 })).toEqual(['1 row hit area, expected 0'])
})
