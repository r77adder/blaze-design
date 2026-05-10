#!/usr/bin/env node
/**
 * Visual debugging helper.
 *
 * Usage:
 *   pnpm inspect <url-path> <selector> [--port <n>] [--full]
 *
 * Examples:
 *   pnpm inspect /hello-world ".upgradeBtn"        # try literal class first
 *   pnpm inspect /hello-world "~upgradeBtn"        # CSS Modules helper:
 *                                                  #   matches `[class*="upgradeBtn"]`
 *   pnpm inspect /h2-index "[data-testid=foo]" --port 5174
 *
 * Behavior:
 *   1. Boots a headless Chromium via puppeteer.
 *   2. Navigates to http://localhost:<port><url-path>.
 *   3. Waits for network idle and the selector to appear.
 *   4. Dumps the matched element AND each descendant's:
 *        - tagName + attributes
 *        - relevant computed styles
 *        - getBoundingClientRect
 *   5. Screenshots the matched element to scripts/inspect-output.png.
 *
 * If the selector never matches, the script prints `<header>`/`<main>` markup
 * so you can see what's actually in the DOM and pick a better selector.
 *
 * `~name` shorthand: the leading `~` is rewritten to a CSS-Modules-friendly
 * `[class*="name"]` selector, so you can target hashed module classes
 * without copy-pasting the full hash from devtools.
 *
 * Exit codes: 0 on success, non-zero if the selector never appears or
 * navigation fails.
 */

import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import puppeteer from 'puppeteer'

const __dirname = dirname(fileURLToPath(import.meta.url))

const args = process.argv.slice(2)
if (args.length < 2) {
  console.error('Usage: pnpm inspect <url-path> <selector> [--port <n>] [--full]')
  process.exit(1)
}

const urlPath = args[0]
const rawSelector = args[1]
let port = 5173
let fullPage = false
for (let i = 2; i < args.length; i++) {
  if (args[i] === '--port' && args[i + 1]) {
    port = Number.parseInt(args[i + 1], 10)
    i++
  } else if (args[i] === '--full') {
    fullPage = true
  }
}

// `~upgradeBtn` shorthand → `[class*="upgradeBtn"]` so we can target a CSS
// Modules class without copy-pasting the hash from devtools.
const selector = rawSelector.startsWith('~')
  ? `[class*="${rawSelector.slice(1)}"]`
  : rawSelector

const url = `http://localhost:${port}${urlPath.startsWith('/') ? urlPath : `/${urlPath}`}`
const screenshotPath = join(__dirname, 'inspect-output.png')

const RELEVANT_PROPS = [
  'display',
  'visibility',
  'opacity',
  'width',
  'height',
  'min-width',
  'min-height',
  'max-width',
  'max-height',
  'background',
  'background-color',
  'background-image',
  'color',
  'fill',
  'stroke',
  'stroke-width',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'padding',
  'margin',
  'border',
  'border-radius',
  'overflow',
  'position',
  'z-index',
  'transform',
  'flex',
  'flex-shrink',
  'flex-grow',
  'gap',
]

const TOKENS_OF_INTEREST = [
  '--purple-70',
  '--purple',
  '--default-bg',
  '--dark-4',
  '--dark-80',
  '--dark-90',
  '--light-100',
]

const browser = await puppeteer.launch({ headless: 'new' })
try {
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })

  console.log(`[inspect] navigating to ${url}`)
  page.on('pageerror', (e) => console.log(`[browser pageerror] ${e.message}`))
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log(`[browser console.error] ${msg.text()}`)
  })

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })

  console.log(`[inspect] waiting for selector \`${selector}\` (raw: \`${rawSelector}\`)`)
  let matched = true
  try {
    await page.waitForSelector(selector, { timeout: 8000 })
  } catch {
    matched = false
  }

  if (!matched) {
    console.log(`\n[inspect] selector \`${selector}\` never matched.`)
    const dump = await page.evaluate(() => {
      const trim = (html, n = 2000) => (html.length > n ? `${html.slice(0, n)}…` : html)
      return {
        title: document.title,
        bodyClass: document.body.className,
        header: document.querySelector('header') ? trim(document.querySelector('header').outerHTML) : '(no <header>)',
        main: document.querySelector('main') ? trim(document.querySelector('main').outerHTML, 800) : '(no <main>)',
        rootKids: [...document.querySelectorAll('#root > *')].map((el) => `<${el.tagName.toLowerCase()} class="${el.className}">`).join(', '),
        buttonCount: document.querySelectorAll('button').length,
      }
    })
    console.log(`  document.title: ${dump.title}`)
    console.log(`  #root children: ${dump.rootKids}`)
    console.log(`  total buttons on page: ${dump.buttonCount}`)
    console.log(`\n  <header> (truncated):\n${dump.header}\n`)
    console.log(`\n  <main> (truncated):\n${dump.main}\n`)
    console.log('Tip: if you were looking for a CSS Modules class, try `~name` (e.g. `~upgradeBtn`).')
    process.exit(2)
  }

  const report = await page.evaluate(
    ({ selector, props, tokens }) => {
      const root = document.querySelector(selector)
      const describe = (el, depth) => {
        const cs = window.getComputedStyle(el)
        const styles = {}
        for (const p of props) styles[p] = cs.getPropertyValue(p).trim()
        const attrs = {}
        for (const a of el.attributes) attrs[a.name] = a.value
        const rect = el.getBoundingClientRect()
        return {
          depth,
          tag: el.tagName.toLowerCase(),
          attrs,
          styles,
          rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
          textPreview:
            el.tagName.toLowerCase() === 'path'
              ? `d-len=${(el.getAttribute('d') || '').length}`
              : el.children.length === 0
                ? (el.textContent || '').trim().slice(0, 80)
                : '',
        }
      }
      const out = []
      const walk = (el, depth) => {
        out.push(describe(el, depth))
        for (const child of el.children) walk(child, depth + 1)
      }
      walk(root, 0)
      const rootStyles = window.getComputedStyle(document.documentElement)
      const tokenValues = {}
      for (const t of tokens) tokenValues[t] = rootStyles.getPropertyValue(t).trim() || '(unset)'
      return { tree: out, tokens: tokenValues }
    },
    { selector, props: RELEVANT_PROPS, tokens: TOKENS_OF_INTEREST }
  )

  console.log('\n=== CSS variable resolution (on :root) ===')
  for (const [name, value] of Object.entries(report.tokens)) {
    console.log(`  ${name}: ${value}`)
  }

  console.log(`\n=== Element tree for ${selector} ===\n`)
  for (const node of report.tree) {
    const indent = '  '.repeat(node.depth)
    const attrStr = Object.entries(node.attrs)
      .map(([k, v]) => `${k}="${v.length > 60 ? `${v.slice(0, 60)}…` : v}"`)
      .join(' ')
    console.log(`${indent}<${node.tag}${attrStr ? ` ${attrStr}` : ''}>`)
    if (node.textPreview) console.log(`${indent}  text: ${node.textPreview}`)
    console.log(
      `${indent}  rect: ${node.rect.width.toFixed(1)}×${node.rect.height.toFixed(1)} @ (${node.rect.x.toFixed(1)}, ${node.rect.y.toFixed(1)})`
    )
    const styleLines = []
    for (const [prop, val] of Object.entries(node.styles)) {
      if (!val) continue
      if (
        (prop === 'opacity' && val === '1') ||
        (prop === 'visibility' && val === 'visible') ||
        (prop === 'z-index' && val === 'auto') ||
        (prop === 'transform' && val === 'none') ||
        (prop === 'overflow' && val === 'visible') ||
        (prop === 'position' && val === 'static') ||
        (prop === 'min-width' && val === 'auto') ||
        (prop === 'min-height' && val === 'auto') ||
        (prop === 'max-width' && val === 'none') ||
        (prop === 'max-height' && val === 'none') ||
        (prop === 'flex-grow' && val === '0') ||
        (prop === 'flex-shrink' && val === '1') ||
        (prop === 'gap' && val === 'normal')
      ) {
        continue
      }
      styleLines.push(`${prop}: ${val}`)
    }
    if (styleLines.length) {
      console.log(`${indent}  styles:`)
      for (const line of styleLines) console.log(`${indent}    ${line}`)
    }
  }

  if (fullPage) {
    await page.screenshot({ path: screenshotPath, fullPage: true })
  } else {
    const handle = await page.$(selector)
    if (handle) {
      try {
        await handle.screenshot({ path: screenshotPath })
      } catch (err) {
        console.warn(`[inspect] element screenshot failed (${err.message}); falling back to page screenshot`)
        await page.screenshot({ path: screenshotPath })
      }
    }
  }
  console.log(`\n[inspect] screenshot written to ${screenshotPath}`)
} finally {
  await browser.close()
}
