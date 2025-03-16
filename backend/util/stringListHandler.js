export function updateStringList(originString, input) {
  const originList = originString?.split(',') ?? [];

  const outputList = [...new Set([...originList, ...input])];
  return outputList.join(',');
}
