export function mapStringToList(string) {
  if (string?.length) {
    return string?.split(',').map((item) => Number(item));
  }
  return [];
}

export function updateStringList(originString, input) {
  let originList;
  if (typeof originString === 'string') {
    originList = originString?.split(',') ?? [];
  } else {
    originList = originString;
  }
  const array = [...originList, ...input].map((item) => Number(item));
  const outputList = [...new Set(array)];
  return outputList.join(',');
}
