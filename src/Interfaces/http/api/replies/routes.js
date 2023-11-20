const routes = (handler) => [
  {
    method: 'POST',
    path: '/threads/{threadId}/comments/{commentId}/replies',
    handler: handler.postReplyHandler,
    options: {
      auth: 'forum_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/threads/{threadId}/comments/{commentId}/replies/{replyId}',
    handler: handler.deleteReplyByIdHandler,
    options: {
      auth: 'forum_jwt',
    },
  },
];

module.exports = routes;
