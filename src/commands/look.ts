import Player from '../player';
import world = require('../world');

export function match(command: string) {
  return command === 'look';
}

export async function handle(args: string, player: Player, fail: Function) {
  world.look(player);
  return true;
}
