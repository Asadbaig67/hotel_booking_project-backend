const express = require('express');
const Router = express.Router();



const Hotel = require('../models/Hotel');

Router.post('/addhotel', async (req, res) => {

    try {

        let hotel_obj = {}
        if (req.body.name && req.body.title && req.body.rating && req.body.description && req.body.photos && req.body.city && req.body.country && req.body.area) {
            hotel_obj.name = req.body.name;
            hotel_obj.title = req.body.title;
            hotel_obj.rating = req.body.rating;
            hotel_obj.description = req.body.description;
            hotel_obj.photos = req.body.photos;
            hotel_obj.city = req.body.city;
            hotel_obj.country = req.body.country;
            hotel_obj.area = req.body.area;

        }
        else {
            return res.status(422).json({ error: "All fields are required! " });
        }

        //
        const exists = await Hotel.findOne({ name: hotel_obj.name, city: hotel_obj.city, area: hotel_obj.area });
        if (exists) {
            return res.status(422).json({ error: "Hotel already exists" });
        }

        const new_hotel = new Hotel(hotel_obj);

        const result = await new_hotel.save();
        if (result) {
            res.status(201).json({ message: "Hotel Added Successfully" });
        }
        else {
            res.status(500).json({ message: "Hotel Cannot be Added" });
        }


    } catch (error) {
        console.log(error)
    }

});
Router.get('/getallhotels', async (req, res) => {
    let result = await Hotel.find();
    res.send(result);
})
Router.get('/gethotel/:city', async (req, res) => {
    let city = req.params.city;
    let result = await Hotel.find({ city });
    res.send(result);
})



module.exports = Router;