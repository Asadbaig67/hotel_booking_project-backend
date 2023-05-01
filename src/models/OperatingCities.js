import mongoose from "mongoose";

const OperatingCitiesSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    unique: true,
  },
  cities: [
    {
      city: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        // default: Date.now,
      },
    },
  ],
});

const OperatingCities = mongoose.model(
  "OperatingCities",
  OperatingCitiesSchema
);
export default OperatingCities;
