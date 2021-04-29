const express = require('express');
const app = express();
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../schemas/UserSchema.js');

app.use(
  express.urlencoded({
    extended: false,
  })
);

//using template engine pug
app.set('view engine', 'pug');
app.set('views', 'views');

router.get('/', (req, res, next) => {
  res.status(200).render('login');
});

router.post('/', async (req, res, next) => {
  var payload = req.body;
  if (req.body.logUsername && req.body.logPassword) {
    const user = await User.findOne({
      $or: [
        {
          username: req.body.logUsername,
        },
        {
          email: req.body.logPassword,
        },
      ],
    }).catch((err) => {
      console.log(err);
      payload.errorMessage = 'Something went wrong';
      res.status(200).render('login', payload);
    });
    if (user) {
      var result = await bcrypt.compare(req.body.logPassword, user.password);
      if (result) {
        req.session.user = user;
        return res.redirect('/');
      } else {
        payload.errorMessage = 'Password incorrect';
        res.status(200).render('login', payload);
      }
    } else {
      payload.errorMessage = "User does'nt exists";
      res.status(200).render('login', payload);
    }
  }
  payload.errorMessage = 'Make sure each field has values';
  return res.status(200).render('login', payload);
});

module.exports = router;
