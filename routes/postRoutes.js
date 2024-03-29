const express = require('express');
const router = express.Router();

router.get('/:id', (req, res, next) => {
  var payload = {
    pageTitle: 'View post',
    userLoggedIn: req.session.user,
    //so that the main layout has access to the user data
    userLoggedInJs: JSON.stringify(req.session.user),
    postId: req.params.id,
  };

  res.status(200).render('postPage', payload);
});

module.exports = router;
