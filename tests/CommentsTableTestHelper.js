/* istanbul ignore file */
/* eslint-disable no-console */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-123', content = 'sebuah comment', owner = 'user-123', threadId = 'thread-123', date = '2023-11-17T17:28:27.385Z', isDelete = false,
  }) {
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, content, date, isDelete, owner, threadId],
    };

    await pool.query(query).catch((error) => console.log(error));
  },

  async findCommentById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    return pool.query(query)
      .then((res) => res.rows)
      .catch((error) => console.log(error));
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
