import { Plugin } from "@opencode/plugin/tui"

export default Plugin.define({
  id: "opencode-bubble-tabs",
  setup(ctx) {
    function bubble(sessionID: string) {
      if (!ctx.ui.tabs.enabled()) return
      if (!ctx.ui.tabs.list().some((tab) => tab.sessionID === sessionID)) return
      ctx.ui.tabs.move(sessionID, 0)
    }
    const root = (sessionID: string) => ctx.data.session.root(sessionID)

    // Subagent runs finish inside their parent's turn, so only root completions bubble.
    // Subagent questions and permissions block the parent, so they bubble its tab.
    const stops = [
      ctx.data.on("session.inbox.enqueued", (event) => {
        if (event.data.item.type === "user") bubble(root(event.data.sessionID))
      }),
      ctx.data.on("session.execution.succeeded", (event) => bubble(event.data.sessionID)),
      ctx.data.on("session.execution.failed", (event) => bubble(event.data.sessionID)),
      ctx.data.on("permission.asked", (event) => bubble(root(event.data.sessionID))),
      ctx.data.on("form.created", (event) => bubble(root(event.data.form.sessionID))),
    ]
    return () => {
      for (const stop of stops) stop()
    }
  },
})
