function crawler(ulEle) {
  return Array.from(ulEle.querySelectorAll('li a'))
    .filter((ele) => {
      const countText = ele.querySelector('span').innerText;
      return countText.includes('万') || countText.includes('亿');
    })
    .map((ele) => ele.querySelector('strong').innerText);
}
