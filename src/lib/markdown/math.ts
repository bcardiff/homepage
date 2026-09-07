import { defineMdastPlugin } from "satteri";
import katex from "katex";

const render = (tex: string, displayMode: boolean) =>
  katex.renderToString(tex, { displayMode, throwOnError: false, output: "htmlAndMathml" });

export const math = defineMdastPlugin({
  name: "math",
  math(node, ctx) {
    ctx.replaceNode(node, { type: "html", value: render(node.value, true) });
  },
  inlineMath(node, ctx) {
    ctx.replaceNode(node, { type: "html", value: render(node.value, false) });
  },
});
