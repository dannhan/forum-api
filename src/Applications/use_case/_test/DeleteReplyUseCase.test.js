const DeleteReplyUseCase = require('../DeleteReplyUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

describe('DeleteReplyUseCase', () => {
  it('should orchestrating the delete reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      owner: 'user-123',
    };
    const commentId = 'comment-123';
    const replyId = 'reply-123';
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    // Mocking
    mockCommentRepository.verifyCommentExists = jest.fn(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwner = jest.fn(() => Promise.resolve());
    mockReplyRepository.deleteReplyById = jest.fn(() => Promise.resolve());

    const deleteReplyUseCase = new DeleteReplyUseCase({
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    await deleteReplyUseCase.execute(commentId, replyId, useCasePayload.owner);

    // Assert
    expect(mockCommentRepository.verifyCommentExists)
      .toHaveBeenCalledWith(commentId);
    expect(mockReplyRepository.verifyReplyOwner)
      .toHaveBeenCalledWith(replyId, useCasePayload.owner);
    expect(mockReplyRepository.deleteReplyById);
  });
});
