const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../schemas/UserSchema.js');

//using template engine pug
app.set("view engine", "pug");
app.set("views", "views");

app.use(express.urlencoded({ extended: false }));

router.get('/', (req, res, next) => {
    res.status(200).render("register");
})

router.post('/', async (req, res, next) => {
    // console.log(req.body);
    var firstName = req.body.firstName.trim();
    var lasttName = req.body.lastName.trim();
    var username = req.body.username.trim();
    var email = req.body.email.trim();
    var password = req.body.password;

    var payload = req.body;

    if (firstName && lasttName && username && email && password) {
        const user = await User.findOne({
            $or: [
                { username },
                { email }
            ]
        })
            .catch(err => {
                console.log(err);
                payload.errorMessage = "Something went wrong"
                res.status(200).render('login', payload)
            })
        if (!user) {
            //no user found
            var data = req.body;

            data.password = await bcrypt.hash(password, 12);

            const savedUser = await User.create(data);

            req.session.user = savedUser;
            return res.redirect('/');

        }
        else {
            //User found

            if (email === user.email) {
                payload.errorMessage = "Email already in use";
            } else {
                payload.errorMessage = "Username already in use";
            }
            res.status(400).render("register", payload);
        }

    } else {
        payload.errorMessage = "Make sure each field has valid value.";
        res.status(200).render("register", payload);
    }
})

module.exports = router;
