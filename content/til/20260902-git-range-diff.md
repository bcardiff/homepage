---
slug: git-range-diff
status: published
tags: [git]
---

`git range-diff` compares two versions of a patch series. Exactly what rebase reviews need.

Given two ranges, it pairs commits by similarity and shows the diff of the diffs:

```shell
git range-diff main..feature@{1} main..feature
```

Commits that only changed their message show up as `=` with a small metadata diff, which is what makes it useful after a rebase.
