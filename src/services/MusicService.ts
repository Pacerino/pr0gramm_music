import * as needle from 'needle';
import * as fs from 'fs';
import * as ffmpeg from 'fluent-ffmpeg';
import { musicInfo } from './DatabaseService';

class MusicService {

  private defaultOptions;

  constructor(cKey: string) {
    this.defaultOptions = {
      host: 'https://api.audd.io',
      endpoint: '/recognize',
      market: 'de',
      access_key: cKey,
    };
  }

  convertToAudio(pathToFile: string, itemID: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const outputPath = `./tmp/${itemID}.mp3`;
      ffmpeg(pathToFile).output(outputPath).on('end', function () {
        resolve(outputPath);
      }).on('error', function (err) {
        reject(err);
      }).run();
    });
  }

  identifyMusic(pathToAudio: string): Promise<musicInfo> {
    const bitmap = fs.readFileSync(pathToAudio);
    const formData = {
      api_token: this.defaultOptions.access_key,
      file: Buffer.from(bitmap),
      market: this.defaultOptions.market,
      return: 'spotify'
    };
    return new Promise<musicInfo>((resolve, reject) => {
      needle.post(this.defaultOptions.host + this.defaultOptions.endpoint, formData, { multipart: true }, (err, body) => {
        if (err) return reject(err);
        resolve(body.body);
      });
    });
  }

  async deleteFiles(itemID: number): Promise<void> {
    await [`./tmp/${itemID}.mp3`, `./tmp/${itemID}.mp4`].map(file => new Promise<void>((resolve, reject) => {
      fs.stat(file, (exists) => {
        if (exists == null) {
          fs.unlink(file, err => {
            if(err) reject(err);
            resolve();
          });
        } else if (exists.code === 'ENOENT') {
          resolve();
        }
      });
    }));
  }

}

export default MusicService;
