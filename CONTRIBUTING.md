# Contributing

Thanks for helping improve Be Themer. This guide covers the basics; [docs/development.md](docs/development.md) has the details.

## Setup

Requirements: Node.js 18 or newer, and Windows if you want to build the installer.

```sh
git clone https://github.com/hyperflore/Be-Themer.git
cd Be-Themer
npm install
npm test
```

`npm run dev` rebuilds on every save, and `npm run inject` loads your local build into Discord.

## Making a change

1. Create a branch from `main`.
2. Keep each pull request focused on one change.
3. Run `npm test` before opening the pull request. CI runs the same checks.
4. Add an entry under an `Unreleased` heading in [CHANGELOG.md](CHANGELOG.md) for anything user-visible.

## Code style

- 4-space indentation, LF line endings, UTF-8 (enforced by `.editorconfig` and `.gitattributes`).
- Plain JavaScript with no build-time transpilation; target the Chromium version Discord ships.
- Built-in plugins live in `src/plugins/<id>.js`, one plugin per file. Start from `npm run new-plugin -- "Name" --builtin`.
- Undo everything a plugin adds: register cleanups through `api.onDispose` or use the `api.*` helpers, which clean up automatically.
- Find Discord elements with stable attributes (`id`, `data-list-item-id`, `role`) or `[class*="name_"]` prefixes, never full hashed class names.
- Plugins must not send data anywhere other than Discord's own API, and must not unlock paid features.

## Commit messages

Use the imperative mood and keep the subject under 72 characters, for example `Fix typing indicator in muted channels`. Explain the reason for the change in the body when it isn't obvious.

## Reporting bugs

Open an issue using the bug report template. Include your Be Themer version (User Settings → Be Themer), your Discord branch, and any errors from DevTools (`Ctrl+Shift+I`).
