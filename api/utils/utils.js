export function getMatches(string, regex) {
  return [...string.matchAll(regex)];
}
