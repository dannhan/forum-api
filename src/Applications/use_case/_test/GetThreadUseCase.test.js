const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const GetThreadUseCase = require('../GetThreadUseCase');

describe('GetThreadUseCase', () => {
  it('should orchestrating the get thread by id action correctly', async () => {
    // Arrange
    const useCasePayload = 'thread-123';

    const expectedThread = {
      id: 'thread-123',
      title: 'a thread',
      body: 'a thread body',
      date: '2021-08-08T07:22:33.555Z',
      username: 'john',
    };

    const expectedComments = [
      {
        id: 'comment-123',
        username: 'john',
        date_created: '2021-08-08T07:22:33.555Z',
        content: 'a comment',
        is_delete: false,
      },
      {
        id: 'comment-456',
        username: 'john',
        date_created: '2021-08-08T07:22:33.555Z',
        content: 'another comment',
        is_delete: false,
      },
    ];

    const ecpectedReplies = [
      {
        id: 'reply-123',
        username: 'john',
        date_created: '2021-08-08T07:22:33.555Z',
        content: 'a reply',
        comment_id: 'comment-123',
        is_delete: true,
      },
      {
        id: 'reply-456',
        username: 'john',
        date_created: '2021-08-08T07:22:33.555Z',
        content: 'another reply',
        comment_id: 'comment-123',
        is_delete: false,
      },
    ];

    const expectedResult = {
      id: 'thread-123',
      title: 'a thread',
      body: 'a thread body',
      username: 'john',
      date: '2021-08-08T07:22:33.555Z',
      comments: [
        {
          id: 'comment-123',
          username: 'john',
          date: '2021-08-08T07:22:33.555Z',
          content: 'a comment',
          replies: [
            {
              id: 'reply-123',
              username: 'john',
              date: '2021-08-08T07:22:33.555Z',
              content: '**balasan telah dihapus**',
            },
            {
              id: 'reply-456',
              username: 'john',
              date: '2021-08-08T07:22:33.555Z',
              content: 'another reply',
            },
          ],
        },
        {
          id: 'comment-456',
          username: 'john',
          date: '2021-08-08T07:22:33.555Z',
          content: 'another comment',
          replies: [],
        },
      ],
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedComments));
    mockReplyRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(ecpectedReplies));

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const result = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(result).toStrictEqual(expectedResult);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(useCasePayload);
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith(useCasePayload);
  });
});
