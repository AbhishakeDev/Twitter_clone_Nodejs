const express = require('express');
const middleware = require('./middleware.js');
const app = express();
const path = require('path');
const session = require('express-session');
const connect = require('./database.js');

connect();
//using template engine pug
app.set('view engine', 'pug');
app.set('views', 'views');

//using sessions

/* Once you mount a router onto an Express app, any subsequently declared middleware on that app won't get called for any requests that target the router.

So if you have this:

app.use(router)
app.use(session(...));
The session middleware won't get called for any requests that get handled by router (even if you declare the routes that the router should handle at some later point). For that, you need to change the order:

app.use(session(...));
app.use(router);
An additional issue is that you're exporting router, which should probably be app (which is the instance that "holds" all the middleware, routers, etc): */

app.use(
  session({
    secret: 'bbq chips',
    resave: false,
    saveUninitialized: true,
  })
);

app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, './public')));

app.get('/', middleware.requireLogin, (req, res, next) => {
  //  res.status(200).send('Hello World');
  //using home.pug file for rendering

  var payload = {
    pageTitle: 'Home',
    userLoggedIn: req.session.user,
    //so that the main layout has access to the user data
    userLoggedInJs: JSON.stringify(req.session.user),
  };
  //payload is sent to render something dynamically using pug
  res.status(200).render('home', payload);
});

// Page Handler Routes

const loginRoute = require('./routes/loginRoutes.js');
app.use('/login', loginRoute);

const postRoute = require('./routes/postRoutes.js');
app.use('/posts', postRoute);

const registerRoute = require('./routes/registerRoutes.js');
app.use('/register', registerRoute);

const logout = require('./routes/logout');
app.use('/logout', logout);

//Api Routes

const postsApiRoute = require('./routes/api/posts.js');
app.use('/api/posts', postsApiRoute);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
