---
slug: types-as-a-conversation
title: Types as a conversation, not a contract
kind: essay
status: published
tags: [types, teaching, compilers]
dek: What teaching type systems to second-year students changed about how I read compiler errors.
---

Every year I stand in front of eighty students and tell them that a type checker is a tool that helps them. Every year, by week three, most of them have concluded the opposite. The compiler is a gatekeeper. It says no. It says no in a language they do not yet speak, and it says no about code that, as far as they can tell, is obviously correct.

For a long time I thought this was a presentation problem. Better error messages, friendlier tooling, a gentler first week. Some of that helps. But the students who eventually make peace with the type checker do not do so because the messages got nicer. They do so because they stop reading the messages as verdicts and start reading them as [questions](https://en.wikipedia.org/wiki/Type_inference).

## The contract reading

The usual framing goes like this. A type signature is a contract. The caller promises to provide certain things, the function promises to return certain things, and the checker enforces the deal. This is accurate, and it is also the framing that produces the gatekeeper experience, because contracts are things you either satisfy or violate.

![Fig. 1 — The checker as gate vs. the checker as a second reader.](gate-vs-reader.png "framed")

Consider what a student actually sees when they write a function that folds over a list and get back four lines about an expected `Int` and a found `List Int`. Under the contract reading, they have broken a rule. Under the other reading, the checker has noticed something about their code that they had not, and is pointing at it.

> The compiler is not telling you that you are wrong. It is telling you what it understood, and asking whether that is what you meant.

## Reading errors as questions

Here is the exercise I now run in week three. Students bring an error they cannot resolve. Before anyone touches the code, we rewrite the message as a question the compiler is asking. The four lines above become: *you told me this returns a number; the last thing you do produces a list; which did you mean?*

```haskell
sum : List Int -> Int
sum xs =
  List.foldl (\x acc -> x :: acc) [] xs
  -- ^ expected Int, found List Int
```

It is a small reframing, and it does not change what the students must do next. What changes is who they think they are arguing with. The contract reading puts the compiler across the table. The conversation reading puts it on the same side, looking at the same code.

I have started to read my own errors this way too, twelve years into maintaining a compiler that produces them. It turns out the habit is not about students at all.
