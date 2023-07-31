import Parking from "../models/Parking.js";
import User from "../models/user.js";
import UnverifiedUsers from "../models/UnverifiedUsers.js";
import { fileURLToPath } from "url";
import path from "path";
import { createNotificationProperty } from "../Functions/Notification/createNotification.js";
import fs from "fs";
import { SendEmail } from "../Functions/Emails/SendEmail.js";
import { getData } from "../Functions/ChartData/GetData.js";
// Add Parking Function
export const addParking = async (req, res) => {
  try {
    const {
      ownerId,
      email,
      name,
      title,
      total_slots,
      description,
      booked_slots,
      city,
      country,
      address,
      price,
      facilities,
      rating,
    } = req.body;

    if (
      !name ||
      !title ||
      !total_slots ||
      !description ||
      !booked_slots ||
      !city ||
      !country ||
      !address ||
      !price ||
      !facilities ||
      !rating
    ) {
      return res.status(500).json({ error: "All fields are required! " });
    }

    const exists = await Parking.findOne({
      $and: [{ name }, { city }],
    });
    if (exists) {
      return res.status(422).json({ error: "Parking already exists" });
    }

    // Images Handling Code
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: "No files were uploaded." });
    }
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const hotelsLocation = path.join(
      __dirname,
      "..",
      "uploads",
      "ParkingImages"
    );

    const files = Object.values(req.files).flat();
    const fileNames = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = file.name.replace(/\s+/g, "");
      fileNames.push(fileName);
      const filePath = path.join(hotelsLocation, fileName);
      // const filePath = path.join(hotelsLocation, `${Date.now()}_${fileName}`);
      await file.mv(filePath);
    }

    const baseUrl = "http://localhost:5000";
    const photos = fileNames.map(
      (fileName) => `${baseUrl}/uploads/ParkingImages/${fileName}`
    );
    // Images Handling Code End

    const new_parking = new Parking({
      ...(ownerId && { ownerId }),
      name,
      title,
      total_slots,
      booked_slots,
      description,
      price,
      city,
      country,
      rating,
      address,
      ...(ownerId ? { ownerAvailablity: true } : { ownerAvailablity: false }),
      photos,
      Facilities: facilities,
    });

    const result = await new_parking.save();
    if (email) {

      const newUser = new UnverifiedUsers({
        email: email,
        property_type: "Parking",
        property_id: new_parking._id,
      });
      await newUser.save();
    }
    if (result) {
      // createNotificationProperty(
      //   "Parking",
      //   "Parking added",
      //   `Your new parking ${result.name} is added`,
      //   Date.now(),
      //   ownerId
      // );
      // (await User.find({ account_type: "admin" })).forEach((user) => {
      //   createNotificationProperty(
      //     "Parking",
      //     "parking added",
      //     `new parking ${result.name} is added and waiting for approval`,
      //     Date.now(),
      //     user._id
      //   );
      // });

      if (email) {
        await SendEmail({
          email: email,
          subject: "Parking Added",
          message:
            "Your Parking Added has been added successfully. Thank you for choosing Desalis Hotels. We will review your Parking and get back to you as soon as possible. ",
        });
      } else {
        const Owner = await User.findById(ownerId);

        // Send Email
        await SendEmail({
          name: Owner.firstName + " " + Owner.lastName,
          email: Owner.email,
          subject: "Parking Added",
          message:
            "Your Parking Added has been added successfully. Thank you for choosing Desalis Hotels. We will review your Parking and get back to you as soon as possible. ",
        });
      }

      res.status(200).json({ message: "Parking Added Successfully" });
    } else {
      res.status(500).json({ message: "Parking Cannot be Added" });
    }
  } catch (error) {
    console.log(error);
  }
};

// Get All Parking Records Function
export const getAllParking = async (req, res) => {
  let result = await Parking.find();
  try {
    const response = result.filter(
      (item) =>
        item.approved === true &&
        item.ownerAvailablity === true &&
        item.deList === false
    );
    if (!response)
      return res.status(404).json({ message: "Parking Not Found" });
    res.status(200).json(response);
  } catch (error) {
    res.json(error);
  }
};

// Get Pending Parking Records Function
export const getPendingParking = async (req, res) => {
  let result = await Parking.find();
  try {
    const response = result.filter(
      (item) =>
        item.approved === false &&
        item.ownerAvailablity === true &&
        item.deList === false
    );
    if (!response)
      return res.status(404).json({ message: "Parking Not Found" });
    res.status(200).json(response);
  } catch (error) {
    res.json(error);
  }
};

// Get Parking By City Function
export const getParkingByCity = async (req, res) => {
  let city = req.params.city;
  try {
    let result = await Parking.find({ city });
    const response = result.filter(
      (item) =>
        item.approved === true &&
        item.ownerAvailablity === true &&
        item.deList === false
    );
    if (!response)
      return res.status(404).json({ message: "Parking Not Found" });
    res.send(response);
  } catch (error) { }
};

// Get Parking By Id Function
export const getParkingById = async (req, res) => {
  let id = req.params.id;
  try {
    let data = await Parking.findById(id);
    // const response = parking.approved === true ? parking : null;
    if (!data) return res.status(404).json({ message: "Parking Not Found" });
    res.status(200).json(data);
  } catch (error) {
    res.json(error);
  }
};

// Get Parking By Owner Id Function
export const getParkingByOwnerId = async (req, res) => {
  let ownerId = req.params.id;
  try {
    const result = await Parking.find({ ownerId });
    const data = result.filter((item) => item.deList === false);
    if (!data) return res.status(404).json({ message: "Parking Not Found" });
    res.status(200).json(data);
  } catch (error) {
    res.json(error);
  }
};

//Get approved parking by owner id
export const getApprovedParkingByOwnerId = async (req, res) => {
  let ownerId = req.params.id;
  try {
    const data = await Parking.find({ ownerId });
    const response = data.filter(
      (item) =>
        item.approved === true &&
        item.ownerAvailablity === true &&
        item.deList === false
    );
    if (!response)
      return res.status(404).json({ message: "Parking Not Found" });
    res.status(200).json(response);
  } catch (error) {
    res.json(error);
  }
};

//Get pending parking by owner id
export const getUnapprovedParkingByOwnerId = async (req, res) => {
  let ownerId = req.params.id;
  try {
    const data = await Parking.find({ ownerId });
    const response = data.filter(
      (item) =>
        item.approved === false &&
        item.ownerAvailablity === true &&
        item.deList === false
    );
    if (!response)
      return res.status(404).json({ message: "Parking Not Found" });
    res.status(200).json(response);
  } catch (error) {
    res.json(error);
  }
};

// Get Parking By Search Function
export const getParkingBySearch = async (req, res) => {
  let city = req.query.city;
  // let dates = [req.query.checkIn, req.query.checkOut];
  let vehicles = req.query.vehicles;
  let parkingData = [];

  try {
    let parkings = await Parking.find({ city });
    parkings.map((parking, i) => {
      parkingData[i] = {};
      parkingData[i].parking = parking;
      parkingData[i].availableSlots =
        parking.total_slots - parking.booked_slots;
      if (parkingData[i].availableSlots >= vehicles) {
        parkingData[i].available = true;
      } else {
        parkingData[i].available = false;
      }
    });
    parkingData = parkingData.filter(
      (parking) =>
        parking.available === true && parking.parking.approved === true
    );
    parkingData = parkingData.filter(
      (parking) =>
        parking.parking.approved === true &&
        parking.parking.ownerAvailablity === true &&
        parking.parking.deList === false
    );
    if (parkingData.length === 0) {
      return res
        .status(401)
        .json({ parkingList: { message: "Parking Not Found" } });
    }

    res.status(200).json({ parkingList: parkingData });
  } catch (error) {
    console.log(error);
  }
};

// Get Chart Data For Parking Function
export const getChartDataForParking = async (req, res) => {
  try {
    const result = await Parking.find({
      approved: true,
      ownerAvailablity: true,
      deList: false,
    });
    // if (!result) {
    //   return res.status(404).json({ message: "No hotels found" });
    // }
    const data = getData(result);
    res.send(data);
  } catch (error) {
    console.log(error);
  }
};

// Get delisted parking by owner id
export const getDelistedParkingByOwnerId = async (req, res) => {
  let ownerId = req.params.id;
  try {
    const data = await Parking.find({ ownerId });
    const response = data.filter((item) => item.deList === true);
    if (!response)
      return res.status(404).json({ message: "Parking Not Found" });
    res.status(200).json(response);
  } catch (error) {
    res.json(error);
  }
};

// Get delisted parking function
export const getAllDelistedParking = async (req, res) => {
  try {
    const data = await Parking.find({ deList: true });
    if (!data) return res.status(404).json({ message: "Parking Not Found" });
    res.status(200).json(data);
  } catch (error) {
    res.json(error);
  }
};

// Add Parking to the list Function
export const addParkingToList = async (req, res) => {
  const { id, account_type } = req.body;
  try {
    if (!id || !account_type)
      return res.status(400).json({ message: "Invalid Request" });
    const result = await Parking.findById(id);
    if (!result) return res.status(404).json({ message: "Parking Not Found" });
    if (result.deList === false)
      return res.status(400).json({ message: "Parking Already Delisted" });
    if (account_type === "admin") {
      result.deList = false;
      result.approved = true;
      await result.save();
      return res
        .status(200)
        .json({ message: "Parking Added To List Successfully" });
    } else if (account_type === "partner") {
      result.deList = false;
      await result.save();
      return res
        .status(200)
        .json({ message: "Parking Added To List Successfully" });
    }
  } catch (error) {
    res.json(error);
  }
};
// Update Parking Function
export const updateParking = async (req, res) => {
  try {
    const result = await Parking.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );
    if (result) {
      createNotificationProperty(
        "Parking",
        "Parking updated",
        `Your parking ${result.name} updated successfully`,
        Date.now(),
        result.ownerId
      );
      (await User.find({ account_type: "admin" })).forEach((user) => {
        createNotificationProperty(
          "Parking",
          "parking updated",
          `A parking ${result.name} is updated`,
          Date.now(),
          user._id
        );
      });
      res.status(200).json({ message: "Parking Updated Successfully" });
    } else {
      res.status(404).json({ message: "Parking Not Found" });
    }
  } catch (error) {
    console.log(error);
  }
};

// Update Parking New
export const UpdateParkingNew = async (req, res) => {
  try {
    let photos = [];

    if (req.files && Object.keys(req.files).length !== 0) {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const hotelsLocation = path.join(
        __dirname,
        "..",
        "uploads",
        "ParkingImages"
      );

      const files = Object.values(req.files).flat();
      const fileNames = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = file.name.replace(/\s+/g, "");
        fileNames.push(fileName);
        const filePath = path.join(hotelsLocation, fileName);
        // const filePath = path.join(hotelsLocation, `${Date.now()}_${fileName}`);
        await file.mv(filePath);
      }

      const baseUrl = "http://localhost:5000";
      photos = fileNames.map(
        (fileName) => `${baseUrl}/uploads/ParkingImages/${fileName}`
      );
    }

    const {
      name,
      title,
      total_slots,
      description,
      booked_slots,
      city,
      country,
      address,
      price,
      rating,
      facilities,
    } = req.body;

    if (
      !name ||
      !title ||
      !total_slots ||
      !description ||
      !booked_slots ||
      !city ||
      !country ||
      !rating ||
      !address ||
      !price ||
      !facilities
    ) {
      return res.status(422).json({ error: "All fields are required! " });
    }

    const Updated_parking = await Parking.findByIdAndUpdate(
      req.params.id,
      {
        name,
        title,
        total_slots,
        booked_slots,
        description,
        price,
        rating,
        city,
        country,
        address,
        ...(photos.length > 0 && { $push: { photos: { $each: photos } } }),
        $addToSet: { Facilities: { $each: facilities } },
      },
      { new: true }
    );

    // const result = await Updated_parking.save();
    if (Updated_parking) {
      createNotificationProperty(
        "Parking",
        "Parking updated",
        `Your parking ${Updated_parking.name} updated successfully`,
        Date.now(),
        result.ownerId
      );
      (await User.find({ account_type: "admin" })).forEach((user) => {
        createNotificationProperty(
          "Parking",
          "parking updated",
          `A parking ${Updated_parking.name} is updated`,
          Date.now(),
          user._id
        );
      });
      res.status(200).json({ message: "Parking Added Successfully" });
    } else {
      res.status(500).json({ message: "Parking Cannot be Added" });
    }
  } catch (error) {
    console.log(error);
  }
};

// Update Parking Booked Slots Function
export const updateParkingBookedSlots = async (req, res) => {
  try {
    const parking = await Parking.findOne({ _id: req.params.id });
    if (parking) {
      if (parking.booked_slots >= parking.total_slots) {
        return res.status(422).json({ error: "Parking is full" });
      }
    }

    const result = await Parking.findOneAndUpdate(
      { _id: req.params.id },
      { $inc: { booked_slots: 1 } },
      { new: true }
    );
    if (result) {
      createNotificationProperty(
        "Parking",
        "Parking slots incremented",
        `Slots of your parking ${result.name} is incremented to ${result.booked_slots}`,
        Date.now(),
        result.ownerId
      );
      (await User.find({ account_type: "admin" })).forEach((user) => {
        createNotificationProperty(
          "Parking",
          "Parking slots incremented",
          `Slots of parking ${result.name} is incremented to ${result.booked_slots}`,
          Date.now(),
          user._id
        );
      });
      res.status(200).json({ message: "Parking Updated Successfully" });
    } else {
      res.status(404).json({ message: "Parking Not Found" });
    }
  } catch (error) {
    console.log(error);
  }
};

// Update Parking Approved Function
export const approveParking = async (req, res) => {
  const data = await Parking.findById(req.params.id);
  try {
    if (!data) return res.status(404).json({ message: "Parking Not Found" });
    if (data.approved)
      return res.status(422).json({ message: "Parking Already Approved" });

    const currentDate = new Date();

    const result = await Parking.findOneAndUpdate(
      { _id: req.params.id },
      { approved: true, createdAt: currentDate },
      { new: true }
    );

    if (result) {
      const { ownerId } = data;
      if (!ownerId) {
        await Parking.findByIdAndUpdate(
          req.params.id,
          { approved: false },
          { new: true }
        );
        return res.status(404).json({ message: "Owner Not Found" });
      }
      const user = await User.findById(ownerId);
      if (!user) return res.status(404).json({ message: "User Not Found" });
      user.partner_type = "Parking";
      user.account_type = "partner";
      await user.save();
    }
    if (result) {
      createNotificationProperty(
        "Parking",
        "Parking approved",
        `Your parking ${result.name} is approved`,
        Date.now(),
        data.ownerId
      );
      (await User.find({ account_type: "admin" })).forEach((user) => {
        createNotificationProperty(
          "Parking",
          "Parking approved",
          `Parking ${result.name} is approved`,
          Date.now(),
          user._id
        );
      });
      res.status(200).json({ message: "Parking Updated Successfully" });
    } else {
      res.status(404).json({ message: "Parking Not Found" });
    }
  } catch (error) {
    console.log(error);
  }
};

// Update Parking Unapproved Function and update rating
export const approveParkingAndUpdateRating = async (req, res) => {
  const data = await Parking.findById(req.params.id);
  try {
    if (!data) return res.status(404).json({ message: "Parking Not Found" });
    if (data.approved)
      return res.status(422).json({ message: "Parking Already Approved" });

    const result = await Parking.findOneAndUpdate(
      { _id: req.params.id },
      { approved: true, rating: req.body.rating, createdAt: Date.now() },
      { new: true }
    );

    if (result) {
      const { ownerId } = data;
      if (!ownerId) {
        await Parking.findByIdAndUpdate(
          req.params.id,
          { approved: false },
          { new: true }
        );
        return res.status(404).json({ message: "Owner Not Found" });
      }
      const user = await User.findById(ownerId);
      if (!user) return res.status(404).json({ message: "User Not Found" });
      user.partner_type = "Parking";
      user.account_type = "partner";
      await user.save();
    }
    if (result) {
      createNotificationProperty(
        "Parking",
        "Parking approved",
        `Your parking ${result.name} is approved and rating is ${result.rating}`,
        Date.now(),
        data.ownerId
      );
      (await User.find({ account_type: "admin" })).forEach((user) => {
        createNotificationProperty(
          "Parking",
          "Parking approved",
          `Parking ${result.name} is approved and rating is ${result.rating}`,
          Date.now(),
          user._id
        );
      });
      res.status(200).json({ message: "Parking Updated Successfully" });
    } else {
      res.status(404).json({ message: "Parking Not Found" });
    }
  } catch (error) {
    console.log(error);
  }
};

// Delete Parking Function
export const deleteParking = async (req, res) => {
  try {
    const result = await Parking.findById(req.params.id);
    if (result) {
      result.deList = true;
      await result.save();
      // createNotificationProperty(
      //   "Parking",
      //   "Parking deleted",
      //   `Your parking ${result.name} deleted`,
      //   Date.now(),
      //   result.ownerId
      // );
      // (await User.find({ account_type: "admin" })).forEach((user) => {
      //   createNotificationProperty(
      //     "Parking",
      //     "parking added",
      //     `A Your parking ${result.name} deleted`,
      //     Date.now(),
      //     user._id
      //   );
      // });
      res.status(200).json({ message: "Parking Deleted Successfully" });
    } else {
      res.status(404).json({ message: "Parking Not Found" });
    }
  } catch (error) {
    console.log(error);
  }
};

// Delete  Parking  Images
export const deleteParkingImages = async (req, res) => {
  const { link } = req.body;
  const parking = await Parking.findById(req.params.id);

  // Remove Image from database
  const newPhotos = parking.photos.filter((imglink) => imglink !== link);
  parking.photos = newPhotos;
  await parking.save();

  // Remove Image from Disk Storage
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const linkarray = link.split("/");
  // Delete Image from location
  const filename = linkarray[linkarray.length - 1];
  const filePath = path.join(__dirname, "../uploads/HotelImages", filename);
  // Check if the file exists
  if (fs.existsSync(filePath)) {
    // Delete the file
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to delete file." });
      }

      // File deletion successful
      return res.status(200).json({ message: "File deleted successfully." });
    });
  } else {
    return res.status(404).json({ error: "File not found." });
  }
};

// get parking names by owner id
export const getParkingNamesByOwnerId = async (req, res) => {
  const ownerId = req.params.id;
  try {
    const parkings = await Parking.find({ ownerId: ownerId });
    if (!parkings) {
      return res.status(400).json({ msg: "No Hotels Found" });
    }
    return res.status(200).json({ parkings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Availabke Slots By ParkingId
export const getAvailableSlotsByParkingId = async (req, res) => {
  const parkingId = req.params.id;
  try {
    const parking = await Parking.findById(parkingId);
    if (!parking) {
      return res.status(400).json({ msg: "No Parking Found" });
    }
    const availableSlots = parking.total_slots - parking.booked_slots;
    return res.status(200).json({ availableSlots });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
