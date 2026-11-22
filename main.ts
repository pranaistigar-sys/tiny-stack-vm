import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const S = new Int32Array(256), M = new Int32Array(256), C = new Int32Array(64), O = new Uint8Array(65536), G = new Uint8Array(10);
function run(p, q) {
let sp = 0, cp = 0, pc = 0, ip = 0, st = 0, ol = 0;
const n = p.length;
for (let i = 0; i < 256; i++) M[i] = 0;
for (;;) {
if (st === 1000000) return [10, ol];
if (pc < 0 || pc >= n) return [9, ol];
const op = p[pc];
const im = op === 1 ? 1 : op === 2 ? 4 : op >= 48 && op <= 51 ? 2 : 0;
if (pc + im >= n) return [9, ol];
st++;
const nx = pc + 1 + im;
pc = nx;
switch (op) {
case 0: return [0, ol];
case 1:
if (sp >= 256) return [3, ol];
S[sp++] = (p[nx - 1] << 24) >> 24;
break;
case 2:
if (sp >= 256) return [3, ol];
S[sp++] = p[nx - 4] | (p[nx - 3] << 8) | (p[nx - 2] << 16) | (p[nx - 1] << 24);
break;
case 3:
if (sp < 1) return [2, ol];
sp--;
break;
case 4:
if (sp < 1 || sp >= 256) return [sp < 1 ? 2 : 3, ol];
S[sp] = S[sp - 1]; sp++;
break;
case 5:
if (sp < 2) return [2, ol];
{ const t = S[sp - 1]; S[sp - 1] = S[sp - 2]; S[sp - 2] = t; }
break;
case 6:
if (sp < 2 || sp >= 256) return [sp < 2 ? 2 : 3, ol];
S[sp] = S[sp - 2]; sp++;
break;
case 7:
if (sp < 3) return [2, ol];
{ const a = S[sp - 3]; S[sp - 3] = S[sp - 2]; S[sp - 2] = S[sp - 1]; S[sp - 1] = a; }
break;
case 23:
if (sp < 1) return [2, ol];
S[sp - 1] = -S[sp - 1] | 0;
break;
case 27:
if (sp < 1) return [2, ol];
S[sp - 1] = ~S[sp - 1];
break;
case 16: case 17: case 18: case 19: case 20: case 21: case 22: case 24: case 25: case 26: case 28: case 29: case 30: case 32: case 33: case 34: {
if (sp < 2) return [2, ol];
const b = S[sp - 1], a = S[sp - 2];
let r;
if (op === 16) r = (a + b) | 0;
else if (op === 17) r = (a - b) | 0;
else if (op === 18) r = Math.imul(a, b);
else if (op === 19) { if (!b) return [4, ol]; r = a === -2147483648 && b === -1 ? a : (a / b) | 0; }
else if (op === 20) { if (!b) return [4, ol]; r = b === -1 ? 0 : (a % b) | 0; }
else if (op === 21) { if (!b) return [4, ol]; r = Math.floor((a >>> 0) / (b >>> 0)) | 0; }
else if (op === 22) { if (!b) return [4, ol]; r = ((a >>> 0) % (b >>> 0)) | 0; }
else if (op === 24) r = a & b;
else if (op === 25) r = a | b;
else if (op === 26) r = a ^ b;
else if (op === 28) r = a << (b & 31);
else if (op === 29) r = a >> (b & 31);
else if (op === 30) r = (a >>> (b & 31)) | 0;
else if (op === 32) r = a === b ? 1 : 0;
else if (op === 33) r = a < b ? 1 : 0;
else r = (a >>> 0) < (b >>> 0) ? 1 : 0;
sp -= 2; S[sp++] = r;
break; }
case 48: case 49: case 50: {
const rel = ((p[nx - 2] | (p[nx - 1] << 8)) << 16) >> 16;
let take = true;
if (op !== 48) {
if (sp < 1) return [2, ol];
const v = S[--sp];
take = op === 49 ? v === 0 : v !== 0;
}
if (take) pc = nx + rel;
break; }
case 51:
if (cp === 64) return [7, ol];
C[cp++] = nx;
pc = p[nx - 2] | (p[nx - 1] << 8);
break;
case 52:
if (cp === 0) return [8, ol];
pc = C[--cp];
break;
case 64: {
if (sp < 1) return [2, ol];
const a = S[sp - 1];
if (a < 0 || a >= 256) return [6, ol];
S[sp - 1] = M[a];
break; }
case 65: {
if (sp < 2) return [2, ol];
const a = S[sp - 1], v = S[sp - 2];
if (a < 0 || a >= 256) return [6, ol];
sp -= 2; M[a] = v;
break; }
case 80: {
if (sp < 1) return [2, ol];
let v = S[sp - 1], neg = 0, t = 0;
if (v < 0) { neg = 1; v = -v; }
if (!v) G[t++] = 48;
else while (v > 0) { G[t++] = 48 + (v % 10); v = Math.trunc(v / 10); }
if (ol + neg + t > 65536) return [11, ol];
sp--;
if (neg) O[ol++] = 45;
while (t) O[ol++] = G[--t];
break; }
case 81:
if (sp < 1) return [2, ol];
if (ol + 1 > 65536) return [11, ol];
O[ol++] = S[--sp] & 255;
break;
case 82:
if (sp >= 256) return [3, ol];
S[sp++] = ip < q.length ? q[ip++] : -1;
break;
case 83:
if (sp < 1) return [2, ol];
return [S[--sp] & 255, ol];
default:
return [5, ol];
}
}
}
const I = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const P = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
for (const id of readdirSync(I).sort()) {
const [code, ol] = run(new Uint8Array(readFileSync(join(I, id, 'program.bin'))), new Uint8Array(readFileSync(join(I, id, 'input.bin'))));
mkdirSync(join(P, id), { recursive: true });
writeFileSync(join(P, id, 'stdout.bin'), O.subarray(0, ol));
writeFileSync(join(P, id, 'exit.txt'), code + '\n');
}
