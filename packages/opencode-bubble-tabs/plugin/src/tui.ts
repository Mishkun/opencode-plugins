import { Plugin } from "@opencode/plugin/tui"

const triggers = ["prompt", "done", "ask"] as const
type Trigger = (typeof triggers)[number]

function parseOn(value: unknown): ReadonlySet<Trigger> {
  if (value === undefined) return new Set(["done", "ask"])
  if (!Array.isArray(value) || !value.every((item) => triggers.includes(item))) {
    throw new Error('opencode-bubble-tabs on option must be an array of "prompt", "done", or "ask"')
  }
  return new Set(value)
}

export default Plugin.define({
  id: "opencode-bubble-tabs",
  setup(ctx) {
    const on = parseOn(ctx.options.on)

    function bubble(sessionID: string) {
      if (!ctx.ui.tabs.enabled()) return
      if (!ctx.ui.tabs.list().some((tab) => tab.sessionID === sessionID)) return
      ctx.ui.tabs.move(sessionID, 0)
    }
    const root = (sessionID: string) => ctx.data.session.root(sessionID)

    // Subagent runs finish inside their parent's turn, so only root completions bubble.
    // Subagent questions and permissions block the parent, so they bubble its tab.
    const stops: (() => void)[] = []
    if (on.has("prompt")) {
      stops.push(ctx.data.on("session.inbox.enqueued", (event) => {
        if (event.data.item.type === "user") bubble(root(event.data.sessionID))
      }))
    }
    if (on.has("done")) {
      stops.push(
        ctx.data.on("session.execution.succeeded", (event) => bubble(event.data.sessionID)),
        ctx.data.on("session.execution.failed", (event) => bubble(event.data.sessionID)),
      )
    }
    if (on.has("ask")) {
      stops.push(
        ctx.data.on("permission.asked", (event) => bubble(root(event.data.sessionID))),
        ctx.data.on("form.created", (event) => bubble(root(event.data.form.sessionID))),
      )
    }
    return () => {
      for (const stop of stops) stop()
    }
  },
})
