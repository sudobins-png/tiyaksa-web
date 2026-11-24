const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const ts = require(path.join(root, 'node_modules/typescript'));
function createEnv(storage = new Map(), blocked = false) {
  const files = new Map();
  const events = new EventTarget();
  const window = { location: { href: 'https://tiyaksa.ru/?utm_source=yandex&utm_content=new&yclid=123&phone=private#x', origin: 'https://tiyaksa.ru' },
    dispatchEvent: events.dispatchEvent.bind(events) };
  Object.defineProperty(window.location, 'search', { get: () => new URL(window.location.href).search });
  const document = { referrer: 'https://yandex.ru/search/?text=private',
    createElement: () => ({ remove() { files.delete(this.id); } }),
    getElementById: id => files.get(id), head: { appendChild: el => files.set(el.id, el) } };
  const localStorage = {
    getItem: k => { if (blocked) throw Error('blocked'); return storage.get(k) ?? null; },
    setItem: (k,v) => { if (blocked) throw Error('blocked'); storage.set(k,v); },
    removeItem: k => { if (blocked) throw Error('blocked'); storage.delete(k); },
  };
  const context = vm.createContext({ window, document, localStorage, URL, URLSearchParams, Event, Date, console });
  const cache = new Map();
  function load(file) {
    file = path.resolve(file);
    if (cache.has(file)) return cache.get(file).exports;
    const mod = { exports: {} }; cache.set(file, mod);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
    const run = vm.runInContext(`(function(require,module,exports){${code}\n})`, context, { filename: file });
    run(id => load(path.join(root, id.replace(/^@\//, '')) + '.ts'), mod, mod.exports);
    return mod.exports;
  }
  return { window, document, storage, files,
    consent: load(path.join(root,'lib/analytics/consent.ts')),
    metrika: load(path.join(root,'lib/analytics/metrika.ts')),
    utm: load(path.join(root,'lib/utils/utm.ts')),
    form: load(path.join(root,'lib/server/formConsent.ts')) };
}
let checks = 0;
const check = (label, fn) => { fn(); checks++; console.log('PASS', label); };
const e = createEnv(new Map([['cookie_accepted','1']]));
check('No counter and no persistent campaign storage before a new consent', () => {
  assert.equal(e.consent.getAnalyticsDecision(), null);
  e.utm.captureUtmParams(); e.metrika.syncMetrika();
  assert.equal(e.files.size, 0); assert.equal(e.window.ym, undefined);
  assert.equal(e.storage.has('tiyaksa_utm'), false);
  assert.equal(e.utm.getStoredUtmParams().utm_source, 'yandex');
});
check('Delayed consent preserves entry URL, UTM, yclid and referrer without private query fields', () => {
  e.window.location.href='https://tiyaksa.ru/price';
  e.consent.setAnalyticsDecision('accepted'); e.utm.captureUtmParams(); e.metrika.syncMetrika();
  const q = e.window.ym.a;
  assert.equal(q[0][1], 'init'); assert.equal(q[0][2].defer, true);
  assert.equal(q[1][1], 'hit');
  assert.match(q[1][2], /utm_source=yandex/); assert.match(q[1][2], /yclid=123/);
  assert.doesNotMatch(q[1][2], /private|phone|#x/);
  assert.equal(q[1][3].referer, 'https://yandex.ru/search/');
  assert.equal(q[2][2], 'https://tiyaksa.ru/price');
  assert.equal(e.files.size,1); assert.equal(e.storage.has('tiyaksa_utm'),true);
});
check('Repeated synchronization creates no duplicate initial hits or scripts', () => {
  const n=e.window.ym.a.length; e.metrika.syncMetrika(); e.metrika.syncMetrika();
  assert.equal(e.window.ym.a.length,n); assert.equal(e.files.size,1);
});
check('Withdrawing while the library downloads clears pending analytics events', () => {
  e.consent.setAnalyticsDecision('rejected'); e.utm.captureUtmParams(); e.metrika.syncMetrika();
  assert.equal(e.window.ym.a.length,0); assert.equal(e.storage.has('tiyaksa_utm'),false);
});
check('Refusal prevents tracking on later routes, acceptance can resume and withdrawal destructs', () => {
  e.window.location.href='https://tiyaksa.ru/blog'; e.metrika.syncMetrika();
  assert.equal(e.window.ym.a.length,0);
  e.files.get('tiyaksa-metrika').onload();
  e.consent.setAnalyticsDecision('accepted'); e.metrika.syncMetrika();
  assert.equal(e.window.ym.a[0][1], 'init');
  e.consent.setAnalyticsDecision('rejected'); e.metrika.syncMetrika();
  assert.equal(e.window.ym.a.at(-1)[1], 'destruct');
  const n=e.window.ym.a.length; e.window.location.href='https://tiyaksa.ru/quiz';e.metrika.syncMetrika();
  assert.equal(e.window.ym.a.length,n);
});
check('Direct entries remain direct and personal offer tokens are redacted', () => {
  assert.equal(e.metrika.analyticsUrl('',false),'');
  assert.equal(e.metrika.analyticsUrl('https://tiyaksa.ru/offer/secret-token?name=private'),'https://tiyaksa.ru/offer');
});
check('Blocked storage still honors the choice for the current page', () => {
  const b=createEnv(new Map(),true); b.consent.setAnalyticsDecision('accepted'); b.metrika.syncMetrika();
  assert.equal(b.consent.getAnalyticsDecision(),'accepted');assert.equal(b.files.size,1);
});
check('Expired, corrupted, future and old-version choices do not enable analytics', () => {
  for (const value of ['broken', JSON.stringify({version:'old',decision:'accepted',decidedAt:Date.now()}), JSON.stringify({version:'2026-11-24',decision:'accepted',decidedAt:Date.now()-181*86400000}), JSON.stringify({version:'2026-11-24',decision:'accepted',decidedAt:Date.now()+86400000})]) {
    const b=createEnv(new Map([['tiyaksa_analytics_consent',value]])); b.metrika.syncMetrika(); assert.equal(b.files.size,0);
  }
});
check('An existing valid acceptance starts a counter on a new document', () => {
  const b=createEnv(new Map([['tiyaksa_analytics_consent',JSON.stringify({version:'2026-11-24',decision:'accepted',decidedAt:Date.now()})]]));
  b.metrika.syncMetrika();assert.equal(b.files.size,1);
});
check('Cached old forms are not attributed to the new consent version', () => {
  assert.equal(e.form.readFormConsent(undefined),undefined);assert.equal(e.form.readFormConsent('old'),undefined);
  const receipt=e.form.readFormConsent('2026-11-24');assert.equal(receipt.version,'2026-11-24');assert.equal(receipt.method,'submit_button');
});
check('Fast navigation before the first UTM effect recovers the entry campaign', () => {
  const b=createEnv(); b.metrika.captureLandingContext();
  b.window.location.href='https://tiyaksa.ru/price';
  assert.equal(b.utm.getStoredUtmParams().utm_content,'new');
  assert.equal(b.storage.has('tiyaksa_utm'),false);
});
console.log(`Completed ${checks} checks without network requests or lead submissions.`);
