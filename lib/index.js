"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remarkShiki = void 0;
const shiki_1 = require("shiki");
const unist_util_visit_1 = __importDefault(require("unist-util-visit"));
const synchronized_promise_1 = __importDefault(require("synchronized-promise"));
const blockClassName = 'shiki';
const inlineClassName = 'shiki-inline';
const errorHtml = '<code>ERROR Rendering Code Block</code>';
function highlight(code, highlighter) {
    const html = highlighter.codeToHtml(code.value, code.lang);
    return `<div class="gatsby-highlight" data-language="${code.lang}">${html}</div>`;
}
function isLanguageSupported(lang) {
    if (!lang)
        return false;
    return shiki_1.BUNDLED_LANGUAGES.find(l => { var _a; return l.id === lang || ((_a = l.aliases) === null || _a === void 0 ? void 0 : _a.includes(lang)); }) != undefined;
}
const remarkShiki = function (options) {
    const opts = Object.assign({ theme: "light_plus", semantic: false, skipInline: true, forceSync: false }, options);
    return root => {
        let highlighter;
        function highlightCode(code) {
            let value = "";
            try {
                value = highlight(code, highlighter);
            }
            catch (e) {
                console.log(e);
            }
            return value.replace('<code>', `<code class="language-${code.lang}">`);
        }
        function highlighInlineCode(code) {
            let value = "";
            try {
                value = highlight(code, highlighter);
            }
            catch (e) {
                console.log(e);
            }
            return value;
        }
        function transform(tag, highlightFunc) {
            unist_util_visit_1.default(root, tag, (code, _, parent) => {
                // Skip if the languaged is not supported
                if (!isLanguageSupported(code.lang))
                    return "skip";
                const html = {
                    type: 'html',
                    value: highlightFunc(code)
                };
                for (let i = 0; i < parent.children.length; ++i) {
                    if (parent.children[i] == code) {
                        parent.children[i] = html;
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
            highlighter = synchronized_promise_1.default(shiki_1.getHighlighter)({
                theme: opts.theme
            });
            execute();
        }
        else {
            shiki_1.getHighlighter({ theme: opts.theme }).then(h => {
                highlighter = h;
                execute();
            });
        }
    };
};
exports.remarkShiki = remarkShiki;
//# sourceMappingURL=index.js.map