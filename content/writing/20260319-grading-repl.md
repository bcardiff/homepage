---
slug: grading-with-a-repl
title: Grading with a REPL
kind: blog
status: published
tags: [teaching, prolog]
dek: A small tool, a large classroom, and what feedback loops do to motivation.
---

Placeholder body. The autograder started as a Prolog REPL with a timeout and grew a web front end when the queue got long.

```prolog
grade(Submission, Score) :-
    run_tests(Submission, Results),
    count_passed(Results, Score).
```

Placeholder closing paragraph.
