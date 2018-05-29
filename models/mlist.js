var mongoose = require("mongoose");

var mlistSchema = new mongoose.Schema({
    name: String,
    mobile: String,
    email: String,
    mmc: String,
    color: String,
    remark: String
});

var Mlist = mongoose.model("Mlist", mlistSchema);

module.exports = Mlist;