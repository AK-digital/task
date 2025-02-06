export function isEmpty(arr) {
  if (!Array.isArray(arr)) {
    return false;
  }

  if (arr.length <= 0) {
    return false;
  }

  return true;
}
