const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const auth = require("./middleware/auth");

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();


app.use(cors());
app.use(express.json());


// MongoDB Connection

mongoose.connect(process.env.MONGO_URI)

.then(()=>{

console.log("MongoDB Connected");

})

.catch((err)=>{

console.log(err);

});



// Test API

app.get("/", (req,res)=>{

res.send("Server is working");

});


// Task Model

const Task = require("./models/Task");



// Get Tasks

app.get("/tasks", auth, async (req, res) => {
  const tasks = await Task.find({
    userId: req.user.id,
  });

  res.json(tasks);
});


// Add Task

app.post("/tasks", auth, async (req, res) => {
  const task = new Task({
    title: req.body.title,
    userId: req.user.id,
  });

  await task.save();

  res.json(task);
});



// Delete Task

app.delete("/tasks/:id", auth, async (req, res) => {
  await Task.deleteOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  res.json({
    message: "Deleted",
  });
});

// Update Task

app.put("/tasks/:id", auth, async (req, res) => {
  try {
    const updatedTask = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
      },
      {
        title: req.body.title,
      },
      {
        new: true,
      }
    );

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Toggle Complete Task

app.put("/tasks/:id/complete", auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    task.completed = !task.completed;

    await task.save();

    res.json(task);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});


// =======================
// AUTH ROUTES START
// =======================

// REGISTER
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      { id: user._id },
      "secret123",
      { expiresIn: "7d" }
    );

    res.json({ token, user });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =======================
// AUTH ROUTES END
// =======================



// Server Start

app.listen(5000,()=>{

console.log("Server running on 5000");

});