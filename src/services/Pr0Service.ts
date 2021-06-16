import * as needle from 'needle';
import { InboxComments, Pr0grammAPI, Pr0grammResponse } from 'pr0gramm-api';
import { Items } from '../entity/Items';
import { musicInfo } from './DatabaseService';
import LogService from './LogService';

class Pr0Service {

  private api: Pr0grammAPI;
  private log = new LogService();

  constructor(api: Pr0grammAPI) {
    this.api = api;
  }

  resolveThumb(thumbPath: string): Promise<string | false> {
    const splittedPath = thumbPath.split(".");
    thumbPath = "https://vid.pr0gramm.com/" + splittedPath[0] + ".mp4"
    return needle('get', thumbPath).then((response) => {
      if (response.statusCode == 404) return false;
      if (response.statusCode == 200) return thumbPath;
      this.log.fatal("Error while getting real URL from thumbnail");;
      return false;
    });
  }

  downloadItem(itemUrl: string): Promise<string> {
    const path = './tmp/tmpfile.mp4';
    return new Promise((resolve, reject) => {
      return needle.get(itemUrl, { output: path }, (err) => {
        if (err) reject(err);
        resolve(path);
      });
    });
  }

  async notifyUser(msg: InboxComments, found: boolean, item?: Items): Promise<boolean> {
    let messageNotFound: string;
    let messageFound: string;

    if (found) {
      messageFound = `Hallo ${msg.name},

    Du hast bei https://pr0gramm.com/new/${msg.itemId} nach der Musik gefragt.
    Jemand hat bereits danach gefragt, daher erhälst du hier nur eine Kopie.

    Titel: ${item.title}
    Album: ${item.album}
    Artist: ${item.artist}

    Hier ist ein Link: ${item.url}
    `;
    } else {
      messageNotFound = `Hallo ${msg.itemId},

    Du hast bei https://pr0gramm.com/new/${msg.itemId} nach der Musik gefragt.
    Leider wurden keine Informationen gefunden.`;
    }



    return this.api.messages.sendMessage(msg.name, (found ? messageFound : messageNotFound))
      .catch((err) => {
        this.log.fatal(err); return false
      }).then(() => {
        return true;
      })
  }

  async commentMusicInfo(itemId: number, replyTo: number, found: boolean, data?: musicInfo): Promise<Pr0grammResponse> {
    if (found) {
      const messageFound = `Es wurden folgende Informationen dazu gefunden:
    Titel: ${data.result.title}
    Album: ${data.result.album}
    Artist: ${data.result.artist}

    Hier ist ein Link: ${data.result.song_link}
    `;
      return await this.api.comments.post(itemId, messageFound, replyTo);
    } else {
      const messageNotFound = `Es wurden keine Informationen zu dem Lied gefunden`;
      return await this.api.comments.post(itemId, messageNotFound, replyTo);
    }
  }

  async commentNoThumb(itemId: number, replyTo: number): Promise<Pr0grammResponse> {
    const message = `So wie es aussieht ist der Post kein Video`;
    return await this.api.comments.post(itemId, message, replyTo);
  }

}

export default Pr0Service;
