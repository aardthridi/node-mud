///<reference path='../interfaces/Persistable.d.ts'/>

import * as Bluebird from 'bluebird';
import * as _ from 'lodash';
import * as mongodb from 'mongodb';

import config from './config';

const url = `mongodb://${config.mongo.host}:${config.mongo.port}/node-mud`;
let db:any = null;

const checkConnection = () => {
  if (db === null) {
    throw new Error('Not connected to database.');
  }
};

export async function connect (): Promise<any> {
  return new Bluebird((resolve, reject) => {
    mongodb.MongoClient.connect(url, (err:Error, database) => {
      if (err) { return reject(err); }
      db = database;
      return resolve({});
    });
  });
}

export async function collection (collection: string) {
  checkConnection();
  return new Bluebird<mongodb.Collection>((resolve, reject) => {
    db.collection(collection, (err:Error, c:any) => {
      if (err) { return reject(err); }
      return resolve(c);
    });
  });
}

export async function save(obj: Persistable) {
  checkConnection();
  const col = await collection(obj.collection);

  // See if there's an existing object.
  const existingObj = await findOne(obj) as Persistable;
  if (existingObj) {
    // If so, use the ID from that object.
    obj._id = existingObj._id;
  }

  return new Bluebird((resolve, reject) => {
    // Make sure to include _id (if present) so that the object is updated
    // rather than saved.
    const savingObj = _.pick(obj, [...obj.props, '_id']);

    col.save(savingObj, (err, res) => {
      if (err) { return reject(err); }
      return resolve(res);
    });
  });
}

export async function findOne(obj: Persistable): Promise<any> {
  checkConnection();
  const col = await collection(obj.collection);

  return new Bluebird((resolve, reject) => {
    const keyedObj = _.pick(obj, obj.keys);

    col.findOne(keyedObj, (err, res) => {
      if (err) { console.log(`got error`); return reject(err); }
      return resolve(res);
    });
  });
}
