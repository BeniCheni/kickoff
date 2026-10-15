/** Production-empty Moments. Source: src/components/MomentsPage.tsx lines 223–228.
 *  N4 replaces this with the D9 gallery. */
export function MomentsEmpty() {
  return <main aria-label="Moments">
    <div className="rounded-[5px] border border-line border-l-3 border-l-floodlight bg-floodlight-bg px-2.5 py-2">
      <p className="label-caps text-[9.5px] text-floodlight-strong">Hand-curated · linked to rights holders · never played here</p>
    </div>
    <p className="mt-5 text-[13px] text-ink-muted">No moments curated yet.</p>
  </main>
}
