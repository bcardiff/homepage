---
slug: como-instalar-haskell
title: ¿Cómo instalar Haskell?
kind: blog
status: published
date: 2025-03-24
tags: [haskell]
dek: Cómo configurar GHC y VSCode
---

Hay varias opciones para instalar las herramientas necesarias para programar en Haskell y también varias opciones sobre cómo usarlas. A continuación se presenta una serie de pasos y algunas opciones para que elijamos según nuestra preferencia. No es una guía exhaustiva. El objetivo es disponer de un entorno moderno que nos permita experimentar y aprender el lenguaje.

<iframe width="560" height="315" src="https://www.youtube.com/embed/jgWWg_o5lf0?si=4g34Jsqfcrx1vZ-q" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## GHCup
Primero vamos a instalar el instalador GHCup. En https://www.haskell.org/ghcup/ vamos a encontrar el siguiente comando que funciona para Linux, macOS, FreeBSD o [WSL2](https://docs.microsoft.com/en-us/windows/wsl/) y lo podemos ejecutar desde una terminal.

```shell
% curl --proto '=https' --tlsv1.2 -sSf https://get-ghcup.haskell.org | sh
```

Nos va a hacer algunas preguntas, podemos usar las opciones por defecto que son buenas.

Después de ejecutar el comando de arriba vamos a tener un ejecutable de `ghcup` en `~/.ghcup/bin` (ese `~` representa la ruta de su usuario: seguramente `/home/nombreusuario`,  `/Users/nombreusuario` o `/mnt/c/Users/nombreusuario`)

Tenemos que verificar si el directorio `~/.ghcup/bin` está en el `PATH` o no. Ejecutando `ghcup --version` deberíamos ver algo como lo siguiente:

```console
% ghcup --version
The GHCup Haskell installer, version 0.1.40.0
```

Si en cambio ven algo como `command not found` significa que  `~/.ghcup/bin` no está en el `PATH` y debemos agregarlo. Cómo, depende de qué sistema operativo y _shell_ usemos, pero tenemos que agregar `~/.ghcup/bin` al `PATH`. Seguramente necesitemos poner la ruta completa de `~`.

Por ejemplo si usan macOS y zsh agregando lo siguiente a `~/.zprofile` vamos a lograr tener `ghcup` en el path.

```shell
export PATH="/Users/nombreusuario/.ghcup/bin:$PATH"
```

Si hacemos algún cambio para modificar el `PATH` cerremos y volvamos a abrir la terminal. Probemos si `ghcup --version` anda esta vez.

Si anduvo ya está la parte más engorrosa.

## GHC
GHC es un compilador del lenguaje Haskell. Hay muchas versiones. GHCup permite elegir entre ellas, instalar una o varias versiones y definir cuál es la versión por defecto que se va a usar cuando se ejecute el comando `ghc`.

Entre todas las versiones hay una que se llama _recommended_. Actualmente es la 9.4.8.

Si ejecutamos `ghcup tui` vamos a ver un menu para elegir instalar (presionando `i`) y establecer como default (presionando `s`).

```shell
% ghcup tui
```

Seguramente ya tengamos instalada y establecida la versión recomendada de GHC. GHCup hace eso por defecto. Deberíamos ver un doble tilde verde en la primer columna de GHC. Un tilde para instalado y otro tilde para establecido.

Para verificar si tienen GHC instalado podemos hacer lo siguiente:

```console
% ghc --version
The Glorious Glasgow Haskell Compilation System, version 9.4.8
```

Si no funcionó podemos usar los siguientes comandos para instalar y establecer la versión recomendada de GHC.

```shell
% ghcup install ghc recommended
% ghcup set ghc recommended
```

## GHCi
Junto con GHC viene GHCi, el intérprete. Con GHCi podemos experimentar en forma interactiva, sin necesidad de crear archivos incluso.

```haskell
% ghci
GHCi, version 9.4.8: https://www.haskell.org/ghc/  :? for help
ghci> 1+1
2
ghci> mayor a b = if a > b then a else b
ghci> mayor 3 4
4
ghci> :q
Leaving GHCi.
```

## Trabajando con archivos en GHCi
También se pueden cargar archivos. Si creamos un archivo `Ejemplo.hs` (la convención es que empiecen con mayúscula) con el siguiente contenido:

```haskell
mayor a b = if a > b then a else b
```

Podemos cargarlo en `ghci` usando `:l Ejemplo.hs` y usar la función definida en él.

```haskell
% ghci
GHCi, version 9.4.8: https://www.haskell.org/ghc/  :? for help
ghci> :l Ejemplo.hs 
[1 of 2] Compiling Main             ( Ejemplo.hs, interpreted )
Ok, one module loaded.
ghci> mayor 2 4
4
```

Si cambiamos el contenido del archivo con `:r` vamos a recargarlo

```haskell
ghci> :r
[1 of 2] Compiling Main             ( Ejemplo.hs, interpreted ) [Source file changed]
Ok, one module loaded.
```

## Trabajando con VSCode
Si elegimos [VSCode](https://code.visualstudio.com/) como editor, lo recomendable es instalar extensión [`haskell.haskell`](https://marketplace.visualstudio.com/items?itemName=haskell.haskell). Se integra con GHCup y cuenta con algunas herramientas adicional.

La configuración sugerida ( Ctrl + Shift + P o Cmd + Shift + P , `> Open User Settings (JSON)`) es la siguiente.

```json
{
    "haskell.manageHLS": "GHCup",
    "haskell.upgradeGHCup": false,
    "haskell.toolchain": {
        "ghc": "recommended",
        "hls": "recommended",
        "cabal": "recommended",
        "stack": null
    },
	"editor.formatOnSave": true
}
```

Esta configuración sólo necesita que GHCup esté en el `PATH` y va a bajar otras herramientas cuando las necesite. Si ya tenemos ghc en `PATH` podemos omitir ésta configuración.

Si abrimos el archivo `Ejemplo.hs` con el editor vamos a tener coloreo de sintaxis. 🎨

Seguramente nos aparezca la pregunta "Need to download hls-recommended, continue?". Digamos que sí. Alternativamente podemos instalar la versión recomendada de HLS usando `ghcup` como hicimos antes.

Es posible que necesitemos reiniciar el editor (Ctrl + Shift + P o Cmd + Shift + P , `> Developer: Reload Window`).

Ahora disponemos de HLS (Haskell Language Server) que nos dará acceso a documentación y otras herramientas integradas para
- Dar formato al código usando `ormolu`
- Sugerencias sintácticas usando `hlint`
- Anotaciones de tipo usando el algoritmo de inferencia
- Ir a la definición de la función
- Ver documentación
- Evaluar código en líneas que empiezan con `-- >>>`

Por ejemplo, si el archivo contiene

```haskell
mayor a b = if a > b then a else b

-- >>> mayor 2 3
```

Nos va a aparecer un `Evaluate...` arriba del `-- >>>` que al hacer _click_ nos dará el resultado.

```haskell
mayor a b = if a > b then a else b

-- >>> mayor 2 3
-- 3
```

## Trabajando con múltiples archivos
Tanto GHCi como VSCode pueden operar con múltiples archivos al mismo tiempo. Hay veces que queremos separar el código en distintos módulos, ya sea para restringir interface o por mera organización.

Supongamos que en una carpeta tenemos `Foo.hs` y `Bar.hs` con el siguiente contenido

```haskell
module Foo where

foo = 2
```

```haskell
module Bar where

import Foo

bar = foo + foo

-- >>> bar
-- 4
```

En GHCi podemos cargar cualquiera de los dos módulos con `:l` y evaluar sus funciones.

```haskell
% ghci
GHCi, version 9.4.8: https://www.haskell.org/ghc/  :? for help
ghci> :l Bar.hs 
[1 of 2] Compiling Foo              ( Foo.hs, interpreted )
[2 of 2] Compiling Bar              ( Bar.hs, interpreted )
Ok, two modules loaded.
ghci> bar
4
```

En VSCode basta con abrir la carpeta que los contiene para que todo funcione y podamos evaluar `-- >>> bar` como antes.

## Cabal
Es usual aprovechar paquetes y aplicaciones definidos por otras personas. En Haskell se registran y distribuyen en [Hackage](https://hackage.haskell.org/). Para descargar los paquetes o aplicaciones de Hackage se usa [Cabal](https://www.haskell.org/cabal/). Si hemos seguido las instrucciones ya tenemos Cabal instalado, sino podemos usar GHCup para obtener la versión recomendada.

```console
% cabal --version
cabal-install version 3.12.1.0
compiled using version 3.12.1.0 of the Cabal library 
```

A continuación usaremos aplicaciones y paquetes de Hackage.
## Re-evaluando expresiones
Cada vez que cambiamos un archivo y queremos ver el resultado de nuestro nuevo programa tenemos que alejarnos de donde estamos editando el código para ir a evaluar una expresión.

Si usamos GHCi tenemos que hacer `:r` y escribir la expresión a evaluar.

Si usamos VSCode podemos llegar a tener ya escrita cerca de la función que estamos editando la expresión a evaluar a continuación de un `-- >>>` . Con un _click_ en `Evaluate...`  o `Refresh...` obtenemos el resultado.

Hay otra opción que no require alejarnos del código que estamos editando. La herramienta [ghcid](https://github.com/ndmitchell/ghcid) permite ejecutar un expresión ni bien se hacen cambios en un archivo.

Para instalarla primero debemos tener una versión actualizada del índice de paquetes.

```shell
% cabal update
```

Luego podemos proceder a instalar la aplicación `ghcid`.

```shell
% cabal install ghcid
```

Con el comando anterior la aplicación va a quedar instalada en `~/.cabal/bin`. Vamos a necesitar agregar este directorio al `PATH`.

Como alternativa podemos indicar en qué directorio instalar la aplicación. Por ejemplo en un directorio `bin` junto a los archivos que estamos editando.

```shell
% cabal install ghcid --installdir=bin
```

Volviendo al ejemplo de `Bar.hs`, podemos querer evaluar la función `bar` cada vez que hagamos cambios en el archivo.

```shell
% bin/ghcid Bar.hs --test bar
```

En la pantalla veremos:

```plaintext
4

...done
```

Probemos cambiar el contenido de `Bar.hs` o `Foo.hs` y el valor se actualizará.

## Trabajando con paquetes externos
Para trabajar con paquetes hay dos alternativas
- Instalar el paquete que queremos en forma manual y que esté disponible universalmente en la computadora, o bien
- Definir un proyecto cabal y declarar ahí cuales son los paquetes externos que queremos usar.

### Forma manual
Por ejemplo si queremos escribir casos de prueba podemos optar por usar el paquete [HUnit](https://hackage.haskell.org/package/HUnit) e instalarlo de forma manual y que esté disponible universalmente.

```shell
% cabal install --lib HUnit
```

Luego podemos usarlo directamente al importarlo.

```haskell
module Bar where

import Foo
import Test.HUnit

bar = foo + foo

main = runTestTTAndExit allTests

allTests =
  test
    [ bar ~?= 4
    ]
```

En GHCi podemos evaluar la función `main`

```haskell
% ghci Bar.hs 
ghci> main
Cases: 1  Tried: 1  Errors: 0  Failures: 0
*** Exception: ExitSuccess
```

En VSCode podemos evaluar `-- >>> main` pero la salida vamos a verla en la pestaña de OUTPUT si seleccionamos Haskell en la lista de la derecha.

Con ghcid podemos ejecutar el siguiente comando para correr los test automáticamente con cada cambio.

```shell
% bin/ghcid Bar.hs --test main
```

> ⚠️ Si bien `cabal install --lib paquete` anda y parece simple, no es la forma más adecuada de instalar paquetes. Dentro de la comunidad de Haskell se desaconseja usar esta forma. Está disponible por motivos históricos.

> ‼️ En VSCode es posible que necesitemos ejecutar el comando `Haskell: Restart Haskell LSP Server` (Ctrl + Shift + P o Cmd + Shift + P) para que tome los cambios del entorno.

### Definir un proyecto
Cabal nos permite también inicializar un proyecto Haskell. Esto nos sirve para organizar mejor el código en distintas partes pero sobre todo para un mejor manejo de dependencias.

Para inicializar un proyecto podemos usar `cabal init nombreproyecto` y aceptar todas las opciones por defecto.

```console
% cabal init nombreproyecto
What does the package build:
   1) Library
 * 2) Executable
   3) Library and Executable
   4) Test suite
Your choice? [default: Executable] 
...
```

Vamos a obtener la siguiente estructura en la carpeta `nombreproyecto`

```plaintext
.
├── CHANGELOG.md
├── LICENSE
├── app
│   └── Main.hs
└── nombreproyecto.cabal
```

Podemos borrar `CHANGELOG.md` y `LICENSE` para código de prueba.

El archivo `.cabal` tiene información sobre cómo se conforma el proyecto. En particular al final obtenemos algo similar a lo siguiente:

```haskell
executable nombreproyecto
    import:           warnings
    main-is:          Main.hs
    -- other-modules:
    -- other-extensions:
    build-depends:    base ^>=4.17.2.1
    hs-source-dirs:   app
    default-language: Haskell2010
```

`hs-source-dirs` indica dónde va a estar el código, si queremos podemos cambiarlo a `src` y cambiar de nombre la carpeta existente `app`.

Cuando hagamos `% cabal run` dentro de la carpeta `nombreproyecto` va a compilar `Main.hs` y ejecutar la función `main` definida ahí.

```console
% cabal run
Hello, Haskell!
```

Adaptemos el ejemplo de `Foo`, `Bar` y `HUnit` a este esquema.

Podemos tener un `Bar.hs` y `Foo.hs` en el directorio `app` junto a `Main.hs`. Y dejar el test en `Main`, de forma que `Bar` sólo tenga el código que queríamos escribir.

```haskell
module Foo where

foo = 2
```

```haskell
module Bar where

import Foo

bar = foo + foo
```

```haskell
module Main where

import Bar
import Test.HUnit

main = runTestTTAndExit allTests

allTests =
  test
    [ bar ~?= 4
    ]
```

Ahora bien, nos falta actualizar el archivo `nombreproyecto.cabal` para declarar
- Qué otros archivos forman parte del proyecto: sí hay que listarlos explícitamente.
- Qué paquetes externos queremos usar.

Quitemos el comentario a `other-modules` para listar `Bar` y `Foo` para lo primero. Agregamos `HUnit` opcionalmente con información de versión.

```haskell
executable nombreproyecto
    import:           warnings
    main-is:          Main.hs
    other-modules:
        Bar
        Foo
    -- other-extensions:
    build-depends:    base ^>=4.17.2.1, 
                      HUnit ^>=1.6.2.0
    hs-source-dirs:   app
    default-language: Haskell2010
```

Si hacemos `cabal run` obtenemos el resultado de los tests.

```console
% cabal run 
Cases: 1  Tried: 1  Errors: 0  Failures: 0
```

Si hacemos `cabal repl` vamos a iniciar un `ghci` con todo el proyecto ya cargado.

```haskell
% cabal repl
[1 of 4] Compiling Foo              ( app/Foo.hs, interpreted )
[2 of 4] Compiling Bar              ( app/Bar.hs, interpreted )
[3 of 4] Compiling Main             ( app/Main.hs, interpreted )
Ok, three modules loaded.
ghci> main
Cases: 1  Tried: 1  Errors: 0  Failures: 0
*** Exception: ExitSuccess
ghci> 
Leaving GHCi.
```

Si usamos VSCode el editor va a ayudarnos a navegar entro los archivos y otros beneficios. Cada vez que cambiamos el archivo `.cabal` vamos a necesitar hacer un `Haskell: Restart Haskell LSP Server` (Ctrl + Shift + P o Cmd + Shift + P) para que tome los cambios del entorno.

Si usamos `ghcid` no necesitamos indicar el archivo `Main.hs`, solo la función a evaluar, ya que usa la información de `main-is` del archivo `.cabal` pero vamos a notar que el resultado de los tests no aparece.

```console
% bin/ghcid --test main
Loading cabal repl --repl-options=-fno-break-on-exception --repl-options=-fno-break-on-error --repl-options=-v1 --repl-options=-ferror-spans --repl-options=-j ...
Build profile: -w ghc-9.4.8 -O1
In order, the following will be built (use -v for more details):
 - nombreproyecto-0.1.0.0 (interactive) (exe:nombreproyecto) (first run)
Preprocessing executable 'nombreproyecto' for nombreproyecto-0.1.0.0...
GHCi, version 9.4.8: https://www.haskell.org/ghc/  :? for help
[1 of 4] Compiling Foo              ( app/Foo.hs, interpreted )

app/Foo.hs:3:1-3: warning: [-Wmissing-signatures]
    Top-level binding with no type signature: foo :: Integer
  |
3 | foo = 2
  | ^^^
...
```

En su lugar aparecen solamente _warnings_. Esto es porque nuestro archivo `.cabal` indica ser muy estricto con los _warnings_. 

En este caso los _warnings_ son porque las funciones `foo`, `bar` y `main` no tiene declaración de tipos. Podemos agregarlas, pero en general cuando estamos modificando código vamos a producir varias situaciones de _warnings_: variables no usadas, _pattern matchings_ no exhaustivos, funciones no exportadas no usadas, etc..

Si cambiamos el archivo `.cabal` para que sea más permisivo y no reportemos _warnings_ nuestro editor también va a dejar de mostrarlos. Lo recomendado es hacer que `ghcid` se más permisivo y nada más. Con la opción `--warnings` lo logramos. De esta forma si bien va a seguir reportando los _warnings_, para que los vayamos arreglando, no va a dejar de ejecutar la función test.

```console
% bin/ghcid --warnings --test main
...

Cases: 1  Tried: 1  Errors: 0  Failures: 0

...done
```

> Este artículo también está disponible en [dev.to](https://dev.to/bcardiff/como-instalar-haskell-40ml)