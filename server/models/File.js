const mongoose = require("mongoose");
const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  folderId: { type: mongoose.Schema.Types.ObjectId, ref: "Folder" },
});
module.exports = mongoose.model("File", fileSchema);
