/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */

class CreateThread {
  constructore(payload) {
    console.log(payload);
    this._verifyPayload(payload);

    const { title, body, owner } = payload;

    this.title = title;
    this.body = body;
    this.owner = owner;
  }

  _verifyPayload({ title, body, owner }) {
    if (!title || !body || !owner) {
      throw new Error('CREATE_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    // if (typeof title !== 'string' || typeof body !== 'string' || typeof owner !== 'string') {
    //   throw new Error('CREATE_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    // }
  }
}

module.exports = CreateThread;
