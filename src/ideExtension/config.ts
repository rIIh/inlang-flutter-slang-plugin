import type { CustomApiInlangIdeExtension, Plugin } from "@inlang/plugin"
import { parse } from "./messageReferenceMatchers.js"
import transformMessageId from "./utils/transformMessageId.js"

export const ideExtensionConfig = (): ReturnType<Exclude<Plugin["addCustomApi"], undefined>> => ({
	"app.inlang.ideExtension": {
		messageReferenceMatchers: [
			async (args: { documentText: string }) => {
				return parse(args.documentText)
			},
		],
		extractMessageOptions: [
			{
				callback: (args: { messageId: string }) => {
					const messageId = transformMessageId(args.messageId)
					return {
						messageId,
						messageReplacement: `{context.t.${messageId.replace(':', '.')}}`,
					}
				},
			},
			{
				callback: (args: { messageId: string }) => {
					const messageId = transformMessageId(args.messageId)
					return {
						messageId,
						messageReplacement: `context.t.${messageId.replace(':', '.')}`,
					}
				},
			},
		],
		documentSelectors: [
			{
				language: "dart",
			}
		],
	} satisfies CustomApiInlangIdeExtension,
})

