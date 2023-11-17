/* istanbul ignore file */
const Jwt = require('@hapi/jwt');
const UsersTableTestHelper = require('./UsersTableTestHelper');

const TokenTestHelper = {
  async getAccessToken({ id = 'user-123', username = 'dicoding' } = {}) {
    await UsersTableTestHelper.addUser({});
    return Jwt.token.generate(
      { id, username },
      process.env.ACCESS_TOKEN_KEY,
    );
  },
};

module.exports = TokenTestHelper;
