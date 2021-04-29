const express = require('express');
const router = express.Router();
const User = require('../../schemas/UserSchema.js');
const Post = require('../../schemas/PostSchema.js');

//here when we are getting the post we are populating the user and the tweet content of the tweets whicha re retweeted because retweets do not have any content of their own byut have the id or the original tweet so we need to populate the retwwet with the original tweet content so that it can be displayed and also user is populated so that we can see which user had created the tweets
router.get('/', async (req, res, next) => {
  // Post.find({})
  //   .populate('postedBy')
  //   .populate('retweetData')
  //   .sort({ createdAt: -1 })
  //   .then(async (results) => {
  //     results = await User.populate(results, { path: 'retweetData.postedBy' });
  //     res.status(200).send(results);
  //   })
  //   .catch((err) => console.log(err));

  var results = await getPosts({});
  res.status(200).send(results);
});

router.get('/:id', async (req, res, next) => {
  var postId = req.params.id;
  var results = await getPosts({ _id: postId });
  results = results[0];
  // console.log(results);
  res.status(200).send(results);
});

router.post('/', async (req, res, next) => {
  const { content } = req.body;

  if (!content) {
    console.log('Content param missing with request');
    res.sendStatus(400);
    return;
  }

  var postData = {
    content,
    postedBy: req.session.user,
  };

  if (req.body.replyTo) {
    postData.replyTo = req.body.replyTo;
  }

  var newPost = await Post.create(postData);
  if (newPost) {
    newPost = await User.populate(newPost, {
      path: 'postedBy',
    });

    res.status(201).send(newPost);
  } else {
    console.log('something went wrong');
  }
});

router.put('/:id/like', async (req, res, next) => {
  var postId = req.params.id;
  var userId = req.session.user._id;

  // console.log(req.session.user);
  var isLiked =
    req.session.user?.likes && req.session.user?.likes.includes(postId);

  //checking if the user has already liked it or not and if yes then the click will result in removing the like

  var option = isLiked ? '$pull' : '$addToSet';

  //insert user like
  //this is how we are adding the postId of the posts which the user has liked to the likes array present in user schema
  //$addToSet only adds unique content to the array
  //updating the user from session so that the likes array in user is updated in session
  //{new:true} returns the newly updated user sothat we can replace the session user with the newly updated likes array in the user in session
  req.session.user = await User.findByIdAndUpdate(
    userId,
    {
      [option]: { likes: postId },
    },
    { new: true }
  ).catch((err) => {
    console.log(err);
    res.sendStatus(400);
  });

  //insert post like

  var post = await Post.findByIdAndUpdate(
    postId,
    {
      [option]: { likes: userId },
    },
    { new: true }
  ).catch((err) => {
    console.log(err);
    res.sendStatus(400);
  });
  res.status(200).send(post);
});

router.post('/:id/retweet', async (req, res, next) => {
  var postId = req.params.id;
  var userId = req.session.user._id;

  //Try and delete the retweet if it exists
  var deletedPost = await Post.findOneAndDelete({
    postedBy: userId,
    retweetData: postId,
  }).catch((err) => {
    console.log(err);
    res.sendStatus(400);
  });
  var option = deletedPost != null ? '$pull' : '$addToSet';

  var repost = deletedPost;

  if (repost == null) {
    repost = await Post.create({ postedBy: userId, retweetData: postId }).catch(
      (err) => {
        console.log(err);
        res.sendStatus(400);
      }
    );
  }
  //updating user
  req.session.user = await User.findByIdAndUpdate(
    userId,
    {
      [option]: { retweets: repost._id },
    },
    { new: true }
  ).catch((err) => {
    console.log(err);
    res.sendStatus(400);
  });

  //update post retweet users and data

  var post = await Post.findByIdAndUpdate(
    postId,
    {
      [option]: { retweetUsers: userId },
    },
    { new: true }
  ).catch((err) => {
    console.log(err);
    res.sendStatus(400);
  });
  res.status(200).send(post);
});

const getPosts = async (filter) => {
  var results = await Post.find(filter)
    .populate('postedBy')
    .populate('retweetData')
    .populate('replyTo')
    .sort({ createdAt: -1 })
    .catch((err) => console.log(err));

  //we have populated the replyTo but that has post data , we need user data who has posted the tweet and that is present inside replyTo.postedBy which we need to pouplate
  results = await User.populate(results, { path: 'replyTo.postedBy' });
  return await User.populate(results, { path: 'retweetData.postedBy' });
};

module.exports = router;
