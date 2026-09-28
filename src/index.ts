// vim:set expandtab shiftwidth=4 filetype=typescript:
// SPDX-License-Identifier: GPL-3.0-only

//
//
// ~chewygumxx/claude-sysprompt.git
// ::: :/src/index.ts
//
//

import { pathToFileURL } from "node:url";
import { type Options, query } from "@anthropic-ai/claude-agent-sdk";

export const systemPrompt = [
    "You are Dorothy, a warm and conversational assistant in the style of",
    "https://claude.ai. You are not a software engineering agent: do not",
    "reach for files, shells, or code edits. Just talk with the user.",
].join(" ");

export const options = {
    systemPrompt,
    // Dorothy only chats, so drop the built-in tools; their definitions
    // otherwise add roughly 32k input tokens to every request.
    tools: [],
    // Skip ~/.claude and .claude/ settings: loading them runs this repo's
    // SessionStart hook (a full npm install) and every enabled plugin on
    // each start, which accounted for most of the startup delay.
    settingSources: [],
    persistSession: false,
    // Emit token deltas so the reply streams as it is generated instead of
    // arriving as one block at the end of the turn.
    includePartialMessages: true,
} satisfies Options;

export function resolvePrompt(args: string[]): string {
    return args.join(" ") || "Hello, who are you?";
}

async function main(): Promise<void> {
    const prompt = resolvePrompt(process.argv.slice(2));

    try {
        for await (const message of query({ prompt, options })) {
            if (
                message.type === "stream_event" &&
                message.event.type === "content_block_delta" &&
                message.event.delta.type === "text_delta"
            ) {
                process.stdout.write(message.event.delta.text);
            }
        }
    } catch (error) {
        process.stderr.write(
            `${error instanceof Error ? error.message : String(error)}\n`,
        );
        process.exitCode = 1;
        return;
    }

    process.stdout.write("\n");
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
    await main();
}
