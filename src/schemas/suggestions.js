const { Schema, model } = require("mongoose");

const suggestionSchema = new Schema({
  guildId: { type: String, required: true },
  sugSystem: {
    channel: { type: String },
    suggestion: [
      {
        messageId: { type: String },
        authorId: { type: String },
        upVotes: { type: Number, default: 0 },
        downVotes: { type: Number, default: 0 },
        votes: [
          {
            voterId: { type: String },
            vote: { type: String },
          },
        ],
      },
    ],
  },
});

module.exports = model("suggestion", suggestionSchema);
