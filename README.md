# Bird identifier

Standalone copy of the bird identification app at `matthewfeil.com/birds/`.
The original website repository is unchanged. Tracking, scheduling, species
scopes, model preprocessing, classification, and recovery retain the original
behavior. Standalone changes add prefix-safe model downloads and a version label.

## Research test site

Open **[BirdID](https://lwc-esrp.github.io/birdid/)** to test the app.

The public GitHub Pages site deploys automatically from `main` using
`.github/workflows/pages.yml`. The deployment URL is shown in the repository's
**Settings → Pages** and each successful Actions deployment. Testers only need
the HTTPS link and camera permission; no repository checkout or installation.

The toolbar displays the app version and the deployed commit's first seven
characters, for example `v0.1.0 · abc1234`. Every deployment updates the commit
label automatically. Change `app_version` in `_config.yml` for a new app version.
Plain `jekyll serve` uses the label `local`.

## Run locally

Use Ruby 3.4.1 and Bundler 2.6.2 (the versions used by the existing website).
From this repository:

```sh
bundle install
bundle exec jekyll serve --host 127.0.0.1 --port 4001 --destination "$PWD/_site"
```

Open **http://127.0.0.1:4001/** or **http://127.0.0.1:4001/birds/**.
The root redirects to the original `/birds/` route. Tap **Start camera** and grant
camera permission. The first start downloads approximately 64 MB of local model
and runtime assets; subsequent use can reuse the browser's HTTP cache.

Camera access requires localhost or HTTPS. A phone accessing a plain HTTP LAN
address generally cannot use its camera; use an HTTPS host for phone testing.
The app remains an experimental identifier, with the original release flags and
confidence thresholds unchanged.

## What is included

- `birds.html`, `assets/css/birds.css`, and `assets/js/birds*`: the original UI,
  detector/classifier worker, motion worker, tracker, and adaptive scheduler.
- `assets/models/birds/`: the actual YOLOX-Nano detector and EfficientNet-B2 FP32
  classifier ONNX weights, manifest, all 525 class labels, preprocessing config,
  model card, source references, and licenses. These are ordinary binary files,
  not Git LFS pointers or download placeholders.
- `assets/js/vendor/onnxruntime/`: the original self-hosted ONNX Runtime Web
  1.30.0 JavaScript and WASM binaries, version record, and license.
- `_layouts/`, `_includes/`, shared CSS/JS, fonts/licenses, and favicon: the
  website dependencies that preserve the current rendering and keyboard behavior.
  The original header/footer remain hidden by the unchanged bird app CSS.
- `script/birds/`: the original offline Python evaluation, export, and
  quantization tools plus their optional requirements. Python is not needed to
  run the browser app.
- `tests/birds*` and `docs/birds*`: the original tests and model/development notes.
  Some older notes describe retired model experiments; the manifest and current
  code define the active full-precision mode.

There is no backend inference service, API key, database, or cloud account to
configure. Detection, classification, and motion tracking run on the user's
device. The host only serves static files. The new config has no analytics ID;
no analytics script loads. No photos, camera frames, or results are uploaded.
There is no service worker or guaranteed offline install.

## Build and host

```sh
JEKYLL_ENV=production sh script/build --destination "$PWD/_site"
```

Serve the **contents of `_site/`**, with HTTPS, and support
`.mjs` as JavaScript and `.wasm` as `application/wasm`. Keep every model and runtime
binary in the build. No server-side application process is needed after building.

The manifest retains canonical `/assets/models/birds/...` URLs and validation.
The worker resolves model downloads relative to this app's root so both origin
root hosting and a project prefix such as `/birdid/` work. The Pages workflow
obtains its origin and prefix from GitHub, then builds the matching links.
For a local build matching a project site:

```sh
SITE_URL=https://example.github.io SITE_BASEURL=/birdid \
  JEKYLL_ENV=production sh script/build
```

The public test site has no authentication, feedback form, or result collection.

## Verify

With Node.js 20 or later:

```sh
npm test
```

This checks the app assets against their recorded source or standalone checksums, checks
both ONNX binaries against the model manifest, and runs the geometry, tracking,
motion, scheduling, and worker scope regression suites. After intentional app
development, record changed app assets in `docs/standalone-changes.json` while
preserving the original source snapshot.

For the camera lifecycle, responsive UI, recovery, scheduling, and scope browser
checks, build `_site/` first and provide Playwright and an installed Chromium:

```sh
# Test tooling only; the app has no npm runtime dependencies.
npm install --no-save --package-lock=false playwright
npx playwright install chromium
npm run test:browser
```

The browser tests create temporary servers on available localhost ports and close
them on completion. Optional overrides:

- `BIRDS_BUILD_DIR`: an absolute path to a different Jekyll build destination.
- `PLAYWRIGHT_MODULE_PATH`: an existing Playwright module instead of installing it.
- `PLAYWRIGHT_EXECUTABLE_PATH`: an existing Chromium/Chrome executable.
- `BIRDS_SCREENSHOT_DIR`: an output directory for screenshots.

The real-model smoke test requires a separately supplied, labeled robin photo:

```sh
BIRDS_MODEL_URL=http://127.0.0.1:4001 \
  BIRDS_ROBIN_PHOTO=/absolute/path/to/robin.jpg \
  node tests/birds-models-browser.cjs
```

It uses the running server, real local ONNX inference, and a synthetic camera feed.
The additional distance/tracking/continuity tests use the same variables; some
historical comparison modes require a Git baseline or additional local fixtures.
Test photos and datasets are not required for the app and are not shipped here.
Desktop synthetic camera checks do not establish physical-phone performance or
field identification accuracy.

## Copy provenance

`docs/source-snapshot.json` records the original website commit and SHA-256/size
of every copied file. The source working tree was clean. All runtime app/model
files and shared rendering dependencies were initially copied byte for byte.
`docs/standalone-changes.json` records the subsequent version-label and hosting
changes without rewriting that original provenance. Browser tests
were adjusted to default to this repo's `_site/` and to check the standalone root
and absence of analytics instead of unrelated website pages. The new files are
the app-only Jekyll config, root redirect, run/test instructions, ignore rules,
Ruby version, npm command shortcuts, checksum verifier, and source inventory.

Upstream model and font licenses remain alongside their assets. See
`assets/models/birds/SOURCES.md` for the original model provenance notes.
