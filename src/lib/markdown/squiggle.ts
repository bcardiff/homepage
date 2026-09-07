import { defineHastPlugin } from "satteri";
import { variant } from "../hash";

export const squiggle = defineHastPlugin({
  name: "squiggle",
  element: {
    filter: ["a"],
    visit(node, ctx) {
      const text = ctx.textContent(node).trim();
      if (!text) return;
      const existing = node.properties.className;
      const classes = Array.isArray(existing) ? existing.map(String) : [];
      return {
        ...node,
        properties: { ...node.properties, className: [...classes, "squig"], dataSquig: String(variant(text)) },
      };
    },
  },
});
