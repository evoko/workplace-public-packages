# SOLAR fonts for Flutter

The three families SOLAR's text styles use, bundled so an app that depends on `solar_flutter`
renders in them without finding and declaring the fonts itself. Flutter cannot read WOFF2, so
these are TrueType; the web gets the same families from Fontsource through
`@bwp-web/styles/fonts.css`.

| Family        | Weights            | Used by                          | Source                                                                                  |
| ------------- | ------------------ | -------------------------------- | --------------------------------------------------------------------------------------- |
| Inter         | 400, 500, 600, 700 | 40 text styles: the app font     | [rsms/inter v4.1](https://github.com/rsms/inter/releases/tag/v4.1), `extras/ttf/`       |
| Montserrat    | 500, 600           | the 5 display styles             | [JulietaUla/Montserrat v7.222](https://github.com/JulietaUla/Montserrat/releases), `fonts/ttf/` |
| IBM Plex Mono | 500                | the 2 code styles                | [IBM/plex @ibm/plex-mono 2.5.0](https://github.com/IBM/plex/releases), `fonts/complete/ttf/` |

All three are licensed under the **SIL Open Font License 1.1**, which allows bundling them with
software provided the licence travels with them; each folder holds its project's licence file,
unmodified. The fonts are unmodified too, which matters for IBM Plex: its licence reserves the
name "Plex" for the original.

**Gotham is deliberately absent.** It is SOLAR's brand typeface but commercially licensed, and
this package is public. No text style uses it; SOLAR's display styles use Montserrat, its open
substitute. Open Sans and Roboto Mono, SOLAR's named fallbacks, are used by no style either.

Only the weights a text style uses are shipped. Adding a weight means adding a file here and an
entry under `flutter: fonts:` in `pubspec.yaml`; the generated `TextStyle`s name the package, so
nothing else changes.

Downloaded 2026-09-23 from the releases above. SHA-256:

```
40d692fce188e4471e2b3cba937be967878f631ad3ebbbdcd587687c7ebe0c82  inter/Inter-Regular.ttf
97ad806f526e41546d46365bb3a393145f75b7b1568913db74549ad8b8dba872  inter/Inter-Medium.ttf
78a843fade9d4612a5567302fb595b56976eb5fcebf4fea5a5912d638bafcde3  inter/Inter-SemiBold.ttf
288316099b1e0a47a4716d159098005eef7c0066921f34e3200393dbdb01947f  inter/Inter-Bold.ttf
7ce96811837174f00c087b73332aed3f04a19069248ab46213d9ea05ff879cbc  montserrat/Montserrat-Medium.ttf
49fbfce003ad1692d7c9a6502791577088c12c50088d4caa27dbbfe540ad9d13  montserrat/Montserrat-SemiBold.ttf
98fbd727aae340b236955879dabed4d991aac9e8e90b3b2a67ce4a59221cc97c  ibm-plex-mono/IBMPlexMono-Medium.ttf
```

The web build of Inter comes from Fontsource, which packages Google Fonts' build rather than this
release, so the two platforms may differ by a hair. Compare a rendered label with Figma once.
