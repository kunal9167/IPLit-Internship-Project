var fs = require("fs");
var xlsx = require("node-xlsx");
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/iplit");
var Mlist = require("./models/mlist");
var Info = require("./models/info");
var dialog = require('dialog');



var loader = function(name) {

    try{
    // Parse a buffer
    const workSheetsFromBuffer = xlsx.parse(
        fs.readFileSync(`${__dirname}/${name}.xlsx`)
    );
    // Parse a file
    const workSheetsFromFile = xlsx.parse(`${__dirname}/${name}.xlsx`);
    
    Mlist.remove({}, function(err) {
    if (err) return console.log(err);
    console.log("Data Removed");
    var len = workSheetsFromFile[0].data.length;
    var i = 0;
    var j = 0;
    workSheetsFromFile[0].data.forEach(function(data) {
  
        if (i > 1 && data[0] !== undefined) {
            
        var name = data[1] + " " + data[2];
        var mobile = data[0];
        var email = data[3];
        var mmc = data[4];
        var color = data[5];
        var remark = data[6];
        Mlist.create(
          {
            name,
            mobile,
            email,
            mmc,
            color,
            remark
          },
          function(err, cust) {
              j++;
            if (err) console.log(err);
            console.log("Registered "+j);
          }
        );
      }
      if (i == 0) {
        Info.remove({}, function(err) {
          Info.create(
            {
              event: data[0],
              event_img: data[3]
            },
            function(err, created) {
              console.log(created);
            }
          );
        });
      }
      i++;
    });
    console.log("Master List Has Been Updated");
    dialog.info('File Loaded');
});
}catch(e){
    dialog.info('Incorrect File Name');    
}    
};

module.exports = loader;