const mongoose = require('mongoose');
const db = process.env.DATABASE;

const Connection = async () => {

    // try {
    //     const database = await mongoose.connect(db, { useNewUrlParser: true }, () => {
    //         console.log("Connection To Database Successful");
    //     });
    // } catch (error) {
    //     console.log("Connection To Database Failed");
    // }

    mongoose.connect(process.env.DATABASE).then(() => {
        console.log("Connection To Database Successful")
    }).catch(err => console.log("Connection To Database Failed " + err));
}

module.exports = Connection;