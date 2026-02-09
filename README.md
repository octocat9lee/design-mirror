# Design Mirror

Mirror any web UI with precision. This skill extracts complete design systems from websites — colors, typography, spacing, layout, components, and motion — then generates documentation and standalone replica pages for visual verification.

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/user/design-mirror.git
cd design-mirror

# 2. Start Claude Code
claude

# 3. Use the skill
/design-mirror https://example.com
```

No installation required — the skill is automatically available when you run Claude Code in this directory.

## Prerequisites

### 1. Node.js

Ensure Node.js is installed:

```bash
node -v
```

### 2. Chrome Browser

Chrome browser is required (stable version).

### 3. Configure chrome-devtools-mcp

Create a `.mcp.json` file in the project root (already included):

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
```

### 4. Verify MCP Connection

Start Claude Code in the project directory, then verify the connection:

```bash
claude mcp list
```

If you see `chrome-devtools: ... ✓ Connected`, the configuration is successful.

> **Note**: `chrome-devtools-mcp` will automatically launch a Chrome instance with remote debugging port. No manual configuration needed.

## Usage

### Basic Usage

Start Claude Code with bypass permissions (recommended for automation):

```bash
claude --dangerously-skip-permissions
```

Then use the skill:

```
/design-mirror create an exact replica of the homepage at https://motherduck.com/ and generate the corresponding HTML, CSS, and JavaScript files. Name the project: motherduck
```

Chinese prompt:

```
/design-mirror 对 https://motherduck.com/ 的首页进行一模一样的复刻，并生成对应的 html、css 以及 js 文件，项目名称为：motherduck
```

### Validation & Refinement

After initial replication, validate and refine the details:

```
请使用 chrome-devtools-mcp 对原始的页面以及复刻的网页进行逐步的细节校验，然后修正不一致的地方。
```

If you encounter context limit errors, use `/compact` to compress the context, then continue:

```
继续使用 chrome-devtools-mcp 对原始的页面以及复刻的网页进行逐步的细节校验，然后修正不一致的地方。
```

## Output Structure

All generated files are saved under `./style/`:

```
style/
├── <project>-style.md              # Style guide document
├── <project>-evidence/             # Extraction evidence (JSON/CSS/JS)
└── <project>-replica/              # Replica page
    ├── index.html
    ├── styles.css
    └── scripts.js
```
