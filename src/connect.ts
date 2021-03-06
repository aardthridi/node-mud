import * as db from './db';
import * as fs from 'fs';
import * as world from  './world';

import Client from './client';
import Player from './player';
import log from './log';
import newPlayer from './new-player';

const logoPath = './assets/logo.txt';

const readLogo = async (): Promise<string> => {
  return new Promise<string>(resolve => fs.readFile(logoPath, (err, file) => resolve(file.toString())));
};

const checkPassword = async (player: Player) => {
  const password = await player.promptPassword('What is your password? ');
  if (player.checkPassword(password) === false) {
    player.tell(`Incorrect password.`);
    return false;
  }
};

export default async function (client: Client) {
  client.write(await readLogo());

  const name = await client.prompt('What is your name? ');

  const player = new Player(name, client);
  const playerDoc = await db.findOne(player);
  if (playerDoc === null) {
    try {
      await newPlayer(player);
    } catch (e) {
      log.debug(`Not creating a new player: ${e}`);
      player.disconnect();
      return;
    }
  } else {
    player.load(playerDoc);
    const connected = await checkPassword(player);
    if (connected === false) {
      player.disconnect();
      return;
    }
  }

  world.addPlayer(player);
  await world.gameLoop(player);
  world.removePlayer(player);
};
