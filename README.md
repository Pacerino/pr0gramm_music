<!-- PROJECT LOGO -->
<br />
<p align="center">
  <h1 align="center">!DEPRECATED! Use https://github.com/Pacerino/pr0music instead!</h1>
  <h3 align="center">pr0gramm_music</h3>

  <p align="center">
    Benutzer-Bot für pr0gramm.com um Musik in einem Video zu erkennen und diese dann als Kommentar zu kommentieren
    <br />
    <br />
    <br />
    ·
    <a href="https://github.com/Pacerino/pr0gramm_music/issues">Fehler melden</a>
    ·
    <a href="https://github.com/Pacerino/pr0gramm_musicissues">Feature vorschlagen</a>
  </p>
</p>



<!-- ABOUT THE PROJECT -->
## About The Project


Wird der Bot unter einem Video markiert, erkennt er automatisch die Musik in einem Video, kommentiert Metadaten, speichert diese in einer Datenbank und versendet ggf. Nachrichten sollte er doppelt markiert werden.


### Built With

* [Dotenv](https://www.npmjs.com/package/dotenv)
* [Fluent-ffmpeg](https://www.npmjs.com/package/fluent-ffmpeg)
* [log4js](https://www.npmjs.com/package/log4js)
* [mysql2](https://www.npmjs.com/package/mysql2)
* [needle](https://www.npmjs.com/package/needle)
* [pr0gramm-api](https://www.npmjs.com/package/pr0gramm-api)
* [reflect-metadata](https://www.npmjs.com/package/reflect-metadata)
* [typeorm](https://www.npmjs.com/package/typeorm)


<!-- GETTING STARTED -->
## Getting Started

## Installation

1. *Account auf [ACRCloud](https://www.acrcloud.com/de/) muss vorhanden sein*

2. *MySql/MariaDB mit einer Datenbank muss vorhanden sein*

3. `docker-compose.yml` anpasen

4. Docker-Compose starten
```sh
docker-compose up -d
```

### Development Prerequisites

- [ffmpeg](https://www.ffmpeg.org/) muss bereits installiert sein.
- Account auf [ACRCloud](https://www.acrcloud.com/de/) muss vorhanden sein
- MySql/MariaDB mit einer Datenbank
- NodeJS LTS
- Typescript


### Installation

1. Repo Klonen
   ```sh
   git clone https://github.com/Pacerino/pr0gramm_music.git
   ```
2. NPM Pakete installieren
   ```sh
   npm install
   ```
   oder
   ```sh
   yarn
   ```
3. `.env` Datei ausfüllen
4. Starten
   ```sh
   npm start
   ```
   oder
   ```sh
   yarn start
   ```



## Usage

Den Benutzernamen des Bots unter einem Video kommentieren.
