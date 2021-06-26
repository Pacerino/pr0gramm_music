import { Connection, ConnectionOptions, createConnection } from 'typeorm';
import log from '../helper/log';
import { Items } from '../entity/Items';

export interface ACRResponse {
  result_type?: number;
  cost_time?:   number;
  status?:      Status;
  metadata?:    Metadata;
}

export interface Metadata {
  music?:         Music[];
  timestamp_utc?: Date;
}

export interface Music {
  external_ids?:      External;
  artists?:           Album[];
  genres?:            Album[];
  title?:             string;
  album?:             Album;
  score?:             number;
  duration_ms?:       number;
  label?:             string;
  play_offset_ms?:    number;
  result_from?:       number;
  contributors?:      Contributors;
  acrid?:             string;
  release_date?:      Date;
  external_metadata?: unknown;
}

export interface Album {
  name?: string;
}

export interface Contributors {
  composers?: string[];
  lyricists?: string[];
}


export interface Status {
  code?:    number;
  msg?:     string;
  version?: string;
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
    await createConnection(this.options).then((conn) => this.conn = conn).catch((err) => log.error(err, {tags: { service: "DB", action: "Connect" } }));
  }

  async checkItem(itemID: number): Promise<{ data: null | Items; empty: boolean; }> {
    const itemRepository = this.conn.getRepository(Items);
    const res = await itemRepository.findOne({itemID});
    if(res == undefined) return { data: null, empty: null}; //Es sind weder Metadaten noch ein Item vorhanden
    if(res !== undefined && res.title == null) return { data: null, empty: true }; //Es sind keine Metadaten vorhanden, Item wurde aber schon mal abgefragt
    return { data: res, empty: false }; //Metadaten sind vorhanden
  }

  async insertItem(itemID: number, data: ACRResponse): Promise<Items> {
    if(!this.conn.isConnected) log.error("Database not connected!", {tags: { service: "DB", action: "Connect" } });
    const item = new Items();
    if(data.status.code == 0) {
      item.itemID = itemID;
      item.title = data.metadata.music[0].title;
      item.album = data.metadata.music[0].album.name;
      item.artist = data.metadata.music[0].artists[0].name;
      item.url = `https://www.aha-music.com/${data.metadata.music[0].acrid}?utm_source=blast`;
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
