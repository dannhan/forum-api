const CommentRepository = require('../../Domains/comments/CommentRepository');

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

  // async verifyCommentOwner() {}

  // async deleteCommentById() {}
}

module.exports = CommentRepositoryPostgres;
