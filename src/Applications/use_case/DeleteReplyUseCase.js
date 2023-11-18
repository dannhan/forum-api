class DeleteRepository {
  constructor({
    commentRepository,
    replyRepository,
  }) {
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(commentId, replyId, owner) {
    await this._commentRepository.verifyCommentExists(commentId);
    await this._replyRepository.verifyReplyOwner(replyId, owner);
    await this._replyRepository.deleteReplyById(replyId);
  }
}

module.exports = DeleteRepository;
