var mongoose    = require("mongoose"),
    express     = require("express"),
    bodyParser  = require("body-parser"),
    Mlist       = require("./models/mlist"),
    Info        = require("./models/info");
    var dialog = require('dialog');
    var xl = require('excel4node');
    var loader = require("./exceldata");
//NEW MODEL
var mlistSchema = new mongoose.Schema({
    name: String,
    mobile: String,
    email: String,
    mmc: String,
    color: String,
    remark: String
});
var list;
var lname;
//=====================================

var f2;

var infor =function(){
        Info.find({},function(err,found){
            f2=found;
            console.log(found);
        });
    };
infor();


mongoose.connect("mongodb://localhost/iplit");
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.use(function(req,res,next){
        res.locals.heading = f2[0].heading;
        res.locals.event = f2[0].event;
        res.locals.event_img = f2[0].event_img;
        next();        
});

var infor = function(){
    Info.create({
        heading:"IMAKON",
        event: "IMAKON",
        event_img: "http://www.wemedico.com/Pages/imakon/imakonlogo.png"
    },function(err,created){
        console.log(created);
    });
};

infor();


//REGISTER ROUTE
app.get("/register", function(req,res){
    res.render("register");
});

app.post("/register", function(req,res){
    var max=0;
    
    Mlist.find({mobile: req.body.info.mobile} , function(err, doc) {
           if(doc.length!==0)
            {
                dialog.info("MObile number already exists");
                res.redirect("/register");
            }
           else
           {
                Mlist.create(req.body.info, function(err, cust){
                    console.log("Registered");
                });
                res.redirect("/home");
           }
        }); 
});



//SCAN ROUTE
app.get("/scan", function(req,res){
    res.render("scan_initial",{schemas : Object.keys(mongoose.connection.base.modelSchemas)});
});

app.post("/scan", function(req,res){
    
    if (req.body.info.file !== 'Mlist')
    {
        lname = req.body.info.file;
        list  = mongoose.model(req.body.info.file, mlistSchema);
        res.render("scan");
    }
    else{
        res.redirect("/scan");
    }
});

app.post("/scan_list", function(req,res){

    Mlist.find({mobile: req.body.info.mobile}, function(err,custs){
        if(err)
            console.log("Error");
        else{
            if(custs.length!==0){
            
                list.find({mobile: req.body.info.mobile},function(err,cust){
                
                if(cust.length !== 0)
                {
                    dialog.info(custs[0].name+' Already Scanned');
                   res.render("scan",{msg: custs[0].name+" Already Scanned"});
                }else{
                    var name = custs[0].name;
                    var mobile = custs[0].mobile;
                    var email = custs[0].email;
                    var myData =({
                        name,
                        mobile,
                        email
                    });
                    
                    list.create( myData, function(err, cust){
                        if(err)
                        console.log(err);
                    });
                    // if(custs[0].remark)
                    //     dialog.info(custs[0].name+" : "+custs[0].remark);
                    res.render("scan",{msg: custs[0].name+" ( "+custs[0].color.toUpperCase()+" ) Scanned Successfully",
                        remark: custs[0].remark
                    });                    
                }
            });
            }
            else
            {
                dialog.info(req.body.info.mobile+' NOT FOUND!');                
                res.render("scan",{msg: req.body.info.mobile+" NOT FOUND"});                   
            }
        }
    });
});

app.get("/list",function(req,res){
    list.find({},function(err,custs){
        if(err)
            console.log(err);
        else
            res.render("list",{custs})
    });
});


//List All
app.get("/master",function(req,res){

    Mlist.find({},function(err,custs){
        if(err)
            console.log(err);
        else
            res.render("master",{custs})
    });
});

app.get("/home", function(req,res){
    res.render("home");
});

app.post("/excel", function(req,res){
    var wb = new xl.Workbook();
    
    list.find({},function(err,datas){
        var ws = wb.addWorksheet('Sheet 1');
        var i=0;
        
        ws.column(1).setWidth(30);
        ws.column(2).setWidth(30);
        ws.column(3).setWidth(45);
        ws.column(4).setWidth(45);
        ws.column(5).setWidth(45);
        ws.column(6).setWidth(45);
        
        var style = wb.createStyle({
            alignment:{
                // indent: 5
                horizontal: ['center']
            },
            font: {
                color: '#FF0800',
                size: 18,
                bold: true,
            },
            'sheetFormat': {
                // 'baseColWidth': 20,
                'defaultColWidth': 20
            },
            numberFormat: '$#,##0.00; ($#,##0.00); -'
        });
        var style2 = wb.createStyle({
            font: {
                color: '#000000',
                size: 14,
                bold: false,
            },
            'sheetFormat': {
                'defaultColWidth': 20
            },
            numberFormat: '$#,##0.00; ($#,##0.00); -'
        });
        

        var datetime = new Date();
        ws.cell(1,2).string(lname+" "+datetime.toDateString()).style(style);
        ws.cell(2,2).string("Mobile").style(style);
        ws.cell(2,1).string("Name").style(style);
        ws.cell(2,3).string("Email").style(style);
        
        for(var i=0; i<datas.length;i++)
        {
            var k=1;
            ws.cell(i+3,k).string(datas[i].mobile).style(style2);
            k++;
            ws.cell(i+3,k).string(datas[i].name).style(style2);           
            k++;
            ws.cell(i+3,k).string(datas[i].email).style(style2);
            k++;
            ws.cell(i+3,k).string(datas[i].mmc).style(style2);
            k++;
            ws.cell(i+3,k).string(datas[i].color).style(style2);
            k++;
            ws.cell(i+3,k).string(datas[i].remark).style(style2);
        }            
           
            wb.write(lname+".xlsx");
            res.redirect("/scan");
    });    
});

app.get("/load",function(req,res){
    res.render("load/load");
});

app.post("/load",function(req,res){
    loader(req.body.filename);
    res.redirect("/");
});

app.get("/reset", function(req,res){
    list.remove({},function(err){
        if(err)
            console.log("Reset Unsuccessful");
        console.log("Reset Successful");
        res.redirect("/");
    });

});

app.get("*", function(req,res){
    res.redirect("/home");
});

app.listen(3000,function(){
    console.log("Server is up");
});