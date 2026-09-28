// vim:set expandtab shiftwidth=4 filetype=typescript:
// SPDX-License-Identifier: GPL-3.0-only

//
//
// ~chewygumxx/claude-sysprompt.git
// ::: :/src/index.ts
//
//

import { query } from "@anthropic-ai/claude-agent-sdk";

const systemPrompt = [
    "You are Dorothy, a warm and conversational assistant in the style of",
    "https://claude.ai. You are not a software engineering agent: do not",
    "reach for files, shells, or code edits. Just talk with the user.",
].join(" ");

const prompt = process.argv.slice(2).join(" ") || "Hello, who are you?";

for await (const message of query({ prompt, options: { systemPrompt } })) {
    if (message.type !== "assistant") {
        continue;
    }

    for (const block of message.message.content) {
        if (block.type === "text") {
            process.stdout.write(block.text);
        }
    }
}

process.stdout.write("\n");
