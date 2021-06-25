import { Connection, ConnectionOptions, createConnection } from 'typeorm';
import log from '../helper/log';
import { Items } from '../entity/Items';

export interface Result {
  artist: string;
  title: string;
  album: string;
  release_date: string;
  label: string;
  timecode: string;
  song_link: string;
}

export interface musicInfo {
  status: string;
  result: Result;
}

class DatabaseService {
  private options: ConnectionOptions;
  private conn: Connection;
  constructor(dbHost: string, dbPort: number, dbUser: string, dbPass: string, dbDefaultDB: string, logging = true) {
    this.options = {
      "name": "mariadb",
      "type": "mysql",
      "host": dbHost,
      "port": dbPort,
      "username": dbUser,
      "password": dbPass,
      "database": dbDefaultDB,
      "logging": logging,
      synchronize: true,
      entities: [Items]
    };


  }

  async connect(): Promise<void> {
    await createConnection(this.options).then((conn) => this.conn = conn).catch((err) => log.fatal(err));
  }

  async checkItem(itemID: number): Promise<{ data: null | Items; empty: boolean; }> {
    const itemRepository = this.conn.getRepository(Items);
    const res = await itemRepository.findOne({itemID});
    if(res == undefined) return { data: null, empty: null}; //Es sind weder Metadaten noch ein Item vorhanden
    if(res !== undefined && res.title == null) return { data: null, empty: true }; //Es sind keine Metadaten vorhanden, Item wurde aber schon mal abgefragt
    return { data: res, empty: false }; //Metadaten sind vorhanden
  }

  async insertItem(itemID: number, data?: musicInfo): Promise<Items> {
    if(!this.conn.isConnected) log.fatal("Database not connected!");
    const item = new Items();
    if(data != undefined) {
      item.itemID = itemID;
      item.title = data.result.title;
      item.album = data.result.album;
      item.artist = data.result.artist;
      item.url = data.result.song_link;
    } else {
      item.itemID = itemID;
      item.title = null;
      item.album = null;
      item.artist = null;
      item.url = null;
    }
    const itemRepository = this.conn.getRepository(Items);
    return await itemRepository.save(item);
  }
}

export default DatabaseService;
