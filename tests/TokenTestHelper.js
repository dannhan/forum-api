/* istanbul ignore file */
const Jwt = require('@hapi/jwt');
const UsersTableTestHelper = require('./UsersTableTestHelper');

const TokenTestHelper = {
  async getAccessToken() {
    await UsersTableTestHelper.addUser({});
    return Jwt.token.generate(
      { id: 'user-123', username: 'dicoding' },
      process.env.ACCESS_TOKEN_KEY,
    );
  },
};

module.exports = TokenTestHelper;
