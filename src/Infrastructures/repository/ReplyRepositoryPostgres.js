const AddedReply = require('../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(addReply) {
    const { content, owner, commentId } = addReply;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, false, $4, $5) RETURNING id, content, owner_id as owner',
      values: [id, content, date, owner, commentId],
    };

    const result = await this._pool.query(query);
    return new AddedReply(result.rows[0]);
  }

  async verifyReplyOwner(replyId, userId) {
    const query = {
      text: 'SELECT owner_id FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('REPLY_NOT_FOUND');
    }

    const reply = result.rows[0];
    if (reply.owner_id !== userId) {
      throw new AuthorizationError('ACCESS_DENIED');
    }
  }

  async deleteReplyById(replyId) {
    const query = {
      text: 'UPDATE replies SET is_delete = true WHERE id = $1 RETURNING id',
      values: [replyId],
    };

    await this._pool.query(query);
  }

  async getRepliesByThreadId(threadId) {
    const query = {
      text: `
        SELECT replies.id, users.username, replies.content ,replies.date_created, replies.is_delete, replies.comment_id
        FROM replies
        INNER JOIN comments ON comments.id = replies.comment_id
        INNER JOIN users ON users.id = replies.owner_id
        WHERE comments.thread_id = $1
        ORDER BY replies.date_created ASC
      `,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = ReplyRepositoryPostgres;
