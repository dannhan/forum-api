const CommentRepository = require('../../Domains/comments/CommentRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(addComment) {
    const { content, owner, threadId } = addComment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, false, $4, $5) RETURNING id, content, owner_id as owner',
      values: [id, content, date, owner, threadId],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async verifyCommentOwner(commentId, owner) {
    const query = {
      text: 'SELECT owner_id FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('COMMENT_NOT_FOUND');
    }

    const comment = result.rows[0];
    if (comment.owner_id !== owner) {
      throw new AuthorizationError('ACCESS_DENIED');
    }
  }

  async deleteCommentById(commentId) {
    const query = {
      text: 'UPDATE comments SET is_delete = true WHERE id = $1',
      values: [commentId],
    };

    await this._pool.query(query);
  }

  async verifyCommentExists(commentId) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('COMMENT_NOT_FOUND');
    }
  }
}

module.exports = CommentRepositoryPostgres;
