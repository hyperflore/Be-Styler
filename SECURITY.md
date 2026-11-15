# Security policy

## Supported versions

Only the latest release receives fixes.

## Reporting a vulnerability

Please report security issues privately through GitHub's [private vulnerability reporting](https://github.com/hyperflore/Be-Themer/security/advisories/new) rather than in a public issue. Include steps to reproduce and the affected version. You should receive a reply within a week.

## Scope

Be Themer runs inside Discord with access to your account, so the following are treated as security issues:

- Code paths that let a theme, a message, or a remote resource run JavaScript.
- The installer or loader executing files it did not install.
- Any data leaving the machine for a destination other than Discord's own servers, or a link the user chose to open.

User plugins run with full access by design. Only install plugins you trust.
