const routes = require('./routes');
const CommentsHandler = require('./handler');

module.exports = {
  name: 'comments',
  register: async (server, { container }) => {
    const commentsHandler = new CommentsHandler(container);
    server.route(routes(commentsHandler));
  },
};
