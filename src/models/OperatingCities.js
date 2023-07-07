import mongoose from "mongoose";

const OperatingCitiesSchema = new mongoose.Schema({
  city: {
    type: String,
  },
  hotel: {
    type: Boolean,
    default: false,
  },
  parking: {
    type: Boolean,
    default: false,
  },
  hotelAndParking: {
    type: Boolean,
    default: false,
  },
});

const OperatingCities = mongoose.model(
  "OperatingCities",
  OperatingCitiesSchema
);
export default OperatingCities;
