import GithubSlugger from 'github-slugger'
import { headingRank } from 'hast-util-heading-rank'
import { toString } from 'hast-util-to-string'
import { visit } from 'unist-util-visit'

import type { Element, Root } from 'hast';

export interface HeadlineInfo {
    level: number,
    title: string,
    link: string,

    child: HeadlineInfo[]
}

export interface Options {
    prefix?: string;
    output?: HeadlineInfo;
}

const emptyOptions: Options = {}
const slugs = new GithubSlugger()

/**
 * Process headlines for my blog.
 */
export default function rehype3rdToc(options?: Options | undefined | null) {
    const settings = options || emptyOptions
    const prefix = settings.prefix || ''

    return function (tree: Root) {
        slugs.reset();

        if(settings.output){
        const stack: HeadlineInfo[] = [settings.output];
            visit(tree, 'element', function (node: Element) {
                if( headingRank(node)) {
                    if(!node.properties.id) {
                        node.properties.id = prefix + slugs.slug(toString(node));
                    }
            
                    const level = headingRank(node) || 0;
                    const title = toString(node);

                    while(stack.length > 0 && stack[stack.length - 1].level >= level){
                        stack.pop();
                    }

                    if(stack.length > 0){
                        const cur = stack[stack.length - 1];

                        const info: HeadlineInfo = {
                        level: level,
                        title: title,
                        child: [],
                        link: node.properties.id as string
                        }

                        cur.child.push(info);

                        stack.push(info);
                    }
                }
            });
        } else {
            visit(tree, 'element', function (node: Element) {
                if( headingRank(node)) {
                    if(!node.properties.id) {
                        node.properties.id = prefix + slugs.slug(toString(node));
                    }
                }
            });
        }
    }
}