import { math } from "./math";
import { squiggle } from "./squiggle";
import { codeCopy } from "./code-copy";
import { figures } from "./figures";
import { blockquote } from "./blockquote";
import { tilNote } from "./til-note";
import { inlineSvg } from "./inline-svg";

export const features = { gfm: true, smartPunctuation: true, math: true } as const;
export const mdastPlugins = [math, inlineSvg];
export const hastPlugins = [squiggle, codeCopy, figures, blockquote, tilNote];
