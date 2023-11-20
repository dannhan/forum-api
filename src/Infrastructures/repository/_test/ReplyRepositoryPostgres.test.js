const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('addReply function', () => {
    it('should persist add reply', async () => {
      // Arrange
      const addReply = new AddReply({
        content: 'hi mom!',
        owner: 'user-123',
        commentId: 'comment-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });

      // Action
      await replyRepositoryPostgres.addReply(addReply);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
    });

    it('should return added reply correctly', async () => {
      // Arrange
      const addReply = new AddReply({
        content: 'hi mom!',
        owner: 'user-123',
        commentId: 'comment-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });

      // Action
      const addedRepository = await replyRepositoryPostgres.addReply(addReply);

      // Assert
      expect(addedRepository.id).toEqual('reply-123');
      expect(addedRepository.content).toEqual(addedRepository.content);
      expect(addedRepository.owner).toEqual(addedRepository.owner);
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw NotFoundError when owner not found', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner('replies-123', 'user-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should throw AuthorizationError when reply owner is not match', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', owner: 'user-123' });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // await UsersTableTestHelper.addUser({ id: 'user-321' });
      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-321'))
        .rejects
        .toThrowError(AuthorizationError);
    });

    it('should not throw error when comment is valid', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', owner: 'user-123' });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-123'))
        .resolves
        .not
        .toThrowError(AuthorizationError);
    });
  });

  describe('deleteReplyById function', () => {
    it('should update is_delete column true', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});
      await RepliesTableTestHelper.addReply({ id: 'reply-123' });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await replyRepositoryPostgres.deleteReplyById('reply-123');

      // Assert
      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(replies[0].is_delete).toEqual(true);
    });
  });

  describe('getRepliesByThreadId function', () => {
    it('should return empty array when thread not found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({});

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByThreadId('thread-123');

      // Assert
      expect(replies).toBeDefined();
      expect(replies).toHaveLength(0);
    });

    it('should return replies correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'john' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });

      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'first reply',
        owner: 'user-123',
        commentId: 'comment-123',
        date: new Date().toISOString(),
      });

      await CommentsTableTestHelper.addComment({ id: 'comment-456' });

      await RepliesTableTestHelper.addReply({
        id: 'reply-456',
        content: 'second reply',
        owner: 'user-123',
        commentId: 'comment-456',
        isDelete: true,
        date: new Date().toISOString(),
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByThreadId('thread-123');

      // Assert
      expect(replies).toBeDefined();
      expect(replies).toHaveLength(2);
      expect(replies[0].id).toEqual('reply-123');
      expect(replies[0].username).toEqual('john');
      expect(replies[0].content).toEqual('first reply');
      expect(replies[0].is_delete).toEqual(false);
      expect(replies[0].date_created).toBeDefined();
      expect(replies[1].id).toEqual('reply-456');
      expect(replies[1].username).toEqual('john');
      expect(replies[1].content).toEqual('second reply');
      expect(replies[1].is_delete).toEqual(true);
      expect(replies[1].date_created).toBeDefined();
    });
  });
});
