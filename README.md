<div align="center">

# esbuild-plugins-node-modules-polyfill

**Polyfills nodejs builtin modules for the browser.**

[![GitHub](https://img.shields.io/github/license/imranbarbhuiya/esbuild-plugins-node-modules-polyfill)](https://github.com/imranbarbhuiya/esbuild-plugins-node-modules-polyfill/blob/main/LICENSE)
[![npm](https://img.shields.io/npm/v/esbuild-plugins-node-modules-polyfill?color=crimson&logo=npm&style=flat-square)](https://www.npmjs.com/package/esbuild-plugins-node-modules-polyfill)

</div>

## Description

Polyfills nodejs builtin modules for the browser.

## Features

-   Written In Typescript
-   Offers CJS and ESM builds
-   Full TypeScript & JavaScript support
-   Supports `node:` protocol

## Install

```bash
npm install --save-dev esbuild-plugins-node-modules-polyfill

```

## Usage

```ts
import { nodeModulesPolyfillPlugin } from 'esbuild-plugins-node-modules-polyfill';
import { build } from 'esbuild';
build({
	plugins: [nodeModulesPolyfillPlugin()],
});
```

## Buy me some doughnuts

If you want to support me by donating, you can do so by using any of the following methods. Thank you very much in advance!

<a href="https://www.buymeacoffee.com/parbez" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>
<a href='https://ko-fi.com/Y8Y1CBIJH' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://cdn.ko-fi.com/cdn/kofi4.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center"><a href="https://github.com/imranbarbhuiya"><img src="https://avatars.githubusercontent.com/u/74945038?v=4?s=100" width="100px;" alt="Parbez"/><br /><sub><b>Parbez</b></sub></a><br /><a href="https://github.com/imranbarbhuiya/esbuild-plugins-node-modules-polyfill/commits?author=imranbarbhuiya" title="Code">💻</a> <a href="#maintenance-imranbarbhuiya" title="Maintenance">🚧</a> <a href="#ideas-imranbarbhuiya" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center"><a href="https://renovate.whitesourcesoftware.com"><img src="https://avatars.githubusercontent.com/u/25180681?v=4?s=100" width="100px;" alt="WhiteSource Renovate"/><br /><sub><b>WhiteSource Renovate</b></sub></a><br /><a href="#maintenance-renovate-bot" title="Maintenance">🚧</a></td>
      <td align="center"><a href="https://favware.tech"><img src="https://avatars.githubusercontent.com/u/4019718?v=4?s=100" width="100px;" alt="Jeroen Claassens"/><br /><sub><b>Jeroen Claassens</b></sub></a><br /><a href="https://github.com/imranbarbhuiya/esbuild-plugins-node-modules-polyfill/commits?author=favna" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
