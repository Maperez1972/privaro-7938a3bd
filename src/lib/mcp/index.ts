import { defineMcp } from "@lovable.dev/mcp-js";
import detectPiiTool from "./tools/detect-pii";
import describePrivaroTool from "./tools/describe-privaro";

export default defineMcp({
  name: "privaro-mcp",
  title: "Privaro",
  version: "0.1.0",
  instructions:
    "Privaro MCP server. Use `detect_pii` to scan arbitrary text for sensitive entities (names, emails, IBAN, DNI, phone, SSN, credit cards, IPs, session IDs, policy numbers) and optionally return a tokenized version. Use `describe_privaro` to fetch a structured overview of the platform.",
  tools: [detectPiiTool, describePrivaroTool],
});
