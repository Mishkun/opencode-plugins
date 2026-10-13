# opencode-bubble-tabs

OpenCode TUI plugin that moves session tabs to the front when they need you, like conversations in iMessage.

Requires OpenCode V2 2.0.28 or later with session tabs enabled.

## Install

Add the package to your global `~/.config/opencode/cli.json`:

```json
{
  "$schema": "https://opencode.ai/v2/cli.json",
  "plugins": ["opencode-bubble-tabs"]
}
```

OpenCode installs npm plugins automatically at startup.

## Use

A session's tab moves to the front when its turn finishes or fails, or when it asks for a permission or a question. Permissions and questions from subagents move their parent session's tab.

## Configure

Set `options.on` to choose what moves a tab:

```json
{
  "$schema": "https://opencode.ai/v2/cli.json",
  "plugins": [
    {
      "package": "opencode-bubble-tabs",
      "options": { "on": ["prompt", "done", "ask"] }
    }
  ]
}
```

- `"done"`: its turn finishes or fails.
- `"ask"`: it asks for a permission or a question.
- `"prompt"`: you submit a prompt.

Defaults to `["done", "ask"]`.

## Local Development

OpenCode auto-loads the local source from `.opencode/plugins/bubble-tabs/` when run from the package directory.

From the monorepo root:

```sh
bun install
bun run --filter opencode-bubble-tabs build
bun run --filter opencode-bubble-tabs typecheck
bun run --filter opencode-bubble-tabs test
bun run --filter opencode-bubble-tabs smoke
```

Restart OpenCode after changing plugin files or config.

## License

MIT
