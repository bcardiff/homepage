import { defineHastPlugin } from "satteri";
import type { Element } from "hast";
import { frameSvg } from "./svg";

export const figures = defineHastPlugin({
  name: "figures",
  element: {
    filter: ["p"],
    visit(node, ctx) {
      const kids = node.children.filter((c) => !(c.type === "text" && c.value.trim() === ""));
      if (kids.length !== 1) return;
      const img = kids[0];
      if (img.type !== "element" || img.tagName !== "img") return;

      const framed = img.properties.title === "framed";
      const alt = String(img.properties.alt ?? "");
      const { title: _title, ...rest } = img.properties;
      const image: Element = { ...img, properties: framed ? rest : img.properties };

      const children: unknown[] = framed
        ? [{ type: "element", tagName: "div", properties: {}, children: [{ type: "raw", value: frameSvg() }, image] }]
        : [image];
      if (alt) {
        children.push({ type: "element", tagName: "figcaption", properties: {}, children: [{ type: "text", value: alt }] });
      }
      ctx.replaceNode(node, {
        type: "element",
        tagName: "figure",
        properties: framed ? { className: ["framed"] } : {},
        children,
      } as never);
    },
  },
});
