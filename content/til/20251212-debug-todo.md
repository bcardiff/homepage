---
slug: debug-todo
status: published
tags: [elm, teaching]
---

Elm's `Debug.todo` is a fine teaching device for typed holes.

The compiler accepts `Debug.todo "later"` anywhere an expression is expected, so students can sketch the shape of a function, get it to type check, and fill the holes one by one. The build refuses to ship while any remain.
