import { math } from "./math";
import { squiggle } from "./squiggle";
import { codeCopy } from "./code-copy";
import { figures } from "./figures";
import { blockquote } from "./blockquote";
import { tilNote } from "./til-note";

export const features = { gfm: true, smartPunctuation: true, math: true } as const;
export const mdastPlugins = [math];
export const hastPlugins = [squiggle, codeCopy, figures, blockquote, tilNote];
