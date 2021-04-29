const mongoose = require('mongoose');

function connect() {
    mongoose.connect('mongodb+srv://abhishekt:abhishekt@cluster0.adjgt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            console.log('Database Connnection Successful');
        })
        .catch((err) => {
            console.log('Database Connnection Error' + err);
        })
}

module.exports = connect;

