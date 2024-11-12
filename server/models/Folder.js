const mongoose = require("mongoose");
const folderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  files: [{ type: mongoose.Schema.Types.ObjectId, ref: "File" }],
});
module.exports = mongoose.model("Folder", folderSchema);
