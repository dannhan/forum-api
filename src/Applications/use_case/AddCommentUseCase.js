const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({
    threadRepository,
    commentRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(threadId, payload) {
    await this._threadRepository.verifyThreadExists(threadId);

    const addComment = new AddComment(payload);
    return this._commentRepository.addComment(addComment);
  }
}

module.exports = AddCommentUseCase;
