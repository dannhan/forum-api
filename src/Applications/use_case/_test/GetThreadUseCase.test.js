const GetThreadUseCase = require('../GetThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('GetThreadUseCase', () => {
  it('should orchestrating the get thread by id action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const expectedUseCaseResponse = {
      thread: {
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'sebuah body thread',
        date: '2021-08-08T07:19:09.775Z',
        username: 'dicoding',
        comments: [
          {
            id: 'comment-_pby2_tmXV6bcvcdev8xk',
            username: 'johndoe',
            date: '2021-08-08T07:22:33.555Z',
            content: 'sebuah comment',
          },
          {
            id: 'comment-yksuCoxM2s4MMrZJO-qVD',
            username: 'dicoding',
            date: '2021-08-08T07:26:21.338Z',
            content: '**komentar telah dihapus**',
          },
        ],
      },
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedUseCaseResponse));

    /** creating use case instance */
    const getThreadByIdUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const thread = await getThreadByIdUseCase.execute(threadId);

    // Assert
    expect(thread).toStrictEqual(expectedUseCaseResponse);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
  });
});
