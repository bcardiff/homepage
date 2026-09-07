import { defineHastPlugin, type PluginFactoryContext } from "satteri";

/** For files under content/til/, drop the first top-level paragraph (the one-liner shown in lists). */
export function tilNote(factory: PluginFactoryContext) {
  if (!factory.fileURL?.pathname.includes("/content/til/")) return null;
  let done = false;
  return defineHastPlugin({
    name: "til-note",
    element: {
      filter: ["p"],
      visit(node, ctx) {
        if (done) return;
        if (ctx.parent(node)?.type !== "root") return;
        done = true;
        ctx.removeNode(node);
      },
    },
  });
}
