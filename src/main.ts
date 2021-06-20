import { Pr0grammAPI, NodeRequester } from "pr0gramm-api";
import * as dotenv from 'dotenv';
import WatchService from './services/WatchService';
import Pr0Service from './services/Pr0Service';
import MusicService from './services/MusicService';
import DatabaseService from './services/DatabaseService';
import LogService from './services/LogService';
import queue from 'queue';

const log = new LogService();
dotenv.config();
const q = queue();

main();
async function main() {

  //const requester = NodeRequester.create("https://1fa20fb1-768a-401b-8e86-7b6c9f8ffe8b.mock.pstmn.io");
  const requester = NodeRequester.create();
  const api = Pr0grammAPI.create(requester);

  const loginResponse = await api.user.login(process.env.PR0_USER, process.env.PR0_PASSWORD, "", "");
  log.debug(loginResponse);
  if (!loginResponse.success) {
    log.error("Could not log in :(");
    if (loginResponse.ban !== null) {
      log.error("You are banned. Reason:");
      log.fatal(loginResponse.ban.reason);
      return;
    }
  } else {
    const watcher = new WatchService();
    const pr0 = new Pr0Service(api);
    const music = new MusicService(process.env.AUDD_KEY);
    const db = new DatabaseService(process.env.DB_HOST, Number.parseInt(process.env.DB_PORT), process.env.DB_USER, process.env.DB_PASS, process.env.DB_DATABASE, false);
    await db.connect();

    watcher.start(async () => {
      const Comments = await api.messages.getComments();
      const messages = Comments.messages.filter((msg) => {
        return msg.read == 0;
      })
      messages.forEach(async msg => {
        q.push(async () => {
          const thumb = await pr0.resolveThumb(msg.thumb); //Hole mir die original URL zu dem Video
          if (thumb !== false) {
            const checkItem = await db.checkItem(msg.itemId); //Überpüft ob der Post bereits abgefragt wurde
            if (!checkItem.empty && checkItem.data != null) {
              log.debug("[Message] Found data in DB - Item: " + msg.itemId);
              pr0.notifyUser(msg, true, checkItem.data); //Post wurde bereits abgefragt, antworte mit einer privaten Nachricht
            } else if (checkItem.empty == null && checkItem.data == null) { //Post wurde noch nicht abgefragt
              log.info("Start Download - Item: " + msg.itemId);
              const downloadPath = await pr0.downloadItem(thumb.toString()); //Herunterladen des Videos
              log.info("Start Convertion - Item: " + msg.itemId);
              const musicPath = await music.convertToAudio(downloadPath); //Extrahieren der Audiospur aus dem Video
              log.info("Start Identification - Item: " + msg.itemId);
              const musicInfo = await music.identifyMusic(musicPath); //Musik in der Audiospur erkennen
              if (musicInfo.status === "success" && musicInfo.result != null) { //Erfolgreich erkannt?
                log.debug("[Kommentar] Found data - Item: " + msg.itemId);
                await db.insertItem(msg.itemId, musicInfo); //Metadaten in die DB speichern
                await pr0.commentMusicInfo(msg.itemId, msg.id, true, musicInfo); //Unter der Markierung mit den Metadaten kommentieren
              } else { //Es wurden keine Metadaten erkannt
                log.debug("[Kommentar] No data found - Item: " + msg.itemId);
                await db.insertItem(msg.itemId); //Leere Metadaten in die DB speichern
                await pr0.commentMusicInfo(msg.itemId, msg.id, false); //Benutzer per Kommentar benachrichtigen
              }
            } else if (checkItem.empty && checkItem.data == null) { //Post wurde abgefragt, es konnten aber keine Daten gefunden werden.
              log.debug("[Message]: Never found data - Item: " + msg.itemId);
              await pr0.notifyUser(msg, false); //Benutzer per private Nachricht benachrichtigen
            }
          } else {
            //Es konnte keine originale URL gefunden werden oder es ist kein Video
            await pr0.commentNoThumb(msg.itemId, msg.id); //Benutzer per Kommentar benachrichtigen
          }
          await music.deleteFiles(); //Lösche alle temporären Dateien
        });
      });
      q.start((err) => {
        if (err) log.fatal(err);
      })
    });
  }
}

q.on('success', () => {
  log.debug('[Queue] Job done!')
})
