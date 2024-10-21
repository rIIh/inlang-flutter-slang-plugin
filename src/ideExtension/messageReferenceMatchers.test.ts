import { describe, expect, it } from "vitest"
import { parse } from "./messageReferenceMatchers.js" // Replace with the actual filename

describe("Paraglide Message Parser", () => {
	it("should match simple `context.t` call", () => {
		const sourceCode = `
		import 'package:application/i18n/strings.g.dart';
		context.t.helloWorld();
		`
		const result = parse(sourceCode)
		expect(result).toEqual([
			{
				messageId: "helloWorld",
				position: {
					start: { line: 3, character: 13 },
					end: { line: 3, character: 25 },
				},
			},
		])
	})

	it("should match nested `context.t` call", () => {
		const sourceCode = `
		import 'package:application/i18n/strings.g.dart';
		context.t.core.bla.page.helloWorld();
		`
		const result = parse(sourceCode)
		expect(result).toEqual([
			{
				messageId: "core.bla.page.helloWorld",
				position: {
					start: { line: 3, character: 13 },
					end: { line: 3, character: 39 },
				},
			},
		])
	})

	// it should match minified `context.t` call
	it("should match minified `context.t` call", () => {
		const sourceCode = `
		import 'package:application/i18n/strings.g.dart';context.t.helloWorld();context.t.hello_world(*);
		`
		const result = parse(sourceCode)
		expect(result).toEqual([
			{
				messageId: "helloWorld",
				position: {
					start: { line: 2, character: 62 },
					end: { line: 2, character: 74 },
				},
			},
			{
				messageId: "hello_world",
				position: {
					start: { line: 2, character: 85 },
					end: { line: 2, character: 99 },
				},
			},
		])
	})

	it("should match `context.t` call with arguments", () => {
		const sourceCode = `
		import 'package:application/i18n/strings.g.dart';
		
		context.t.someFunction({args1: "", args2: ""}, {languageTag: "en"});
		context.t.some_function({args1: "", args2: ""}, {languageTag: "en"});
		`
		const result = parse(sourceCode)
		expect(result).toEqual([
			{
				messageId: "someFunction",
				position: {
					start: { line: 4, character: 13 },
					end: { line: 4, character: 70 },
				},
			},
			{
				messageId: "some_function",
				position: {
					start: { line: 5, character: 13 },
					end: { line: 5, character: 71 },
				},
			},
		])
	})

	it("should match multiple messages", () => {
		const sourceCode = `
		import 'package:application/i18n/strings.g.dart';
		
		context.t.helloWorld();
		context.t.someFunction({args1: "", args2: ""}, {languageTag: "en"});
		`
		const result = parse(sourceCode)
		expect(result).toEqual([
			{
				messageId: "helloWorld",
				position: {
					start: { line: 4, character: 13 },
					end: { line: 4, character: 25 },
				},
			},
			{
				messageId: "someFunction",
				position: {
					start: { line: 5, character: 13 },
					end: { line: 5, character: 70 },
				},
			},
		])
	})

	it("should match message from multiple namespaces", () => {
		const namespaces = ["frontend", "backend", "example", "other", "project_1"]
		for (const namespace of namespaces) {
			const sourceCode = `
		import 'package:application/i18n/strings.g.dart';
		context.t.${namespace}.helloWorld();
		`
			const result = parse(sourceCode)
			expect(result).toEqual([
				{
					messageId: `${namespace}.helloWorld`,
					position: {
						start: { line: 3, character: 13 },
						end: { line: 3, character: 13 + `${namespace}.helloWorld`.length + 2 },
					},
				},
			])
		}
	})

	it("should match message with no namespace", () => {
		const sourceCode = `
		import 'package:application/i18n/strings.g.dart';
		context.t.helloWorld();
		`
		const result = parse(sourceCode)
		expect(result).toEqual([
			{
				messageId: "helloWorld",
				position: {
					start: { line: 3, character: 13 },
					end: { line: 3, character: 25 },
				},
			},
		])
	})

	it("should match mutiple references to @inlang/paraglide-js", () => {
		const sourceCode = `
		import 'package:application/i18n/strings.g.dart';

		@inlang/paraglide-js
		
		context.t.helloWorld();
		context.t.some_function_with_a_long_name({args1: "", args2: ""}, {languageTag: "en"});
		`
		const result = parse(sourceCode)
		expect(result).toEqual([
			{
				messageId: "helloWorld",
				position: {
					start: { line: 6, character: 13 },
					end: { line: 6, character: 25 },
				},
			},
			{
				messageId: "some_function_with_a_long_name",
				position: {
					start: { line: 7, character: 13 },
					end: { line: 7, character: 88 },
				},
			},
		])
	})

	it("should match the `context.t` with an object and the arguments a function call", () => {
		const sourceCode = `
		import 'package:application/i18n/strings.g.dart';
		context.t.helloWorld({args1: someFunction(), args2: otherFunction(), args3: "some string"});
		`
		const result = parse(sourceCode)
		expect(result).toEqual([
			{
				messageId: "helloWorld",
				position: {
					start: { line: 3, character: 13 },
					end: { line: 3, character: 94 },
				},
			},
		])
	})

	// it should match the `context.t` which do have function chaining
	it("should match the `context.t` which do have function chaining", () => {
		const sourceCode = `
		import 'package:application/i18n/strings.g.dart';
		context.t.helloWorld().someFunction().someOtherFunction();
		`
		const result = parse(sourceCode)
		expect(result).toEqual([
			{
				messageId: "helloWorld",
				position: {
					start: { line: 3, character: 13 },
					end: { line: 3, character: 25 },
				},
			},
		])
	})

	it("should match the `context.t` in a complete file", () => {
		const sourceCode = `
		import { createSignal } from "solid-js"
		import { showToast } from "./Toast.jsx"
		import { rpc } from "@inlang/rpc"
		import 'package:application/i18n/strings.g.dart';

		export function NewsletterForm() {
			const [email, setEmail] = createSignal("")
			const [loading, setLoading] = createSignal(false)

			const fetchSubscriber = async (email: any) => {
				setLoading(true)
				const response = await rpc.subscribeNewsletter({ email })
				if (!response.error) {
					if (response.data === "already subscribed") {
						showToast({
							title: "Could not subscribe",
							variant: "success",
							message: context.t.newsletter_error_alreadySubscribed(),
						})
					} else if (response.data === "success") {
						showToast({
							title: "Success",
							variant: "success",
							message: context.t.newsletter_success(),
						})
					} else {
						showToast({
							title: "Error",
							variant: "danger",
							message: context.t.newsletter_error_generic(),
						})
					}
				} else {
					showToast({
						title: "Error",
						variant: "danger",
						message: context.t.newsletter_error_generic(),
					})
				}

				setLoading(false)
				setEmail("")
			}

			return (
				<div>test</div>
			)
		};
		`
		const result = parse(sourceCode)
		expect(result).toEqual([
			{
				messageId: "newsletter_error_alreadySubscribed",
				position: {
					end: {
						character: 63,
						line: 19,
					},
					start: {
						character: 27,
						line: 19,
					},
				},
			},
			{
				messageId: "newsletter_success",
				position: {
					end: {
						character: 47,
						line: 25,
					},
					start: {
						character: 27,
						line: 25,
					},
				},
			},
			{
				messageId: "newsletter_error_generic",
				position: {
					end: {
						character: 53,
						line: 31,
					},
					start: {
						character: 27,
						line: 31,
					},
				},
			},
			{
				messageId: "newsletter_error_generic",
				position: {
					end: {
						character: 52,
						line: 38,
					},
					start: {
						character: 26,
						line: 38,
					},
				},
			},
		])
	})

	it("should parse function calls without parentheses", () => {
		const sourceCode = `import 'package:application/i18n/strings.g.dart';

		const a = {
			b: context.t.helloWorld,
			c: context.t.helloWorld(),
			d: context.t.helloWorld().someFunction(),
			e: context.t.this_is_a_message123,
		}
		`
		const result = parse(sourceCode)
		expect(result).toEqual([
			{
				messageId: "helloWorld",
				position: {
					start: { line: 4, character: 17 },
					end: { line: 4, character: 27 },
				},
			},
			{
				messageId: "helloWorld",
				position: {
					start: { line: 5, character: 17 },
					end: { line: 5, character: 29 },
				},
			},
			{
				messageId: "helloWorld",
				position: {
					start: { line: 6, character: 17 },
					end: { line: 6, character: 29 },
				},
			},
			{
				messageId: "this_is_a_message123",
				position: {
					start: { line: 7, character: 17 },
					end: { line: 7, character: 37 },
				},
			},
		])
	})

	it("should match a message in human readble id", () => {
		const sourceCode = `
		import 'package:application/i18n/strings.g.dart';
		context.t.penguin_purple_shoe_window();
		`
		const result = parse(sourceCode)
		expect(result).toEqual([
			{
				messageId: "penguin_purple_shoe_window",
				position: {
					start: { line: 3, character: 13 },
					end: { line: 3, character: 41 },
				},
			},
		])
	})

	it("should match if m is defined before the reference to paraglide", () => {
		const sourceCode = `
		context.t.helloWorld();
		import 'package:application/i18n/strings.g.dart';
		`
		const result = parse(sourceCode)
		expect(result).toEqual([])
	})

	it("should match if m is defined but no reference to paraglide", () => {
		const sourceCode = `
		context.t.helloWorld();
		`
		const result = parse(sourceCode)
		expect(result).toEqual([])
	})

	it("should match if m is defined but has a spell error", () => {
		const sourceCode = `
		import 'package:application/i18n/strings.g.dart';
		xcontext.t.helloWorld();
		`
		const result = parse(sourceCode)
		expect(result).toEqual([])
	})

	it("should match no matches", () => {
		const sourceCode = "const x = 42;"
		const result = parse(sourceCode)
		expect(result).toEqual([])
	})

	it("should match invalid syntax", () => {
		const sourceCode = "const x = 42; context.t.helloWorld("
		const result = parse(sourceCode)
		expect(result).toEqual([])
	})

	it("should return an empty array when parsing fails", () => {
		const sourceCode = undefined

		const result = parse(sourceCode as unknown as string)
		expect(result).toEqual([])
	})
})
