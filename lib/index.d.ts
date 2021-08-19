import { Plugin } from "unified";
import { Root } from "mdast";
export interface RemarkShikiOptions {
    theme: string;
    semantic: boolean;
    skipInline: boolean;
    forceSync: boolean;
}
export declare const remarkShiki: Plugin<[Partial<RemarkShikiOptions>?], Root>;
