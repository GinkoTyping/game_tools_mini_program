import { BlizzAPI } from 'blizzapi';
import { configDotenv } from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';

let api;
function setBlizzAPI() {
  if (!api) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    configDotenv({ path: path.resolve(__dirname, '../.env') });
    api = new BlizzAPI({
      region: 'us',
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    });
  }

  return api;
}

export default setBlizzAPI;
