var mongoose = require("mongoose");

var infoSchema = new mongoose.Schema({
    heading: String,
    event: String,
    event_img: String,
});

var Info = mongoose.model("Info", infoSchema);

module.exports = Info;