# design-mirror

## 前提条件

### 1. Node.js 22+

确保安装了 Node.js 22 或更高版本：

```bash
node -v
```

### 2. Chrome 浏览器

需要安装 Chrome 浏览器（稳定版即可）。

### 3. 配置 chrome-devtools-mcp

在项目根目录下创建 `.mcp.json` 文件：

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

### 4. 验证 MCP 连接

在项目目录下启动 Claude Code，然后运行以下命令验证连接是否成功：

```bash
claude mcp list
```

如果显示 `chrome-devtools: ... ✓ Connected`，说明配置成功。

> **注意**：`chrome-devtools-mcp` 会自动启动一个带有远程调试端口的 Chrome 实例，无需手动配置。

## 提示词
使用`bypass permissions on`启动`claude code`
```
claude --dangerously-skip-permissions
```
在命令行使用如下的英文或者中文提示词：
``` prompt
/design-mirror create an exact replica of the homepage at https://motherduck.com/ and generate the corresponding HTML, CSS, and JavaScript files. Name the project: motherfuck
```
中文提示词：
``` prompt
/design-mirror 对https://motherduck.com/的首页进行一模一样的复刻，并生成对应的html、css以及js文件，项目名称为：motherfuck 
```

