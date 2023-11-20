class GetThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);
    const replies = await this._replyRepository.getRepliesByThreadId(threadId);

    thread.comments = [];

    comments.forEach((comment, index) => {
      comments[index].replies = [];

      replies.forEach((reply) => {
        if (reply.comment_id === comment.id) {
          comments[index].replies.push({
            id: reply.id,
            username: reply.username,
            content: !reply.is_delete ? reply.content : '**balasan telah dihapus**',
            date: reply.date_created,
          });
        }
      });

      thread.comments.push({
        id: comment.id,
        username: comment.username,
        date: comment.date_created,
        content: !comment.is_delete ? comment.content : '**komentar telah dihapus**',
        replies: comments[index].replies,
      });
    });

    return thread;
  }
}

module.exports = GetThreadUseCase;
