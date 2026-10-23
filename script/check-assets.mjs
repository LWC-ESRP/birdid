import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const snapshot = JSON.parse(read('docs/source-snapshot.json'));
let count = 0;
for (const [path, original] of Object.entries(snapshot.files)) {
  // Tests and documentation may be adapted for this standalone repository.
  if (!path.startsWith('assets/') && path !== 'birds.html' &&
      !path.startsWith('_includes/') && !path.startsWith('_layouts/')) continue;
  const bytes = read(path);
  assert.equal(bytes.length, original.bytes, `${path}: source size changed`);
  assert.equal(sha256(bytes), original.sha256, `${path}: source checksum changed`);
  count++;
}
const manifest = JSON.parse(read('assets/models/birds/manifest.json'));
for (const model of [manifest.detector, ...manifest.options.map(option => option.classifier).filter(Boolean)]) {
  assert.match(model.url, /^\/assets\/models\/birds\/.+\.onnx$/);
  const bytes = read(model.url.slice(1));
  assert.equal(sha256(bytes), model.sha256, `${model.url}: model integrity failed`);
}
console.log(`${count} app, shared UI, model, and runtime files match the website source; model checksums match the manifest.`);
console.log('This checks the original copy. Update docs/source-snapshot.json deliberately when changing app assets.');
