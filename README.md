# Adonis4 Tools

Provide for legacy adonisjs, autocomplete for services classes to increase development speed, with basic language server.

<div style="text-align:center"><img src="https://raw.githubusercontent.com/vinicioslc/adonis4-tools/main/media/icon.png" width="200" /></div>

[![Deploy to Production](https://github.com/vinicioslc/adonis4-tools/actions/workflows/production.deploy.yml/badge.svg)](https://github.com/vinicioslc/adonis4-tools/actions/workflows/production.deploy.yml)

<div style="text-align:center">

> Ctrl + Shift + A

![status bar](https://raw.githubusercontent.com/vinicioslc/adonis4-tools/main/media/demo.gif)

</div>

## Features

- [x] Import and automatically use @typedef for add intellisense

  - Ctrl+Shift+A open import menu

- [ ] Autocomplete for providers and @typedef

- [ ] GoToController when hover on Route Definitions strings
- [ ] Go to service implementation when click on controllers

You can help with [Code](https://github.com/vinicioslc/adb-interface-vscode/issues) or with [Energy](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=TKRZ7F4FV4QY4&source=url) everthing are welcome ;)

BTC:bc1qufk82juerzuw3d6r5ehkjmufha2xjefp48due9
ADA:addr1qxyp4l0lxa3gmme65rj5p76uw2quxenwnzrmee06y4432sqxfnfm0ypc9zy9f07rfpjjk3wgw5vh7a0mtqwk8ulwfzcslmzr9z

## Based on

Heavily documented sample code for https://code.visualstudio.com/api/language-extensions/language-server-extension-guide

## Functionality

This Language Server works for plain text file. It has the following language features:

- Completions
- Diagnostics regenerated on each file change or configuration change

It also includes an End-to-End test.

## Structure

```
.
├── client // Language Client
│   ├── src
│   │   ├── test // End to End tests for Language Client / Server
│   │   └── extension.ts // Language Client entry point
├── package.json // The extension manifest.
└── server // Language Server
    └── src
        └── server.ts // Language Server entry point
```

## Running the Sample

- Run `npm install` in this folder. This installs all necessary npm modules in both the client and server folder
- Open VS Code on this folder.
- Press Ctrl+Shift+B to compile the client and server.
- Switch to the Debug viewlet.
- Select `Launch Client` from the drop down.
- Run the launch config.
- If you want to debug the server as well use the launch configuration `Attach to Server`
- In the [Extension Development Host] instance of VSCode, open a document in 'plain text' language mode.
  - Type `j` or `t` to see `Javascript` and `TypeScript` completion.
  - Enter text content such as `AAA aaa BBB`. The extension will emit diagnostics for all words in all-uppercase.
