import axios from 'axios';

export async function queryDpsWoWList(req, res) {
  const params = req?.body;
  try {
    const { data } = await axios.post('https://dps-api.wowgf.com/app/rank/dpsTopRank/topRank', req?.body);
    res.json(data);
  } catch (e) {
    console.error(e);
    res.json({
      code: 500,
      data: {
        list: [],
        pagination: {
          total: 0,
        },
      },
    });
  }
}
