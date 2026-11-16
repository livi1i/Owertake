import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { writeFile, mkdir } from "node:fs/promises";
const client = new Client({ name: "overtake-builder", version: "1.0.0" });
await client.connect(
  new StdioClientTransport({
    command: process.execPath,
    args: ["node_modules/@magicuidesign/mcp/dist/server.js"],
  }),
);
const listing = await client.listTools();
console.log(JSON.stringify(listing));
for (const name of ["blur-fade", "border-beam"]) {
  const result = await client.callTool({
    name: "getRegistryItem",
    arguments: { name, includeSource: true },
  });
  await mkdir("references/magicui", { recursive: true });
  await writeFile(
    `references/magicui/${name}.json`,
    JSON.stringify(result, null, 2),
  );
  console.log(name, JSON.stringify(result).slice(0, 700));
}
await client.close();
