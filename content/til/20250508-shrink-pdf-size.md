---
slug: shrink-pdf-size
status: published
tags: [pdf]
---

How to reduce the size of a PDF

```shell
ps2pdf -dPDFSETTINGS=/ebook input.pdf output.pdf
```

Using `/screen` instead of `/ebook` will compres it further but might be too much.

I particularly use this when scanning documents with my phone as the resulting files are usually very big.

Source: https://stackoverflow.com/a/14384178/30948