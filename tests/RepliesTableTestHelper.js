/* istanbul ignore file */
/* eslint-disable no-console */
const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async addReply({
    id = 'reply-123', content = 'sebuah reply', owner = 'user-123', commentId = 'comment-123', date = '2023-11-17T17:28:27.385Z', isDelete = false,
  }) {
    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, content, date, isDelete, owner, commentId],
    };

    await pool.query(query).catch((error) => console.log(error));
  },

  async findReplyById(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };

    return pool.query(query)
      .then((res) => res.rows)
      .catch((error) => console.log(error));
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },
};

module.exports = RepliesTableTestHelper;
