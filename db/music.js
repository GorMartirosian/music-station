const db = require("./db");
const fs = require("fs/promises");
const composer = require("./composer");

async function findMusicMetadata(name, genre = "%", offset = 0) {
  name = db.formatQueryInput(name);
  genre = db.formatQueryInput(genre);
  const query = ` SELECT id, name, date_created, played,genre
                    FROM music
                    WHERE LOWER(name) SIMILAR TO $1
                    AND LOWER(genre) LIKE $2
                    ORDER BY played DESC
                    OFFSET $3
                    LIMIT $4;`;
  const result = await db.pool.query(query, [
    name,
    genre,
    offset,
    db.MAX_NUMBER_OF_SONGS_PER_PAGE,
  ]);
  return result.rows;
}

async function getMusicFile(columnName, argToMatch) {
  const query = ` SELECT mp3_file 
                  FROM music
                  WHERE ${columnName} = $1;`;
  const result = await db.pool.query(query, [argToMatch]);
  if (result.rows.length == 0) {
    return null;
  } else {
    return result.rows[0].mp3_file;
  }
}

async function getMusicFileByName(musicName) {
  return getMusicFile("name", musicName);
}

async function getMusicFileById(musicId) {
  return getMusicFile("id", musicId);
}

async function musicExists(name) {
  return (await findMusicMetadata(name)).length > 0;
}

async function addMusic(
  name,
  filePath,
  composerName,
  genre = null,
  dateCreated = null
) {
  try {
    const musicData = await fs.readFile(filePath);
    if (!(await composer.composerExists(composerName))) {
      throw new RuntimeException("Composer does not exist!");
    }
    console.log(`File ${filePath} read successfully.\n`);
    const query = `INSERT INTO music (name, mp3_file, genre, date_created)
                     VALUES ($1, $2, $3, $4)
                     RETURNING id;`;
    const musicInsertionResult = await db.pool.query(query, [
      name,
      musicData,
      genre,
      dateCreated,
    ]);
    const musicId = musicInsertionResult.rows[0].id;
    const musicComposerAssocQuery = `
                  INSERT INTO music_composer (music_id, composer_id)
                  VALUES ($1, (SELECT id FROM composer WHERE name = $2));`;
    await db.pool.query(musicComposerAssocQuery, [musicId, composerName]);
    console.log("Data inserted successfully.");
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error("File not found:", filePath);
    } else if (error.code === "EACCES") {
      console.error("Permission denied:", filePath);
    } else {
      console.error("Error reading file:", error.message);
    }
  }
}

async function deleteMusic(name) {
  const query = `DELETE FROM music
                   WHERE name = $1;`;
  await db.pool.query(query, [name]);
  console.log(`Deletion of song ${name} successful`);
}

async function findSavedSongs(userLogin, offset = 0) {
  const query = `SELECT id, name, date_created, played,genre
                    FROM music
                    WHERE music.id IN (SELECT music_id
                                      FROM saved_song
                                      WHERE user_id = (SELECT users.id
                                                        FROM users
                                                        WHERE users.login = $1))
                    ORDER BY played DESC
                    OFFSET $2
                    LIMIT $3;`;
  const results = (
    await db.pool.query(query, [
      userLogin,
      offset,
      db.MAX_NUMBER_OF_SONGS_PER_PAGE,
    ])
  ).rows;
  return results;
}

async function isInSaved(songName, userLogin) {
  const saves = await findSavedSongs(userLogin);
  const songIsPresent =
    saves.filter((savedSong) => {
      return savedSong.name === songName;
    }).length != 0;
  return songIsPresent;
}

async function addSongToSaved(songName, userLogin) {
  if (await isInSaved(songName, userLogin)) {
    console.log(`Song ${songName} already in ${userLogin} library.`);
    return true;
  }
  const query = `WITH song_id AS (
                            SELECT id FROM music WHERE name = $1
                                  ),
                      u_id AS (
                            SELECT id FROM users WHERE login = $2
                              )
                 INSERT INTO saved_song (user_id, music_id)
                 VALUES ((SELECT id FROM u_id), (SELECT id FROM song_id));`;
  const result = await db.pool.query(query, [songName, userLogin]);
  const savedToLib = result.rowCount === 1;
  if (savedToLib) {
    console.log(`Song ${songName} saved to ${userLogin} library.`);
  } else {
    console.log(`Song ${songName} unable to save to ${userLogin} library!!!`);
  }
  return savedToLib;
}

async function removeSongFromSaved(songName, userLogin) {
  if (!(await isInSaved(songName, userLogin))) {
    console.log(`Song ${songName} is not in ${userLogin} library.`);
    return true;
  }
  const query = `WITH song_id AS (
                          SELECT id FROM music WHERE name = $1
                                 ),
                      u_id AS (
                          SELECT id FROM users WHERE login = $2
                              )
                DELETE FROM saved_song 
                WHERE music_id = (SELECT id FROM song_id)
                AND
                user_id = (SELECT id FROM u_id);`;
  const result = await db.pool.query(query, [songName, userLogin]);
  const removedFromLib = result.rowCount === 1;
  if (removedFromLib) {
    console.log(`Song ${songName} removed from ${userLogin} library.`);
  } else {
    console.log(
      `Song ${songName} unable to remove from ${userLogin} library!!!`
    );
  }
  return removedFromLib;
}

// (async () => {
//   await addSongToSaved("Telegraph Road", "gormartiros");
//   //console.log(await isInSaved("Sultans of Swing", "gormartiros"));
//   console.log(await findSavedSongs("gormartiros"));
// })();

module.exports = {
  findMusicMetadata,
  getMusicFileById,
  getMusicFileByName,
  findSavedSongs,
  addSongToSaved,
  removeSongFromSaved,
  isInSaved,
};
