import { unified } from 'unified';
import markdown from 'remark-parse';
import remark2rehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkShiki from '../index.js';
import fs from 'fs';
import raw from 'rehype-raw';

const data = fs.readFileSync('README.md')
var processor = unified()
	.use(markdown, { commonmark: true })
	.use(remarkShiki, { semantic: false, theme: 'dark-plus' })
	.use(remark2rehype, { allowDangerousHtml: true })
	.use(raw)
	.use(rehypeStringify);

processor.process(data).then(vfile => fs.writeFile('test/result.html', vfile.value, () => console.log("Finished")));
