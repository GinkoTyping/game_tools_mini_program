import friendOptions from '../../data/friend/tag.js';

function getFriendOptions() {
  return friendOptions;
}

export function useFriendOptionMapper() {
  return { getFriendOptions };
}
