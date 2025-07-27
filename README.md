# Tickup

[View Tickup](https://todo-nuxt-peach.vercel.app)

A Todo app to help you plan, organise and review your todos of the day. <br>
Tickup has been inspired by Clickup and Ticktick but aims to be a simpler and easier to use.

Built with Nuxt 3, Vuetify and MongoDB. 

[![Playwright Tests](https://github.com/proggreg/tickup/actions/workflows/playwright.yml/badge.svg?branch=main)](https://github.com/proggreg/tickup/actions/workflows/playwright.yml)

## Setup 

Make sure to install the dependencies:

```bash
# yarn
yarn

# npm
npm install

# pnpm
pnpm install --shamefully-hoist
```

## Development Server

Start the development server on http://localhost:3000

```bash
npm run dev
```

## Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

Github Sign Setup

To setup the Github Sign In you need to generate the credentials and callback URI.
Login to github go to settings > developer settings > oauth apps and create an app

Checkout the [deployment documentation](https://v3.nuxtjs.org/guide/deploy/presets) for more information.


Drag and Drop Functionality
This project utilizes the power of Vue Draggable for drag-and-drop functionality. This library, built on SortableJS, allows users to intuitively reorder and rearrange elements within the application.