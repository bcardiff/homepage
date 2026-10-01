---
slug: lenient-aeson
title: Lenient Aeson
kind: blog
status: published
tags: [haskell, json]
dek: Manage malformed JSON in Haskell
---

Sometimes we need to make systems talk to each other. Each peer assumes the other's format. Althought there is documentation and tooling to reduce the changes of disagreement they might still happen. An assumption when the code written might not longer hold. This is a small take on how we can manage that situation when using Haskell and [Aeson](https://hackage.haskell.org/package/aeson).

Our case study is interacting with an endpoint that returns a list of items. As can be found in some pagination API.

```json
{"items": 
    [ { "id": 1, "name": "John" }
    , { "id": 2, "name": "Sarah" }
    ]
}
```

We might assume, or be informed that:

- the `id` is always present and a number.
- the `name` is always present and a string.

In such case we could define an `Item` type and define their `FromJSON`/`ToJSON` instance.

```haskell
import Data.Aeson
import GHC.Generics

data Item = Item {id :: Int, name :: String}
  deriving (Eq, Show, Generic)

instance FromJSON Item

instance ToJSON Item
```

As for the whole page we could define it in a similar way.

```haskell
data Page = Page {items :: [Item]}
  deriving (Eq, Show, Generic)

instance FromJSON Page

instance ToJSON Page
```

These types are simple and ergonomic to work with. The information of `id` and `name` are present, for all the items. Or you could assume that.

If any of the assumptions of the items shape do not hold the whole page fails to parse. This might halt the whole system if we need to process the items. **One bad item breaks the whole page**.

```haskell
import Data.Aeson.QQ.Simple (aesonQQ)

invalidPage =
  [aesonQQ|{"items":[
    { "id": 1, "name": "John" },
    { "id": 2, "name": "Sarah" },
    { "id": 3, "name": null }
  ]}|]
```

```console
ghci> ifromJSON @Page invalidPage
IError 
  [Key "items",Index 2,Key "name"] 
  "expected String, but encountered Null"
```

A couple of alternatives at hand would be

- To define `name` and/or `id` as `Maybe`s. 
- To define `Page` as `items :: [Data.Aeson.Value]`.

But I think we can do something more ergonmic. Define a `Lenient` type that will allow us to control boundaries for where the parsing can go wrong.

```haskell
data Page = Page {items :: [Lenient Item]}
  deriving (Eq, Show, Generic)

data Lenient a = Ok a | Malformed Value JSONPath String
  deriving (Eq, Show)

instance (FromJSON a) => FromJSON (Lenient a) where
  -- parseJSON = ...

instance (ToJSON a) => ToJSON (Lenient a) where
  -- toJSON = ...
```

With that, any parsing error within an item will not break the whole page.
We can still get errors when parsing a page if its schema change (eg: `items` not being a list). 

All in all we are indicating **where we can to tolerate parsing errors**. We are able to recover the original value, the parsing error withing the context: the 3rd items is malformed.

So when parsing an invalid page, instead of an error "expected String, but encountered Null" for the whole page, we will now get a hopefully more useful value.

```haskell
ghci> ifromJSON @Page invalidPage
ISuccess (
  Page {
    items = 
      [Ok (Item {id = 1, name = "John"})
      ,Ok (Item {id = 2, name = "Sarah"})
      ,Malformed 
        (Object (fromList [("id",Number 3.0),("name",Null)])) 
        [Key "name"] 
        "expected String, but encountered Null"
      ]
    }
)
```

We can extend the implementation with functions that will split malformed values.

```haskell
split :: [Lenient a] -> ([a], [(Value, JSONPath, String)])
```

From there we can easily define strategies around them: like reporting them without breaking the whole interaction with the system.

---

## Full code

```cabal
build-depends:    
    base ^>=4.20.2.0,
    aeson ^>=2.3.2.0
default-language: GHC2024
default-extensions:
    QuasiQuotes
```

```haskell
import Data.Aeson
import Data.Aeson.QQ.Simple (aesonQQ)
import Data.Aeson.Types (IResult (..), ifromJSON)
import GHC.Generics

data Item = Item {id :: Int, name :: String}
  deriving (Eq, Show, Generic)

instance FromJSON Item

instance ToJSON Item

data Page = Page {items :: [Lenient Item]}
  deriving (Eq, Show, Generic)

instance FromJSON Page

instance ToJSON Page

data Lenient a = Ok a | Malformed Value JSONPath String
  deriving (Eq, Show)

instance (FromJSON a) => FromJSON (Lenient a) where
  parseJSON v =
    pure $ case ifromJSON v of
      ISuccess a -> Ok a
      IError p s -> Malformed v p s

instance (ToJSON a) => ToJSON (Lenient a) where
  toJSON (Ok a) = toJSON a
  toJSON (Malformed original _ _) = original

page =
  [aesonQQ|{"items":[
    { "id": 1, "name": "John" },
    { "id": 2, "name": "Sarah" }
  ]}|]

invalidPage =
  [aesonQQ|{"items":[
    { "id": 1, "name": "John" },
    { "id": 2, "name": "Sarah" },
    { "id": 3, "name": null }
  ]}|]
```
