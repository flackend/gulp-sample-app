# GulpJS

## What is Gulp

Gulp is a task runner. It allows you to automate development tasks. A few examples:

- Convert: SASS/LESS to CSS
- Convert: ES6 or CoffeeScript to browser-supported JavaScript
- Optimize: minify CSS, JavaScript, HTML; optimize images
- Lint: check code and markup for errors or style (coding standards)
- Live reload: auto-inject CSS, refresh browser/node server
- Tests: run TDD tests (and the like)

## Benefits

- Automate tasks you may already doing:
  - Converting SASS/LESS to CSS
  - CoffeeScript to JS
- Make other tasks more attainable:
  - Auto-inject CSS into browser
  - Auto-refresh browser on JS and HTML change
- Benefits teams
  - You commit the gulpfile.js to your repo
  - You don't need to rely on IDE, etc for linting and transforms
  - Consolidate tasks to a single place (transforms, testing, LiveReload/BrowserSync)

## How does it work

You can easily use Gulp with any project that serves static assets (JS/CSS).
Install gulp globally:

```bash
npm install -g gulp
```

Add gulp to your existing project's npm package.json, or set up a new one:

```bash
npm init
npm install --save-dev gulp
```

Create a gulpfile.js, add some tasks, and run it:

```bash
gulp
```

You can find recipes for your gulpfile.js by searching Google (e.g. "gulp sass") or by reading the README.md associated with gulp plugins found on [npmjs.com](https://www.npmjs.com/) or [gulpjs.com/plugins](http://gulpjs.com/plugins/).
