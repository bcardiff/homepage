---
slug: split-pdf-pages
status: published
tags: [pdf]
---

Export PDF as one image per page

```shell
gs -sDEVICE=pngalpha -o page-%03d.png -r600 input.pdf
```
