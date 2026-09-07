import { defineHastPlugin } from "satteri";
import { variant } from "../hash";
import { bracketSvg } from "./svg";

export const blockquote = defineHastPlugin({
  name: "blockquote",
  element: {
    filter: ["blockquote"],
    visit(node, ctx) {
      const v = variant(ctx.textContent(node));
      ctx.replaceNode(node, {
        type: "element",
        tagName: "blockquote",
        properties: { ...node.properties, dataBracket: String(v) },
        children: [{ type: "raw", value: bracketSvg(v) }, ...node.children],
      });
    },
  },
});
