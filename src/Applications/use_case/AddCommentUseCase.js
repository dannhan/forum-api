const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { content, owner, threadId } = useCasePayload;

    await this._threadRepository.verifyThreadExists(threadId);
    const addComment = new AddComment({ content, owner, threadId });
    return this._commentRepository.addComment(addComment);
  }
}

module.exports = AddCommentUseCase;
