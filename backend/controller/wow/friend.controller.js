import { useFriendOptionMapper } from '../../database/wow/mapper/static/friendOption.mapper.js';

const friendOptionMapper = useFriendOptionMapper();

export async function queryFriendOptions(req, res) {
  res.json(friendOptionMapper.getFriendOptions());
}
