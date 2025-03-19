export function mapSlotLabel(key) {
  const lowerCaseKey = key.toLowerCase();
  const locales = {
    head: '头部',
    helm: '头部',
    neck: '颈部',
    shoulders: '肩部',
    shoulder: '肩部',
    cloak: '披风',
    back: '披风',
    chest: '胸甲',
    wrist: '手腕',
    gloves: '手套',
    hands: '手套',
    waist: '腰带',
    belt: '腰带',
    legs: '腿部',
    boots: '脚部',
    feets: '脚部',
    feet: '脚部',
    ['alt (aoe)']: '饰品',
    ['alt (single)']: '饰品',
    weapon: '武器',
    shield: '盾牌',
    ['main hand']: '主手',
    ['main-hand']: '主手',
    ['off hand']: '副手',
    ['off-hand']: '副手',
    offhand: '副手',
  };

  if (locales[lowerCaseKey]?.length) {
    return locales[lowerCaseKey];
  }

  if (lowerCaseKey.includes('trinket')) {
    return '饰品';
  }

  if (lowerCaseKey.includes('ring') || lowerCaseKey.includes('finger')) {
    return '戒指';
  }

  return key;
}
