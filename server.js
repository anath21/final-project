const express = require("express");
const app = express();
const Joi = require("joi");
const multer = require("multer");
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use(express.json());
const cors = require("cors");
app.use(cors());
const mongoose = require("mongoose");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

mongoose
  .connect("mongodb+srv://anath:ankitnath2004@data.mphicak.mongodb.net/?retryWrites=true&w=majority&appName=Data")
  .then(() => {
    console.log("connected to mongodb");
  })
  .catch((error) => {
    console.log("couldn't connect to mongodb", error);
    console.error("There was an error connecting to mongodb:", error);
  });

const propertySchema = new mongoose.Schema({
  img: String,
  address: String,
  description: String,
  bedrooms: Number,
  bathrooms: Number,
  sqft: Number,
  price_estimate: String,
  nearby_schools: [String]
});

const Property = mongoose.model("Property", propertySchema);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/api/properties", async (req, res) => {
  const properties = await Property.find();
  res.send(properties);
});

app.get("/api/properties/:id", async (req, res) => {
  const id = req.params.id;
  const property = await Property.findOne({ _id: id });
  res.send(property);
});

app.post("/api/properties", upload.single("img"), async (req, res) => {
  const result = validateProperty(req.body);

  if (result.error) {
    res.status(400).send(result.error.details[0].message);
    console.error("There was an error with the post:", result.error.details[0].message);
    return;
  }

  const property = new Property ({
    address: req.body.address,
    description: req.body.description,
    bedrooms: req.body.bedrooms,
    bathrooms: req.body.bathrooms,
    sqft: req.body.sqft,
    price_estimate: req.body.price_estimate,
    nearby_schools: req.body.nearby_schools.split(",")
  })

  if(req.file) {
    property.img = "images/" + req.file.filename;
  }


//   const property = new Property({
//     img_name: req.file ? req.file.filename : "",
//     ...req.body
//   });

  const saveResult = await property.save();
  res.send(property);
});

app.put("/api/properties/:id", upload.single("img"), async (req, res) => {
  const result = validateProperty(req.body);

  if (result.error) {
    res.status(400).send(result.error.details[0].message);
    console.error("There was an error with the put:", result.error.details[0].message);
    return;
  }

  let fieldsToUpdate = {
    address: req.body.address,
    description: req.body.description,
    bedrooms: req.body.bedrooms,
    bathrooms: req.body.bathrooms,
    sqft: req.body.sqft,
    price_estimate: req.body.price_estimate,
    nearby_schools: req.body.nearby_schools.split(",")
  }

  if(req.file) {
    fieldsToUpdate.img = "images/" + req.file.filename;
  }

  const id = req.params.id;

  const updateResult = await Property.updateOne({ _id: id }, fieldsToUpdate);

  res.send(updateResult);
});

app.delete("/api/properties/:id", async (req, res) => {
  const property = await Property.findByIdAndDelete(req.params.id);
  res.send(property);
});

function validateProperty(property) {
  const schema = Joi.object({
    //img_name: Joi.string(),
    _id : Joi.allow(""),
    address: Joi.string().min(3).required(),
    description: Joi.string().min(3).required(),
    bedrooms: Joi.number().integer().min(1).required(),
    bathrooms: Joi.number().integer().min(1).required(),
    sqft: Joi.number().integer().min(1).required(),
    price_estimate: Joi.string().required(),
    nearby_schools: Joi.allow("")
  });

  return schema.validate(property);
}

app.listen(3002, () => {
  console.log("I'm listening");
});
