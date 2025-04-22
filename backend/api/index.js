import axios from 'axios';

export function queryWowItemById(id, locale) {
  return axios.get(`/api/wow/item/${id}?locale=${locale}`);
}
