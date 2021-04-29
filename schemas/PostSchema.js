const mongoose = require('mongoose');

const postSchema = mongoose.Schema(
  {
    content: { type: String },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'UserSchema' },
    pinned: { type: Boolean, default: false },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserSchema' }],
    retweetUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserSchema' }],
    retweetData: { type: mongoose.Schema.Types.ObjectId, ref: 'PostSchema' },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'PostSchema' },
  },
  { timestamps: true }
);

var Post = mongoose.model('PostSchema', postSchema);

module.exports = Post;
