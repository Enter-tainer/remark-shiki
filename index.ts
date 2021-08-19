import { BUNDLED_LANGUAGES as languages, getHighlighter, Highlighter } from "shiki";
import { escape } from "lodash";
import { Plugin, Transformer } from "unified";
import { Code, HTML, Root } from "mdast"
import visit from "unist-util-visit";

const blockClassName = 'shiki'
const inlineClassName = 'shiki-inline'
const errorHtml = '<code>ERROR Rendering Code Block</code>'

interface RemarkShikiOptions {
	theme: string;
	semantic: boolean;
	skipInline: boolean;
}

function highlight(code: Code, highlighter: Highlighter): string {
	const html = highlighter.codeToHtml(code.value, code.lang);
	return `<div class="gatsby-highlight" data-language="${code.lang}">${html}</div>`;
}

function isLanguageSupported(lang?: string): boolean {
	if (!lang)
		return false;
	return languages.find(l => l.id === lang || l.aliases?.includes(lang)) != undefined;
}

const remarkShiki: Plugin<[Partial<RemarkShikiOptions>?], Root> = function (options): Transformer<Root> {
	const opts: RemarkShikiOptions = {
		theme: "light_plus",
		semantic: false,
		skipInline: true,
		...options
	};
	return async root => {
		const highlighter = await getHighlighter({
			theme: opts.theme
		});
		function highlightCode(code: Code): string {
			let value = "";
			try {
				value = highlight(code, highlighter)
			} catch (e) {
				console.log(e);
			}
			return value.replace('<code>', `<code class="language-${code.lang}">`);
		}
		function highlighInlineCode(code: Code): string {
			let value = "";
			try {
				value = highlight(code, highlighter);
			} catch (e) {
				console.log(e);
			}
			return value;
		}
		function transform(tag: string, highlightFunc: (code: Code) => string) {
			visit(root, tag as any, (code: Code, _, parent) => {
				// Skip if the languaged is not supported
				if (!isLanguageSupported(code.lang))
					return "skip"
				const html: HTML = {
					type: 'html',
					value: highlightFunc(code)
				};
				for (let i = 0; i < parent!.children!.length; ++i) {
					if (parent!.children[i] == code) {
						parent!.children[i] = html;
						break;
					}
				}
				return 'skip';
			});
		}
		transform('code', highlightCode);
		if (!opts.skipInline)
			transform('inlineCode', highlighInlineCode);
	}
}

export = remarkShiki;