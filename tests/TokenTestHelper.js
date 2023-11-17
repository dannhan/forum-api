/* istanbul ignore file */
const Jwt = require('@hapi/jwt');
const UsersTableTestHelper = require('./UsersTableTestHelper');

const TokenTestHelper = {
  async getAccessToken() {
    const userPayload = {
      id: 'user-123',
      username: 'dicoding',
    };
    await UsersTableTestHelper.addUser(userPayload);
    return Jwt.token.generate(userPayload, process.env.ACCESS_TOKEN_KEY);
  },
};

module.exports = TokenTestHelper;
