import { BUNDLED_LANGUAGES as languages, getHighlighter, Highlighter } from "shiki";
import { Plugin, Transformer } from "unified";
import { Code, HTML, Root } from "mdast"
import visit from "unist-util-visit";

function escapeHTML(s: string): string {
	return s.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

const blockClassName = 'shiki'
const inlineClassName = 'shiki-inline'
const errorHtml = '<code>ERROR Rendering Code Block</code>'

export interface RemarkShikiOptions {
	theme: string;
	semantic: boolean;
	skipInline: boolean;
}

function highlight(code: Code, highlighter: Highlighter): string {
	if (code.lang)
		code.lang = normalizeLanguage(code.lang)
	if (isLanguageSupported(code.lang)) {
		const html = highlighter.codeToHtml(code.value, code.lang);
		return `<div class="gatsby-highlight" data-language="${code.lang}">${html}</div>`;
	} else {
		return `<div class="gatsby-highlight" data-language="${code.lang}"><pre class="shiki" style="background-color: var(--shiki-color-background);"><code class="language-${code.lang}">${escapeHTML(code.value)}</code></pre></div>`
	}
}

function normalizeLanguage(lang: string): string {
	const aliases = {
		cpp: ['cxx', 'c++', 'cc'],
		python: ['py', 'python', 'python3', 'python2', 'py2', 'py3'],
		rust: ['rs', 'rust'],
	}
	for (const [key, alias] of Object.entries(aliases)) {
		if (alias.find(t => t === lang)) {
			return key
		}
	}
	return lang
}

function isLanguageSupported(lang?: string): boolean {
	if (!lang)
		return false;
	return languages.find(l => l.id === lang || l.aliases?.includes(lang)) != undefined;
}

export const remarkShiki: Plugin<[Partial<RemarkShikiOptions>?], Root> = function (options): Transformer<Root> {
	const opts: RemarkShikiOptions = {
		theme: 'css-variables',
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
				// Skip if the language is not supported
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
