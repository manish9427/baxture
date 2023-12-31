const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

app.use(express.json());

// Mongoose schema and model for users
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  age: { type: Number, required: true },
  hobbies: { type: [String], default: [] },
});

const User = mongoose.model("Baxture", userSchema);

// Middleware to validate MongoDB ObjectId
const validateObjectId = (req, res, next) => {
  const userId = req.params.userId;
  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ message: "Invalid userId format" });
  }
  next();
};

// Routes for CRUD operations

app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/users/:userId", validateObjectId, async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (user) {
      res.status(200).json({ user });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/users", async (req, res) => {
  try {
    const { username, age, hobbies } = req.body;
    const newUser = new User({ username, age, hobbies });
    await newUser.save();
    res.status(201).json({ user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.put("/users/:userId", validateObjectId, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { username, age, hobbies } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, age, hobbies },
      { new: true }
    );

    if (updatedUser) {
      res.status(200).json({ user: updatedUser });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.delete("/users/:userId", validateObjectId, async (req, res) => {
  try {
    const userId = req.params.userId;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (deletedUser) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Error handling middleware for non-existing endpoints
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

// Error handling middleware for other errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
