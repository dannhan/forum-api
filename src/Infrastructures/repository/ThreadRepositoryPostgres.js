const AddedThread = require('../../Domains/threads/entities/AddedThread');
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

    return new AddedThread(result.rows[0]);
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
        SELECT threads.id, threads.title, threads.body, users.username, threads.date_created as date 
        FROM threads
        INNER JOIN users ON threads.owner_id = users.id
        WHERE threads.id = $1
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
