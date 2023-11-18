const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and added reply', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
      const requestPayload = {
        content: 'sebuah reply',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
        auth: {
          strategy: 'forum_jwt',
          credentials: {
            id: 'user-123',
          },
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply.id).toBeDefined();
      expect(responseJson.data.addedReply.content).toBe('sebuah reply');
      expect(responseJson.data.addedReply.owner).toBe('user-123');
    });

    it('should response 404 when commentId not found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});

      const requestPayload = {
        content: 'sebuah reply',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
        auth: {
          strategy: 'forum_jwt',
          credentials: {
            id: 'user-123',
          },
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ditemukan');
    });

    it('should response 404 when threadId not found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({ id: 'thread-321' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-321' });

      const requestPayload = {
        content: 'sebuah reply',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
        auth: {
          strategy: 'forum_jwt',
          credentials: {
            id: 'user-123',
          },
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const requestPayload = {};

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
        auth: {
          strategy: 'forum_jwt',
          credentials: {
            id: 'user-123',
          },
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat menambahkan reply baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const requestPayload = {
        content: ['sebuah reply'],
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
        auth: {
          strategy: 'forum_jwt',
          credentials: {
            id: 'user-123',
          },
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat menambahkan reply baru karena tipe data tidak sesuai');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should show all comments and replies then sort them correctly when thread has comments', async () => {
      // Arrange
      const threadId = 'thread-123';
      const threadPayload = {
        title: 'sebuah thread',
        body: 'halo dunia! ',
      };

      /* add thread */
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        owner: 'user-123',
        ...threadPayload,
      });

      /* add comments */
      const firstComment = {
        id: 'comment-111',
        date: new Date().toISOString(),
        content: 'comment pertama',
      };
      const secondComment = {
        id: 'comment-222',
        date: new Date().toISOString(),
        content: 'comment kedua',
      };
      await UsersTableTestHelper.addUser({ id: 'user-1', username: 'john' });
      await UsersTableTestHelper.addUser({ id: 'user-2', username: 'jane' });
      await CommentsTableTestHelper.addComment({
        ...firstComment,
        threadId,
        owner: 'user-1',
      });
      await CommentsTableTestHelper.addComment({
        ...secondComment,
        threadId,
        owner: 'user-2',
      });

      /* add replies */
      const firstCommentFirstReply = {
        id: 'reply-11',
        date: new Date().toISOString(),
        content: 'reply pertama comment pertama',
      };
      const firstCommentSecondReply = {
        id: 'reply-12',
        date: new Date().toISOString(),
        content: 'reply pertama comment pertama',
      };
      await RepliesTableTestHelper.addReply({
        ...firstCommentFirstReply,
        owner: 'user-2',
        commentId: 'comment-111',
      });
      await RepliesTableTestHelper.addReply({
        ...firstCommentSecondReply,
        owner: 'user-2',
        commentId: 'comment-111',
      });

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread.id).toBeDefined();
      expect(responseJson.data.thread.comments).toHaveLength(2);
      expect(responseJson.data.thread.comments[0].replies).toHaveLength(2);
    });
  });
});
