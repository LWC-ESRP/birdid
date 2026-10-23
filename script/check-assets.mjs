import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const snapshot = JSON.parse(read('docs/source-snapshot.json'));
const changes = JSON.parse(read('docs/standalone-changes.json'));
let count = 0;
for (const [path, original] of Object.entries(snapshot.files)) {
  // Tests and documentation may be adapted for this standalone repository.
  if (!path.startsWith('assets/') && path !== 'birds.html' &&
      !path.startsWith('_includes/') && !path.startsWith('_layouts/')) continue;
  const expected = changes[path] || original;
  const bytes = read(path);
  assert.equal(bytes.length, expected.bytes, `${path}: recorded size changed`);
  assert.equal(sha256(bytes), expected.sha256, `${path}: recorded checksum changed`);
  count++;
}
const manifest = JSON.parse(read('assets/models/birds/manifest.json'));
for (const model of [manifest.detector, ...manifest.options.map(option => option.classifier).filter(Boolean)]) {
  assert.match(model.url, /^\/assets\/models\/birds\/.+\.onnx$/);
  const bytes = read(model.url.slice(1));
  assert.equal(sha256(bytes), model.sha256, `${model.url}: model integrity failed`);
}
for (const path of Object.keys(changes)) assert.ok(snapshot.files[path], `${path}: override lacks original provenance`);
console.log(`${count} app, shared UI, model, and runtime files match the source snapshot or recorded standalone changes; model checksums match the manifest.`);
