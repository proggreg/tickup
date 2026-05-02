import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";

/**
 * Vuetify MCP bridge
 *
 * This extension exposes a simple tool that lets pi call the `vuetify/mcp`
 * Model Context Protocol server via the MCP CLI.
 *
 * Assumptions / setup:
 * - You have the MCP CLI installed, e.g.:
 *     pnpm dlx @modelcontextprotocol/cli@latest
 *   or
 *     npm install -g @modelcontextprotocol/cli
 * - You can run the Vuetify MCP server from the CLI, e.g.:
 *     mcp run vuetify/mcp
 *   If the command is different in your setup, adjust `MCP_COMMAND` below.
 *
 * The tool is intentionally generic: the LLM can ask it to call any
 * Vuetify MCP tool by name with a JSON-encoded argument object.
 */

// Use npx to run the Vuetify MCP package by default.
// Equivalent to: npx -y @vuetify/mcp ...
const MCP_COMMAND = "npx";
const MCP_PACKAGE = "@vuetify/mcp";

export default function (pi: ExtensionAPI) {
  pi.registerTool({
    name: "vuetify_mcp_call",
    label: "Vuetify MCP",
    description:
      "Call a tool on the vuetify/mcp Model Context Protocol server. " +
      "Use this for Vuetify component docs, props, and code examples.",
    // We keep the schema simple and generic. The LLM can supply the
    // tool name and a JSON object as a string for arguments.
    parameters: Type.Object({
      tool: Type.String({
        description: "Name of the Vuetify MCP tool to call (e.g. 'components', 'docs', etc.)",
      }),
      argsJson: Type.Optional(
        Type.String({
          description:
            "JSON object with arguments for the MCP tool. " +
            "Leave empty if the tool takes no parameters.",
        }),
      ),
    }),

    async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
      const args = params.argsJson ? params.argsJson.trim() : "{}";

      // We shell out to the MCP CLI in a very generic way, using its
      // `call` subcommand. You may need to adjust this depending on the
      // exact CLI UX of the version you have installed.
      const command = MCP_COMMAND;
      const cliArgs = [
        "-y",
        MCP_PACKAGE,
        "call",
        params.tool,
        args,
      ];

      let stdout = "";
      let stderr = "";

      try {
        const result = await pi.exec(command, cliArgs, { timeout: 60_000 });
        stdout = result.stdout ?? "";
        stderr = result.stderr ?? "";

        if (result.code !== 0) {
          const message =
            "Vuetify MCP command failed (non‑zero exit code).\n" +
            (stderr || stdout || "No output.");
          return {
            content: [{ type: "text", text: message }],
            details: {
              success: false,
              exitCode: result.code,
              stdout,
              stderr,
            },
            isError: true,
          } as const;
        }

        // Try to parse JSON if the server returns it, but fall back to raw text.
        let parsed: unknown = null;
        let text = stdout.trim();
        if (text.startsWith("{") || text.startsWith("[")) {
          try {
            parsed = JSON.parse(text);
          } catch {
            // ignore, keep text as-is
          }
        }

        return {
          content: [
            {
              type: "text",
              text:
                parsed != null
                  ? JSON.stringify(parsed, null, 2)
                  : text || "(Vuetify MCP call returned no output)",
            },
          ],
          details: {
            success: true,
            stdout,
            stderr,
            parsed,
          },
        } as const;
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text:
                "Error while calling Vuetify MCP: " +
                (error?.message || String(error)),
            },
          ],
          details: {
            success: false,
            error: error?.message || String(error),
            stdout,
            stderr,
          },
          isError: true,
        } as const;
      }
    },
  });
}
