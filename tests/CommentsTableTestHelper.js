/* eslint-disable no-console */
/* istanbul ignore file */

const UsersTableTestHelper = require('./UsersTableTestHelper');
const ThreadsTableTestHelper = require('./ThreadsTableTestHelper');
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-123', content = 'sebuah comment', owner = 'user-123', threadId = 'thread-123', date = '2023-11-17T17:28:27.385Z',
  }) {
    await UsersTableTestHelper.addUser({ id: owner });
    await ThreadsTableTestHelper.addThread({ id: threadId, owner });

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, false, $4, $5)',
      values: [id, content, date, owner, threadId],
    };

    try {
      await pool.query(query);
    } catch (error) {
      // debugging purpose
      console.log(error);
    }
  },

  async findCommentById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.log(error);
    }

    return null;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
