import { defineHastPlugin } from "satteri";
import { clipboardSvg } from "./svg";

export const codeCopy = defineHastPlugin({
  name: "code-copy",
  element: {
    filter: ["pre"],
    visit(node, ctx) {
      // Astro's Shiki step sets data-language; before it runs (or in tests) fall back to the code child's language-* class.
      const code = node.children.find((c) => c.type === "element" && c.tagName === "code");
      const classes = code && code.type === "element" && Array.isArray(code.properties.className)
        ? code.properties.className.map(String)
        : [];
      const fromClass = classes.find((c) => c.startsWith("language-"))?.slice("language-".length) ?? "";
      const lang = String(node.properties.dataLanguage ?? fromClass);
      ctx.wrapNode(node, {
        type: "element",
        tagName: "figure",
        properties: { className: ["code"], dataLang: lang },
        children: [
          {
            type: "element",
            tagName: "button",
            properties: { type: "button", className: ["copy"], ariaLabel: "Copy code" },
            children: [
              { type: "raw", value: clipboardSvg() },
              { type: "element", tagName: "span", properties: {}, children: [{ type: "text", value: "Copy" }] },
            ],
          },
        ],
      });
    },
  },
});
