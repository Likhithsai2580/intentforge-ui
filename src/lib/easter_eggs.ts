export type EggType =
  | 'matrix'
  | 'konami'
  | 'sudo-rm'
  | 'whoami'
  | 'tor-on'
  | 'decrypt'
  | 'cargo-build'
  | 'borrow-checker'
  | 'async-await'
  | 'segfault'
  | 'grep-privacy'
  | 'ravana'
  | 'asura'
  | 'oxiverse-origin'
  | 'grace'
  | 'intent-deep'
  | 'coffee'
  | 'bug-report'
  | 'sleep'
  | 'git-push-force'
  | 'ship-it'
  | 'search-for-search'
  | 'fake-review'
  | 'affiliate'
  | 'ultra';

export interface EasterEgg {
  id: string;
  pattern: RegExp;
  type: EggType;
  response: string;
}

export const EASTER_EGGS: EasterEgg[] = [
  { id: 'sudo-rm',          pattern: /^sudo\s+rm\s+-rf\s+\/tracking$/i,       type: 'sudo-rm',          response: '' },
  { id: 'whoami',           pattern: /^whoami$/i,                              type: 'whoami',           response: '' },
  { id: 'matrix',           pattern: /^(matrix|follow the white rabbit)$/i,   type: 'matrix',           response: '' },
  { id: 'tor-on',           pattern: /^tor\s+on$/i,                           type: 'tor-on',           response: '' },
  { id: 'decrypt',          pattern: /^decrypt\s+oxiverse$/i,                 type: 'decrypt',          response: '' },
  { id: 'cargo-build',      pattern: /^cargo\s+build\s+--release$/i,          type: 'cargo-build',      response: '' },
  { id: 'borrow-checker',   pattern: /^borrow\s+checker$/i,                   type: 'borrow-checker',   response: '' },
  { id: 'async-await',      pattern: /^async\s+await$/i,                      type: 'async-await',      response: '' },
  { id: 'segfault',         pattern: /^segfault$/i,                           type: 'segfault',         response: '' },
  { id: 'grep-privacy',     pattern: /^grep\s+-r\s+"?privacy"?\s+\.$/i,       type: 'grep-privacy',     response: '' },
  { id: 'ravana',           pattern: /^ravana\s+activate$/i,                  type: 'ravana',           response: '' },
  { id: 'asura',            pattern: /^asura\s+protocol$/i,                   type: 'asura',            response: '' },
  { id: 'oxiverse-origin',  pattern: /^oxiverse\s+origin$/i,                  type: 'oxiverse-origin',  response: '' },
  { id: 'grace',            pattern: /^grace\s+framework$/i,                  type: 'grace',            response: '' },
  { id: 'intent-deep',      pattern: /^intent\s+--deep$/i,                    type: 'intent-deep',      response: '' },
  { id: 'coffee',           pattern: /^coffee\s+--refill$/i,                  type: 'coffee',           response: '' },
  { id: 'bug-report',       pattern: /^bug\s+report$/i,                       type: 'bug-report',       response: '' },
  { id: 'sleep',            pattern: /^sleep\s+8h$/i,                         type: 'sleep',            response: '' },
  { id: 'git-push-force',   pattern: /^git\s+push\s+--force$/i,               type: 'git-push-force',   response: '' },
  { id: 'ship-it',          pattern: /^ship\s+it$/i,                          type: 'ship-it',          response: '' },
  { id: 'search-for-search',pattern: /^search\s+for\s+search$/i,              type: 'search-for-search',response: '' },
  { id: 'fake-review',      pattern: /^fake\s+review\s+detector\s+on$/i,      type: 'fake-review',      response: '' },
  { id: 'affiliate',        pattern: /^affiliate\s+--disclose$/i,             type: 'affiliate',        response: '' },
  { id: 'ultra',            pattern: /^intent:\s*"i believe in privacy"$/i,   type: 'ultra',            response: '' },
  { id: 'konami',           pattern: /^__konami__$/,                          type: 'konami',           response: '' },
];

export function matchEasterEgg(query: string): EasterEgg | null {
  const trimmed = query.trim();
  return EASTER_EGGS.find((egg) => egg.pattern.test(trimmed)) ?? null;
}
