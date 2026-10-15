# opencode-idle-compaction

OpenCode plugin that compacts large sessions after they sit idle, just before their prompt cache expires. Inspired by Claude Code's idle compaction.

Resuming a long session after its cache expires bills the whole context as uncached input. Compacting while the cache is still warm reads it at the cached rate and leaves a small summary to resume from.

Requires OpenCode V2 2.0.29 or later.

## Install

Add the package to your OpenCode config:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": ["opencode-idle-compaction"]
}
```

OpenCode installs npm plugins automatically at startup.

## Use

When a session's turn ends with at least 200k tokens of context, it compacts after 54 minutes without activity. A new prompt or turn cancels the timer. Subagent sessions are skipped.

The 54 minute default targets a 1-hour cache TTL. Lower `idleMinutes` if your provider's cache expires sooner.

## Configure

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": [
    {
      "package": "opencode-idle-compaction",
      "options": {
        "idleMinutes": 54,
        "minTokens": 200000
      }
    }
  ]
}
```

- `idleMinutes`: minutes idle before compacting. Defaults to `54`.
- `minTokens`: minimum context size, in tokens, of the last request. Defaults to `200000`.

Idle timers live in memory, so restarting OpenCode drops them.

## Local Development

This package includes `.opencode/plugins/idle-compaction.ts`, so OpenCode auto-loads the local source when you run it from the package directory.

From the monorepo root:

```sh
bun install
bun run --filter opencode-idle-compaction build
bun run --filter opencode-idle-compaction typecheck
bun run --filter opencode-idle-compaction test
bun run --filter opencode-idle-compaction smoke
```

Restart OpenCode after changing plugin files or config.

## License

MIT
