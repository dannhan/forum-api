const AddReply = require('../../Domains/replies/entities/AddReply');

class AddReplyUseCase {
  constructor({
    threadRepository,
    commentRepository,
    replyRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commmentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(payload, commentId, threadId) {
    await this._threadRepository.verifyThreadExists(threadId);
    await this._commmentRepository.verifyCommentExists(commentId);

    const addReply = new AddReply({ ...payload, commentId });
    return this._replyRepository.addReply(addReply);
  }
}

module.exports = AddReplyUseCase;
