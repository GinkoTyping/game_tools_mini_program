import axios from "axios";
import { JSDOM } from "jsdom";

async function crawler(params) {
  try {
    // todo 无法获取国外网站，搁置
    const response = await axios.get(
      "https://www.wowhead.com/cn/guide/classes/evoker/devastation/bis-gear"
    ); // 替换为你的 URL
    const { window } = new JSDOM(response.data);
    const document = window.document;

    const data = getBisItem(document, "#overall-bis");
    console.log(data);
  } catch (error) {
    console.error("Error fetching or parsing HTML:", error);
  }
}
crawler();

function getBisItem(document, containerId) {
  let itemDoms;
  if (containerId === "#overall-bis") {
    const overallBIS = document.querySelector("#guide-body tbody");
    itemDoms = overallBIS.querySelectorAll("tr");
  } else {
    itemDoms = document.querySelectorAll(`${containerId} tbody tr`);
  }

  return Array.from(itemDoms).map((dom) => {
    const tds = dom.querySelectorAll("td");
    const columns = Array.from(tds).reduce((pre, cur) => {
      pre.push(cur.innerText);
      return pre;
    }, []);

    const itemIcon = dom.querySelector("img")?.src;
    return {
      slot: columns[0],
      item: columns[1],
      source: columns[2],
      itemIcon,
    };
  });
}
