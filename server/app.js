const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });
const path = require("path");
const fs = require("fs");
mongoose
  .connect(
    "mongodb+srv://ramuksampath5:passwords@cluster0.h9swq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
const Folder = require("./models/Folder");
const File = require("./models/File");
// Create Folder
app.post("/folders", async (req, res) => {
  try {
    const folder = new Folder(req.body);
    await folder.save();
    res.status(201).send(folder);
  } catch (err) {
    res.status(400).send({ message: "Error creating folder" });
  }
});
// Get All Folders
app.get("/folders", async (req, res) => {
  try {
    const folders = await Folder.find().populate("files").exec();
    res.send(folders);
  } catch (err) {
    res.status(500).send({ message: "Error fetching folders" });
  }
});
// Get Folder by ID
app.get("/folders/:id", async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id)
      .populate("files")
      .exec();
    if (!folder) {
      return res.status(404).send({ message: "Folder not found" });
    }
    res.send(folder);
  } catch (err) {
    res.status(500).send({ message: "Error fetching folder" });
  }
});
// Update Folder
app.patch("/folders/:id", async (req, res) => {
  try {
    const folder = await Folder.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("files");
    if (!folder) {
      return res.status(404).send({ message: "Folder not found" });
    }
    res.send(folder);
  } catch (err) {
    res.status(400).send({ message: "Error updating folder" });
  }
});
// Delete Folder
app.delete("/folders/:id", async (req, res) => {
  try {
    const folder = await Folder.findByIdAndDelete(req.params.id);
    res.send({ message: "Folder deleted successfully" });
  } catch (err) {
    res.status(500).send({ message: "Error deleting folder" });
  }
});
// Create File
app.post("/folders/:folderId/filesx", async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.folderId);
    if (!folder) {
      return res.status(404).send({ message: "Folder not found" });
    }
    const file = new File({ ...req.body, folderId: req.params.folderId });
    await file.save();
    folder.files.push(file._id);
    await folder.save();
    res.status(201).send(file);
  } catch (err) {
    res.status(400).send({ message: "Error creating file" });
  }
});
// Get Files in Folder by Folder ID
app.get("/folders/:folderId/files", async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.folderId)
      .populate("files")
      .exec();
    if (!folder) {
      return res.status(404).send({ message: "Folder not found" });
    }
    res.send(folder.files);
  } catch (err) {
    res.status(500).send({ message: "Error fetching files in folder" });
  }
});
// Get File by ID
app.get("/files/:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id).populate("folderId").exec();
    if (!file) {
      return res.status(404).send({ message: "File not found" });
    }
    res.send(file);
  } catch (err) {
    res.status(500).send({ message: "Error fetching file" });
  }
});
// Update File
app.patch("/files/:id", async (req, res) => {
  try {
    const file = await File.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("folderId");
    if (!file) {
      return res.status(404).send({ message: "File not found" });
    }
    res.send(file);
  } catch (err) {
    res.status(400).send({ message: "Error updating file" });
  }
});
// Delete File
app.delete("/files/:id", async (req, res) => {
  try {
    await File.findByIdAndDelete(req.params.id);
    res.send({ message: "File deleted successfully" });
  } catch (err) {
    res.status(500).send({ message: "Error deleting file" });
  }
});
//
app.post(
  "/folders/:folderId/files",
  upload.single("file"),
  async (req, res) => {
    try {
      const uploadedFile = req.file;
      const filePath = path.join(
        __dirname,
        uploadedFile.destination,
        uploadedFile.filename
      );
      console.log("File uploaded successfully:", uploadedFile.filename);
      const folder = await Folder.findById(req.params.folderId);
      if (!folder) {
        return res.status(404).send({ message: "Folder not found" });
      }
      const file = new File({
        name: uploadedFile.filename,
        folderId: req.params.folderId,
      });
      await file.save();
      folder.files.push(file._id);
      await folder.save();
      await fs.promises.unlink(filePath);
      res.status(201).send(uploadedFile.filename);
      // res.json({ file: uploadedFile.filename });
    } catch (err) {
      res.status(500).send({ message: "Error uploading file" });
    }
  }
);
app.get("/", async (req, res) => {
  try {
    res.send("Hello World");
  } catch (err) {
    res.status(500).send({ message: "Error fetching file" });
  }
});
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
