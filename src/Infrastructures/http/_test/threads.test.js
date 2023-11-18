const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const TokenTestHelper = require('../../../../tests/TokenTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and add new thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'sebuah thread',
        body: 'halo dunia! ',
      };

      const token = await TokenTestHelper.getAccessToken({ id: 'user-123' });

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread.id).toBeDefined();
      expect(responseJson.data.addedThread.owner).toBe('user-123');
      expect(responseJson.data.addedThread.title).toBe(requestPayload.title);
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'sebuah thread',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
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
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        title: ['sebuah thread'],
        body: 'halo dunia!',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
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
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and return thread', async () => {
      // Arrange
      const threadId = 'thread-123';
      const requestPayload = {
        title: 'sebuah thread',
        body: 'halo dunia! ',
      };

      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        ...requestPayload,
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
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-404',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should show all comments and sort correctly when thread has comments', async () => {
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
      const thirdComment = {
        id: 'comment-000',
        date: new Date().toISOString(),
        content: 'comment ketiga',
      };
      await UsersTableTestHelper.addUser({ id: 'user-1', username: 'john' });
      await UsersTableTestHelper.addUser({ id: 'user-2', username: 'jane' });
      await UsersTableTestHelper.addUser({ id: 'user-3', username: 'jonathan' });
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
      await CommentsTableTestHelper.addComment({
        ...thirdComment,
        threadId,
        owner: 'user-3',
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
      expect(responseJson.data.thread.comments).toHaveLength(3);
      responseJson.data.thread.comments.forEach((comment, index) => {
        expect(comment.id)
          .toBe([firstComment.id, secondComment.id, thirdComment.id][index]);
        expect(comment.date)
          .toBe([firstComment.date, secondComment.date, thirdComment.date][index]);
        expect(comment.content)
          .toBe([firstComment.content, secondComment.content, thirdComment.content][index]);
        expect(comment.username)
          .toBe(['john', 'jane', 'jonathan'][index]);
      });
    });

    it('should show specific content for deleted comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comments-123', threadId: 'thread-123', isDelete: true });

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-123',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread.comments[0].content).toEqual('**komentar telah dihapus**');
    });
  });
});
