import { expect, test } from 'vitest'
import { bandFaults, firstFrameFaults, focusFaults, hitAreaFaults, momentsPaintFaults, pinFaults, revealFaults, sweepFaults, tabFaults } from '../scripts/evidence.mjs'

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

test('pinned rows: flush under what pins above them, and topmost at their own centre', () => {
  const pinned = {
    band: { top: 0, bottom: 133 },
    labels: { name: 'labels', top: 133, bottom: 161, topmost: 'itself' },
    divider: { name: 'Knockout play-offs', top: 161, bottom: 188.5, topmost: 'itself' },
    focus: { text: 'W', focusVisible: true, top: 127.4, topmost: 'itself' },
  }
  expect(pinFaults(pinned)).toEqual([])
  expect(pinFaults({ ...pinned, divider: null, focus: undefined })).toEqual([])
  // The reviewed head: both rows pinned at the top of the page, behind the band.
  expect(pinFaults({
    band: { top: 0, bottom: 133 },
    labels: { name: 'labels', top: 0, bottom: 28, topmost: 'the band' },
    divider: { name: 'Knockout play-offs', top: 28, bottom: 55.5, topmost: 'the band' },
    focus: { text: 'W', focusVisible: true, top: 9.4, topmost: 'the band' },
  })).toEqual([
    'the labels are under the band',
    'the labels pin at 0.00, and the band ends at 133.00',
    'the Knockout play-offs divider is under the band',
    'the focused W sort is under the band',
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
    focusVisible: true, before: 119.06, top: 178.06, bottom: 232.06, points: 15, under: {}, ringUnder: {},
  }
  expect(focusFaults(row)).toEqual([])
  // The reviewed head at 390: the browser counts the row as in view and leaves it where it is.
  expect(focusFaults({ ...row, top: 119.06, bottom: 173.06, under: { 'the labels': 5, 'the Knockout play-offs divider': 10 }, ringUnder: { 'the band': 5 } })).toEqual([
    '"16. LASK, 6 points from 4 played" took focus at 119.06 and rests at 119.06 to 173.06, with 15 of 15 points under the labels and the Knockout play-offs divider',
    'the focus ring above "16. LASK, 6 points from 4 played" is under the band',
  ])
  // Out from under the stack and no further: the row is whole and its ring's upper edge is not.
  expect(focusFaults({ ...row, top: 173.06, bottom: 227.06, ringUnder: { 'the Knockout play-offs divider': 5 } }))
    .toEqual(['the focus ring above "16. LASK, 6 points from 4 played" is under the Knockout play-offs divider'])
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

test('a sweep that pressed nothing is a fault, and so is a table control no press was aimed at', () => {
  // One press as the sweep records it: `owed` is the control's place among the table's own, or -1.
  const press = (owed: number) => ({ text: owed < 0 ? 'La Liga' : `${owed + 1}. Club`, row: owed >= 0, owed })
  const table = ['1. Club', '2. Club', '3. Club', '4. Club', '5. Club']
  const phone = { within: '.page-measure', owed: table, inRows: 5, clubs: 5 }
  const whole = [press(-1), press(0), press(1), press(2), press(3), press(4)]
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
  // The phone table holds one control for each club in the standings, counted off the page.
  expect(sweepFaults(whole, { ...phone, clubs: 6 })).toEqual(['the table’s rows hold 5 controls, and the standings hold 6 clubs'])
  expect(sweepFaults(whole.slice(0, 5), { ...phone, owed: table.slice(0, 4), inRows: 4 })).toEqual(['the table’s rows hold 4 controls, and the standings hold 5 clubs'])
  // It is the rows that are counted. A row that has lost its marker is no longer read as one.
  expect(sweepFaults(whole, { ...phone, inRows: 0 })).toEqual(['the table’s rows hold 0 controls, and the standings hold 5 clubs'])
  // The desktop rows hold no control and are owed none: its nine sorts are in the pinned labels.
  const desk = { within: '.page-measure', owed: ['Pts', 'Pl'], inRows: 0, clubs: null }
  expect(sweepFaults([press(-1), { text: 'Pts', row: false, owed: 0 }, { text: 'Pl', row: false, owed: 1 }], desk)).toEqual([])
  expect(sweepFaults([], desk)).toEqual([
    'no Tab was pressed: nothing a keyboard can reach is inside .page-measure',
    '2 of the table’s 2 controls were never the target of a press: "Pts", "Pl"',
  ])
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
