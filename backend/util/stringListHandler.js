export function updateStringList(originString, input) {
  const originList = originString?.split(',') ?? [];
  const array = [...originList, ...input].map((item) => Number(item));
  const outputList = [...new Set(array)];
  return outputList.join(',');
}
