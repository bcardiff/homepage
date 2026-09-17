import { readFile } from "node:fs/promises";
import { defineMdastPlugin } from "satteri";

const publicDir = new URL("../../../public/", import.meta.url);

export const inlineSvg = defineMdastPlugin({
  name: "inline-svg",
  image(node, ctx) {
    if (!node.url.endsWith(".inline.svg") || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(node.url)) return;

    const rootRelative = node.url.startsWith("/");
    if (!rootRelative && !ctx.fileURL) {
      throw new Error(`Cannot inline ${node.url} without the Markdown file URL`);
    }
    const url = new URL(rootRelative ? node.url.slice(1) : node.url, rootRelative ? publicDir : ctx.fileURL);
    return readFile(url, "utf8").then((source) => {
      const svg = source.replace(/^(?:\uFEFF)?<\?xml\s[\s\S]*?\?>\r?\n?/, "");
      const html = { type: "html" as const, value: svg };
      const parent = ctx.parent(node);
      if (parent?.type === "paragraph") {
        const nodeIndex = ctx.indexOf(node);
        const contentIndexes = parent.children
          .map((child, index) => (child.type === "text" && child.value.trim() === "" ? undefined : index))
          .filter((index): index is number => index !== undefined);
        if (contentIndexes.length === 1 && contentIndexes[0] === nodeIndex) {
          ctx.replaceNode(parent, html);
          return;
        }
      }
      ctx.replaceNode(node, html);
    });
  },
});
