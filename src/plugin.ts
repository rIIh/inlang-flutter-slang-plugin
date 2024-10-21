import { Plugin } from "@inlang/plugin"
import { displayName, description } from "../marketplace-manifest.json"
import { PluginSettings } from "./settings.js"
import { ideExtensionConfig } from "./ideExtension/config.js"
import { loadMessages, saveMessages } from "./json/json.js";

const id = "plugin.melvspace.slang"

export const plugin: Plugin<{
	[id]: PluginSettings
}> = {
	id,
	displayName,
	description,
	settingsSchema: PluginSettings,
	addCustomApi: () => ideExtensionConfig(),
	loadMessages: async ({ settings, nodeishFs }) => {
		settings[id].variableReferencePattern = settings[id].variableReferencePattern || ["{", "}"]
		return loadMessages({
			nodeishFs,
			pluginSettings: settings[id],
			languageTags: settings.languageTags,
			sourceLanguageTag: settings.sourceLanguageTag,
		})
	},
	saveMessages: async ({ messages, settings, nodeishFs }) => {
		settings[id].variableReferencePattern = settings[id].variableReferencePattern || ["{", "}"]
		return saveMessages({
			nodeishFs,
			pluginSettings: settings[id],
			messages,
		})
	},
}
