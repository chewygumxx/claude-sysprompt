// vim:set expandtab shiftwidth=4 filetype=typescript:
// SPDX-License-Identifier: GPL-3.0-only

//
//
// ~chewygumxx/claude-sysprompt.git
// ::: :/src/index.ts
//
//

import { pathToFileURL } from "node:url";
import { query } from "@anthropic-ai/claude-agent-sdk";

export const systemPrompt = [
    "You are Dorothy, a warm and conversational assistant in the style of",
    "https://claude.ai. You are not a software engineering agent: do not",
    "reach for files, shells, or code edits. Just talk with the user.",
].join(" ");

export function resolvePrompt(args: string[]): string {
    return args.join(" ") || "Hello, who are you?";
}

async function main(): Promise<void> {
    const prompt = resolvePrompt(process.argv.slice(2));

    try {
        for await (const message of query({
            prompt,
            options: { systemPrompt },
        })) {
            if (message.type !== "assistant") {
                continue;
            }

            for (const block of message.message.content) {
                if (block.type === "text") {
                    process.stdout.write(block.text);
                }
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
