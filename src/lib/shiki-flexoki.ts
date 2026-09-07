import type { ThemeRegistration } from "shiki";

type Hues = {
  red: string; orange: string; yellow: string; green: string;
  cyan: string; blue: string; purple: string; magenta: string;
  fg: string; muted: string; bg: string;
};

const light: Hues = {
  red: "#AF3029", orange: "#BC5215", yellow: "#AD8301", green: "#66800B",
  cyan: "#24837B", blue: "#205EA6", purple: "#5E409D", magenta: "#A02F6F",
  fg: "#282726", muted: "#6F6E69", bg: "#F2F0E5",
};

const dark: Hues = {
  red: "#D14D41", orange: "#DA702C", yellow: "#D0A215", green: "#879A39",
  cyan: "#3AA99F", blue: "#4385BE", purple: "#8B7EC8", magenta: "#CE5D97",
  fg: "#CECDC3", muted: "#878580", bg: "#1C1B1A",
};

function theme(name: string, type: "light" | "dark", h: Hues): ThemeRegistration {
  return {
    name,
    type,
    colors: { "editor.background": h.bg, "editor.foreground": h.fg },
    tokenColors: [
      { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: h.orange, fontStyle: "italic" } },
      { scope: ["keyword", "storage", "storage.type", "keyword.control"], settings: { foreground: h.purple } },
      { scope: ["string", "string.quoted", "punctuation.definition.string"], settings: { foreground: h.green } },
      { scope: ["constant.numeric", "constant.language", "constant.character"], settings: { foreground: h.magenta } },
      { scope: ["entity.name.function", "support.function", "meta.function-call"], settings: { foreground: h.blue } },
      { scope: ["entity.name.type", "entity.name.class", "support.type", "support.class", "entity.name.namespace"], settings: { foreground: h.yellow } },
      { scope: ["variable.parameter", "variable.other", "variable"], settings: { foreground: h.fg } },
      { scope: ["keyword.operator", "punctuation"], settings: { foreground: h.muted } },
      { scope: ["entity.name.tag", "meta.tag"], settings: { foreground: h.cyan } },
      { scope: ["invalid", "invalid.illegal"], settings: { foreground: h.red } },
      { scope: ["markup.heading", "markup.bold"], settings: { fontStyle: "bold" } },
      { scope: ["markup.italic"], settings: { fontStyle: "italic" } },
    ],
  };
}

export const flexokiLight = theme("flexoki-light", "light", light);
export const flexokiDark = theme("flexoki-dark", "dark", dark);
