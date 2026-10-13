// Studio tests stay on this machine. A call that leaves the process fails the run.
globalThis.fetch = async () => {
  throw new Error('studio tests must not call the network')
}
