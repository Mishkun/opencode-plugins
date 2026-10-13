import { readFileSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"
import { Plugin } from "@opencode/plugin/tui"
import { parse, type ParseError } from "jsonc-parser"

type Scope = "cwd" | "global"

function readScope(text: string | undefined): Scope | undefined {
  if (!text) return
  const errors: ParseError[] = []
  const config: unknown = parse(text, errors, { allowTrailingComma: true })
  if (errors.length || typeof config !== "object" || config === null) return
  const scope = (config as { tabs?: { scope?: unknown } }).tabs?.scope
  return scope === "cwd" || scope === "global" ? scope : undefined
}

function readFile(file: string) {
  try {
    return readFileSync(file, "utf8")
  } catch {
    return undefined
  }
}

// Plugins cannot read the CLI config, so this mirrors how OpenCode resolves `tabs.scope` from cli.json.
// Read per event so changes from the config dialog apply without a restart.
function tabScope(): Scope {
  const root = process.env.XDG_CONFIG_HOME || join(homedir(), ".config")
  return readScope(process.env.OPENCODE_CLI_CONFIG_CONTENT) ?? readScope(readFile(join(root, "opencode", "cli.json"))) ?? "cwd"
}

export default Plugin.define({
  id: "opencode-external-tabs",
  setup(ctx) {
    return ctx.data.on("session.created", (event) => {
      if (event.data.parentID) return
      if (tabScope() === "cwd") {
        const directory = (ctx.location ?? ctx.data.location.default()).directory
        if (event.data.location.directory !== directory) return
      }
      ctx.ui.tabs.open(event.data.sessionID)
    })
  },
})
