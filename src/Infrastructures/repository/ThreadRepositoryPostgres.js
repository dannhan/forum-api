const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(addThread) {
    const { title, body, owner } = addThread;
    const id = `thread-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, title, owner_id as owner',
      values: [id, title, body, date, owner],
    };

    const result = await this._pool.query(query);

    return result.rows[0];
  }

  async verifyThreadExists(id) {
    const query = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('THREAD_NOT_FOUND');
    }
  }

  async getThreadById(id) {
    const query = {
      // text: `
      //   SELECT threads.id, threads.title, threads.body, threads.date_created, users.username
      //   FROM threads
      //   LEFT JOIN comments ON threads.id = comments.thread_id
      //   LEFT JOIN users ON threads.owner_id = users.id
      //   WHERE threads.id = $1
      //   `,

      text: `
        SELECT
          threads.id AS id,
          threads.title AS title,
          threads.body AS body,
          threads.date_created AS date,
          users_threads.username AS username,
          JSONB_AGG(
            JSONB_BUILD_OBJECT(
              'id', comments.id,
              'username', users.username,
              'date', comments.date_created,
              'content', CASE WHEN comments.is_delete THEN '**komentar telah dihapus**' ELSE comments.content END
            ) ORDER BY comments.date_created ASC
          ) AS comments
        FROM
          threads
        JOIN
          users users_threads ON threads.owner_id = users_threads.id
        LEFT JOIN
          comments ON threads.id = comments.thread_id
        LEFT JOIN
          users ON comments.owner_id = users.id
        WHERE
          threads.id = $1
        GROUP BY
          threads.id, threads.title, threads.body, threads.date_created, users_threads.username
      `,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('THREAD_NOT_FOUND');
    }

    return result.rows[0];
  }
}

module.exports = ThreadRepositoryPostgres;
