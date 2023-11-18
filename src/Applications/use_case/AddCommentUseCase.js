const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({
    threadRepository,
    commentRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(payload, threadId) {
    await this._threadRepository.verifyThreadExists(threadId);

    const addComment = new AddComment({ ...payload, threadId });
    return this._commentRepository.addComment(addComment);
  }
}

module.exports = AddCommentUseCase;
