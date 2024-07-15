const db = require("./db");

async function findComposer(name, offset = 0, genre = "%") {
  name = db.formatQueryInput(name);
  genre = db.formatQueryInput(genre);
  const query = ` SELECT *
                    FROM composer
                    WHERE LOWER(name) SIMILAR TO $1
                    AND LOWER(genre) SIMILAR TO $2
                    ORDER BY followers DESC
                    OFFSET $3
                    LIMIT $4;`;
  return await db.pool.query(query, [
    name,
    genre,
    offset,
    db.MAX_NUMBER_OF_SONGS_PER_PAGE,
  ]);
}

async function composerExists(name, genre = '%') {
  // const checkQuery = `SELECT * FROM composer WHERE name = $1 AND genre = $2;`;
  // const checkResult = await db.pool.query(checkQuery, [name, genre]);
  // return checkResult.rows.length > 0;
  return (await findComposer(name, 0, genre = '%')).rows.length > 0;
}

async function addComposer(name, genre) {
  const query = `INSERT INTO composer (name,genre)
                   VALUES ($1 , $2);`;
  return await db.pool.query(query, [name, genre]);
}

async function removeComposer(name, genre = "%") {
  name = db.formatQueryInput(name);
  genre = db.formatQueryInput(genre);
  const query = `DELETE FROM composer
                   WHERE LOWER(name) SIMILAR TO $1 
                   AND LOWER(genre) SIMILAR TO $2`;
  return await db.pool.query(query, [name, genre]);
}

module.exports = { findComposer, composerExists, addComposer, removeComposer };
