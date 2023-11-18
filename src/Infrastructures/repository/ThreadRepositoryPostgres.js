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
      text: `
        SELECT
          t.id AS id,
          t.title AS title,
          t.body AS body,
          t.date_created AS date,
          u_thread.username AS username,
          JSONB_AGG(
            JSONB_BUILD_OBJECT(
              'id', c.id,
              'content', CASE WHEN c.is_delete THEN '**komentar telah dihapus**' ELSE c.content END,
              'username', u_comment.username,
              'date', c.date_created,
              'replies', (
                SELECT COALESCE(
                  JSONB_AGG(
                    JSONB_BUILD_OBJECT(
                      'id', r.id,
                      'content', CASE WHEN r.is_delete THEN '**balasan telah dihapus**' ELSE r.content END,
                      'username', u_reply.username,
                      'date', r.date_created
                    ) ORDER BY r.date_created ASC
                  ),
                  '[]'::jsonb
                )
                FROM replies r
                LEFT JOIN users u_reply ON r.owner_id = u_reply.id
                WHERE r.comment_id = c.id AND r.is_delete = FALSE
              )
            ) ORDER BY c.date_created ASC
          ) AS comments
        FROM
          threads t
        JOIN
          users u_thread ON t.owner_id = u_thread.id
        LEFT JOIN
          comments c ON t.id = c.thread_id
        LEFT JOIN
          users u_comment ON c.owner_id = u_comment.id
        WHERE
          t.id = $1
        GROUP BY
          t.id, t.title, t.body, t.date_created, u_thread.username
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
