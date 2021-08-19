import { BUNDLED_LANGUAGES as languages, getHighlighter, Highlighter } from "shiki";
import { Plugin, Transformer } from "unified";
import { Code, HTML, Root } from "mdast"
import visit from "unist-util-visit";
import synchronize from "synchronized-promise";

const blockClassName = 'shiki'
const inlineClassName = 'shiki-inline'
const errorHtml = '<code>ERROR Rendering Code Block</code>'

export interface RemarkShikiOptions {
	theme: string;
	semantic: boolean;
	skipInline: boolean;
	forceSync: boolean;
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

export const remarkShiki: Plugin<[Partial<RemarkShikiOptions>?], Root> = function (options): Transformer<Root> {
	const opts: RemarkShikiOptions = {
		theme: "light_plus",
		semantic: false,
		skipInline: true,
		forceSync: false,
		...options
	};
	return root => {
		let highlighter: Highlighter;
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
		function execute() {
			transform('code', highlightCode);
			if (!opts.skipInline)
				transform('inlineCode', highlighInlineCode);
		}
		if (opts.forceSync) {
			highlighter = synchronize(getHighlighter)({
				theme: opts.theme
			});
			execute();
		}
		else {
			getHighlighter({ theme: opts.theme }).then(h => {
				highlighter = h;
				execute();
			});
		}
	}
}