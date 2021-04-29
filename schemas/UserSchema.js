const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
      default: '/images/profilePic.jpeg',
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PostSchema' }],
    retweets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PostSchema' }],
  },
  { timestamps: true }
);

var User = mongoose.model('UserSchema', userSchema);

module.exports = User;
