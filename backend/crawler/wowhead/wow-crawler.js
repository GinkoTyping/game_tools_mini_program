import axios from 'axios';
import { JSDOM } from 'jsdom';

async function crawler(params) {
  try {
    const response = await axios.get(
      'https://maxroll.gg/wow/class-guides/augmentation-evoker-mythic-plus-guide',
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
          'Accept-Encoding': 'UTF-8'
        },
      }
    ); // 替换为你的 URL
    const { window } = new JSDOM(response.data);
    const document = window.document;
    console.log(response.data);
    console.log(JSON.stringify(document));

    const data = getStatsPriority(document);
    console.log(data);
  } catch (error) {
    console.error('Error fetching or parsing HTML:', error);
  }
}
crawler();

function getStatsPriority(document) {
  const statsContainers = document.querySelectorAll(
    'div[data-wow-type="priority"]'
  );
  const stats = statsContainers.querySelectorAll('.mxt-stat span');
  const relations = statsContainers.querySelectorAll('.mxt-relation path');
  return {
    stats: Array.from(stats).map((item) => item.innerText),
    relations: Array.from(relations).map((item) => item.d),
  };
}
