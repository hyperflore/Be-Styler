# Be Styler

Be Styler is the Be Themer build for people who want the look.
It ships the full theme engine (colour presets, wallpapers, gradients, glass, server themes, Theme Maker, splash screen and custom CSS)
together with the plugins that change how Discord looks or moves:
Cursor Pet, Sakura Petals, Screen Effects, Small Fixes, Macmize, Username Tools, Compact Server List and Loading Quotes.

It does not include Meow or Owlie. For those, use [Be Func](https://github.com/hyperflore/Be-Func).

## Install

Download `Be-Styler.exe` from the [latest release](https://github.com/hyperflore/Be-Styler/releases/latest), run it and press Install.
A command-line installer (`Be-Styler-Cli.exe`) is included too.

Check the download against `SHA256SUMS.txt` (see the release page) before you run it:

```powershell
Get-FileHash .\Be-Styler.exe -Algorithm SHA256
```

Be Styler installs into your own user folder, so it needs no administrator rights.
Only one Be Themer build can be installed at a time: installing a different build replaces this one.

## Build from source

```powershell
npm run build              # renderer, main process and plugins into dist/
npm run build:installer    # installers and checksums into release/ (Windows, .NET Framework 4)
npm test
```

## Sponsor

If Be Styler is useful to you, you can support its developer [70nee](https://github.com/70nee) through GitHub Sponsors:
<https://github.com/sponsors/70nee>

## Disclaimer

Be Styler is open source under the MIT License (see [LICENSE](LICENSE)).
It is not affiliated with or endorsed by Discord. Client mods can break Discord's Terms of Service, so use it at your own risk.
