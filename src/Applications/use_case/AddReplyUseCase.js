const AddReply = require('../../Domains/replies/entities/AddReply');

class AddReplyUseCase {
  constructor({
    commentRepository,
    replyRepository,
  }) {
    this._commmentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(payload, commentId) {
    await this._commmentRepository.verifyCommentExists(commentId);

    const addReply = new AddReply({ ...payload, commentId });
    return this._replyRepository.addReply(addReply);
  }
}

module.exports = AddReplyUseCase;
