function collectIdByHref(href) {
  return Number(href.split('item=')[1].split('/')[0]);
}

function collectAdviceOptions(olEle) {
  const options = Array.from(olEle.children).map((liEle, index) => {
    const itemEle = liEle.querySelector('a[href]');
    let rarity = '';
    if (liEle.innerText.toLowerCase().includes('myth')) {
      rarity = 'mythic';
    } else if (liEle.innerText.toLowerCase().includes('hero')) {
      rarity = 'heroic';
    }
    return {
      index,
      id: collectIdByHref(itemEle.href),
      name: itemEle.innerText.trim(),
      rarity,
      info: '',
    };
  });
  return {
    'type': 'all',
    'info': '',
    data: {
      'filters': [],
      options: options,
    },
  };
}