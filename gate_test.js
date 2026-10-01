// SJR gate regression test — Patrick weekly guide.
// Added 2026-10-01 with the v7.4 two-key gate. The repo had no test harness; this is it.
//
// Run:  node gate_test.js        (from the repo root, no dependencies)
// Also run:  node --check <the extracted script>  — see extractScript() below.
//
// WHY THIS EXISTS. The gate has now failed in both directions:
//   - absolute-only gates (pre-Sep 4) cancelled lower body every day at a 5.9/10 floor;
//   - median-only gates (Sep 4) let a 6/10 on a 5/10 median render as full send, while the
//     log modal still displayed the OLD absolute verdict. The app showed a red flag and
//     then built a green workout.
// Both regressions are pinned below. If a future edit reintroduces either, this fails.

const fs = require('fs');
const path = require('path');

const HTML = path.join(__dirname, 'SJR_WeeklyGuide_Patrick_v5_20260402.html');

function extractScript(){
  const html = fs.readFileSync(HTML, 'utf8');
  const blocks = html.match(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g) || [];
  if(blocks.length !== 1) throw new Error('one-script rule broken: ' + blocks.length + ' inline blocks');
  return blocks[0].replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '');
}

function slice(src, from, to){
  const a = src.indexOf(from); if(a < 0) throw new Error('marker not found: ' + from);
  const b = src.indexOf(to, a); if(b < 0) throw new Error('end marker not found: ' + to);
  return src.slice(a, b);
}

const src = extractScript();
const code = [
  slice(src, 'function getLatestScore(metric){', '\n// v7 (Jul 2026)'),
  slice(src, 'const BASELINE_WINDOW_DAYS', 'function updateMetricDisplay('),
  'function fmtScore(v){ return (v % 1 === 0) ? String(v) : v.toFixed(1); }',
].join('\n');

global.document = { getElementById: function(){ return null; } };
const build = new Function('logs', code + '\nreturn {getBaseline, gateVerdictFor, getBreaches, ABS_LIMITS};');

const DAY = 86400000;
// n prior daily logs at `med`, plus today at `today`
function mk(med, today, n){
  const o = [];
  const days = (n === undefined) ? 13 : n;
  for(let i = 1; i <= days; i++) o.push({metric:'morning', score:med, ts: Date.now() - i*DAY + 1000});
  o.push({metric:'morning', score:today, ts: Date.now() - 1000});
  return o;
}

let pass = 0, fail = 0;
function t(name, got, want){
  const ok = got === want; ok ? pass++ : fail++;
  console.log((ok ? '  PASS  ' : '  FAIL  ') + name + '   got=' + got + ' want=' + want);
}
function verdict(med, today, n){
  const b = build(mk(med, today, n)).getBreaches();
  return b.morning ? 'hold' : b.morningReduce ? 'reduce' : 'pass';
}

console.log('\n--- reported Oct 1: median 5, logging 4-6 (all were full send) ---');
t('today 4', verdict(5,4), 'pass');
t('today 5', verdict(5,5), 'pass');
t('today 6', verdict(5,6), 'reduce');
t('today 7', verdict(5,7), 'hold');

console.log('\n--- plateau caught by the absolute key (NOT by capping the median) ---');
t('median 6, today 6', verdict(6,6), 'reduce');
t('median 8, today 8', verdict(8,8), 'hold');
t('median 6.5, today 6.9', verdict(6.5,6.9), 'reduce');
t('median stays uncapped', build(mk(8,8,13)).getBaseline('morning'), 8);

console.log('\n--- sensitivity: a bad day inside a good stretch still fires ---');
t('median 2, today 3.5', verdict(2,3.5), 'hold');
t('median 2, today 2.5', verdict(2,2.5), 'reduce');
t('median 2, today 2',   verdict(2,2),   'pass');
t('median 2, today 1',   verdict(2,1),   'pass');

console.log('\n--- no daily-cancel regression (the pre-Sep-4 failure) ---');
t('5.9 floor at 5.9 is not a hard stop', verdict(5.9,5.9), 'reduce');
t('5.9 floor, good day 4.5 runs',        verdict(5.9,4.5), 'pass');

console.log('\n--- absolute ceiling is unconditional ---');
t('median 2, today 7',     verdict(2,7),     'hold');
t('median 4.5, today 7',   verdict(4.5,7),   'hold');
t('median 4.5, today 6.9', verdict(4.5,6.9), 'hold');

console.log('\n--- thin data falls back to absolutes without crashing ---');
t('2 logs, today 6', verdict(6,6,1), 'reduce');
t('2 logs, today 7', verdict(7,7,1), 'hold');
t('2 logs, today 3', verdict(3,3,1), 'pass');
t('no logs', (function(){ const b = build([]).getBreaches();
  return (b.morning || b.morningReduce) ? 'fired' : 'pass'; })(), 'pass');

console.log('\n--- modal and plan builder must agree (the Sep 4 regression) ---');
[[5,6],[5,7],[8,8],[2,2],[5.9,5.9],[4.5,6.9]].forEach(function(c){
  const api = build(mk(c[0], c[1], 13));
  const modal = api.gateVerdictFor('morning', c[1]).level;
  const b = api.getBreaches();
  const builder = b.morning ? 'hold' : b.morningReduce ? 'reduce' : 'pass';
  t('median ' + c[0] + ' today ' + c[1] + ' -> ' + modal, modal === builder, true);
});

console.log('\n--- levels mutually exclusive ---');
const bx = build(mk(5,7,13)).getBreaches();
t('hold excludes reduce', bx.morning && !bx.morningReduce, true);

console.log('\n' + (fail ? '*** FAILED ' + fail + ' of ' + (pass+fail) : 'ALL ' + pass + ' CHECKS PASS'));
process.exit(fail ? 1 : 0);
