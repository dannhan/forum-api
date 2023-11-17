/* eslint-disable class-methods-use-this */

class AddComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const { content, owner } = payload;

    this.content = content;
    this.owner = owner;
  }

  _verifyPayload({ content, owner }) {
    if (!content || !owner) {
      throw new Error('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof content !== 'string' || typeof owner !== 'string') {
      throw new Error('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddComment;
