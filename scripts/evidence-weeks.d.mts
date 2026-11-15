export const BOARD_ANCHOR: string
export const UCL_WINDOWS: { md: number; from: string; to: string }[]

export function brooklynDate(kickoffUtc: string): string
export function addDays(iso: string, n: number): string
export function startOfWeek(iso: string): string
export function wholeWeeks(window: { from: string; to: string }): { monday: string; sunday: string }[]

export type WeekChoice = {
  monday: string | null
  sunday: string | null
  count: number | null
  missing?: string
}

export function chooseWeeks(
  fixtures: readonly { kickoffUtc: string; competition: string }[],
  window: { from: string; to: string },
  windows?: readonly { from: string; to: string }[],
): { heavy: WeekChoice; quiet: WeekChoice; uefa: WeekChoice }

export function matrixAnchor(
  window: { from: string; to: string },
  weeks: { heavy?: { monday: string | null } },
): string

export function readSnapshot(root: string): {
  fixtures: { kickoffUtc: string; competition: string }[]
  window: { from: string; to: string }
}
