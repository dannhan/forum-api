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
    return result.rows[0];
  }

  async verifyReplyOwner(replyId, owner) {
    const query = {
      text: 'SELECT owner_id FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('REPLY_NOT_FOUND');
    }

    const reply = result.rows[0];
    if (reply.owner_id !== owner) {
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
}

module.exports = ReplyRepositoryPostgres;
