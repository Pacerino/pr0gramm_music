import { Connection, ConnectionOptions, createConnection, InsertResult } from 'typeorm';
import log from '../helper/log';
import { Comments } from '../entity/Comments';
import { MusicMetadata } from '../entity/Metadata';
import { InboxComments, InboxComments as pr0comments } from 'pr0gramm-api/lib/common-types';
import getMetadata from '../helper/api';

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
      entities: [Comments, MusicMetadata]
    };

  }

  async connect(): Promise<void> {
    await createConnection(this.options).then((conn) => this.conn = conn).catch((err) => log.error(err, {tags: { service: "DB", action: "Connect" } }));
  }

  async checkItem(itemID: number): Promise<{ data: null | MusicMetadata; empty: boolean; }> {
    const itemRepository = this.conn.getRepository(MusicMetadata);
    const res = await itemRepository.findOne({itemID});
    if(res == undefined) return { data: null, empty: null}; //Es sind weder Metadaten noch ein Item vorhanden
    if(res !== undefined && res.title == null) return { data: null, empty: true }; //Es sind keine Metadaten vorhanden, Item wurde aber schon mal abgefragt
    return { data: res, empty: false }; //Metadaten sind vorhanden
  }

  async insertItem(itemID: number, data: ACRResponse): Promise<MusicMetadata> {
    if(!this.conn.isConnected) log.error("Database not connected!", {tags: { service: "DB", action: "Connect" } });
    const item = new MusicMetadata();
    if(data.status.code == 0) {
      const MoreMetdata = (await getMetadata(data.metadata.music[0].acrid)).data
      item.itemID = itemID;
      item.acrID = data.metadata.music[0].acrid
      item.title = data.metadata.music[0].title;
      item.album = data.metadata.music[0].album.name;
      item.artist = data.metadata.music[0].artists[0].name;
      item.url = `https://www.aha-music.com/${data.metadata.music[0].acrid}?utm_source=blast`;
      if(MoreMetdata.success) {
        item.entityUniqueId = MoreMetdata.data.entityUniqueID;
        item.userCountry = MoreMetdata.data.userCountry
        // Soundcloud
        item.soundcloudID = MoreMetdata.data.linksByPlatform.soundcloud.entityUniqueId
        item.soundcloudUrl = MoreMetdata.data.linksByPlatform.soundcloud.url
        // Spotify
        item.spotifyID = MoreMetdata.data.linksByPlatform.spotify.entityUniqueId
        item.spotifyURL = MoreMetdata.data.linksByPlatform.spotify.url
        // TIDAL
        item.tidalID = MoreMetdata.data.linksByPlatform.tidal.entityUniqueId
        item.tidalURL = MoreMetdata.data.linksByPlatform.tidal.url
        // YouTube
        item.youtubeID = MoreMetdata.data.linksByPlatform.youtube.entityUniqueId
        item.youtubeURL = MoreMetdata.data.linksByPlatform.youtube.url
        // AppleMusic
        item.applemusicID = MoreMetdata.data.linksByPlatform.appleMusic.entityUniqueId
        item.applemusicURL = MoreMetdata.data.linksByPlatform.appleMusic.url
        // TODO: URL Anpassen wenn mehr Metadaten gefunden wurden!
        // item.url = `https://pacerino.github.io/pr0gramm_music_frontend/info/${data.metadata.music[0].acrid}`;
      } else {
        log.error(`Error while calling API: ${MoreMetdata.message}`, {tags: { service: "API", action: "GetMetadata" } })
        item.url = `https://www.aha-music.com/${data.metadata.music[0].acrid}?utm_source=blast`;
      }
    } else {
      item.itemID = itemID;
    }
    const itemRepository = this.conn.getRepository(MusicMetadata);
    return await itemRepository.save(item);
  }

  async upsert(msg: InboxComments): Promise<InsertResult> {
    return await this.conn.createQueryBuilder().insert().into(Comments).values(
      {
        type: msg.type,
        id: msg.id,
        itemId: msg.itemId,
        image: msg.image,
        thumb: msg.thumb,
        flags: msg.flags,
        name: msg.name,
        senderId: msg.senderId,
        collection: msg.collection,
        created: msg.created.toString(),
        message: msg.message,
        read: msg.read
      }
    ).orIgnore().execute();
  }

  async insertMessage(messages: pr0comments[]): Promise<void> {
    messages.map(async msg => await this.upsert(msg))
    return
  }
}

export default DatabaseService;
