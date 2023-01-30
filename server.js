const ejs = require("ejs")
const session = require('express-session')
const jwt = require("jsonwebtoken")
const express= require('express')
const mong = require("mongoose");
const port =  process.env.PORT || 5001;
const bodyParser = require('body-parser');
const app=express()
const path=require('path')
app.use( express.static( "public" ) );
app.set('view engine','ejs');
mong.connect("mongodb://localhost:27017/Portfolio_db")
//mong.connect("mongodb://uyxoojzraxiek57e83ze:HbRaTm0zfx00UnJcHl6Y@n1-c2-mongodb-clevercloud-customers.services.clever-cloud.com:27017,n2-c2-mongodb-clevercloud-customers.services.clever-cloud.com:27017/bgh3ctwhnvait0k?replicaSet=rs0")
var ind=1;
app.use(express.static('views/static'));
//app.use(express.static(path.join(__dirname, "js")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: "session code",
    saveUninitialized:false 
}))
// Secret Key for JWT Token generation
const secretkey = "SecretKey" 

// Admin/User Schema 
const schema = new mong.Schema({
    id:Number,
    username:String,
    first_name:String,
    middle_name:String,
    last_name:String,
    email:String,
    password:String,
    role:String,
    department:String,
    created_time:Date,
    updated_time:Date
})

const user = new mong.model("user",schema)


function verifyToken(req,res,next){
    var bearer = req.headers['token'];
    bearer= bearer.split(" ");
    req.token = bearer[1];
    jwt.verify(req.token,secretkey,(err,response)=>{
    if(!err)next()
    else res.send("Invalid token")
})
    
}

// Login API
app.get('/',(req,res)=>{
    res.redirect('/login')
})

app.get('/login',(req,res)=>{
   if(req.session.authenticated)res.send("Already Loggedin. Go to /logout to Logout")
   else{
   res.render('login',{
    loggedin:req.session.authenticated
   })
}
})

// API to add users/admins
app.get('/add',(req,res)=>{
    if(!req.session.authenticated)res.redirect('login')
    res.render('add',{
        user:true,
        admin:req.session.admin,
        exists:false
    })
})

// API to view all the users/admins based on the role of user
app.get('/view',(req,res)=>{
    if(!req.session.authenticated)res.redirect('login')
    var admin = req.session.admin;
    user.find({}).then((use)=>{
        res.render('update',{
            users:use,
            admin:admin
        })
    })
   
})


app.post('/login',(req,res)=>{
    const curr_user = {
        username:req.body.username,
        password:req.body.password
    }
    req.session.loggedin=true;
    // Verifying the username and passwords,if exists, in the DB
    user.findOne({username:req.body.username}).then((response)=>{
                if(response!=undefined&&response.password ==req.body.password){
                    if(response.role=="admin")req.session.admin = true;
                    else req.session.admin = false
                    req.session.authenticated = true;
                    //res.send("Logged in successfully")
                     res.redirect('view')
                }
                else{   
                    res.send("Invalid username/password")
                }
             
    })
})



// API to update the user details 
app.get('/update/:name',(req,res)=>{
    if(!req.session.authenticated)res.redirect('login')
    // Getting the fields of the document to be updated
    user.findOne({first_name:req.params.name}).then((response)=>{
        res.render('edit',{
            user:response
        })
    })
})

app.post('/update/:name',(req,res)=>{
    if(!req.session.authenticated)res.redirect('login') 
    // Updating the fields of the already existing document
    user.updateOne({first_name:req.params.name},{
        first_name:req.body.fname,
        middle_name:req.body.mname,
        last_name:req.body.lname,
        email:req.body.email,
        role:req.body.role,
        department:req.body.dept,
        updated_time:new Date()
    }).then((response)=>{
        user.find({}).then((use)=>{
            res.render('update',{
                users:use,
                admin:req.session.admin
            })
        })
    })
})

// API to ADD users/admins
app.post('/add',async (req,res)=>{
    if(!req.session.authenticated)res.redirect('login')
    var admin = false
    console.log("The name taken is"  + req.body.fname)
    const col= await user.find().limit(1).sort({$natural:-1})
    // Checking if the username already exists
    const uname = await user.findOne({username:req.body.username});
    if(uname!=null){
        res.render('add',{
            exists:true,
            user:true,
            admin:req.session.admin
        })
    }
    else{

    if(col[0]!=undefined)ind = col[0]["id"] + 1;     
    else ind=1;
   // res.send(col)
    console.log("Value of ind " + ind)
    var new_user; 
    // Adding new user/admin to the DB
    if(req.session.admin){
    new_user = new user({
        id:ind,
        username:req.body.username,
        first_name:req.body.fname,
        middle_name:req.body.mname,
        last_name:req.body.lname,
        email:req.body.email,
        role:req.body.role,
        password:req.body.passwd,
        department:req.body.dept,
        created_time:new Date(),
        updated_time:new Date()
    })
} else{
    new_user = new user({
        id:ind,
        username:req.body.username,
        first_name:req.body.fname,
        middle_name:req.body.mname,
        last_name:req.body.lname,
        email:req.body.email,
        role:"user",
        password:req.body.passwd,
        department:req.body.dept,
        created_time:new Date(),
        updated_time:new Date()
    })  
}
    new_user.save();
    res.render('add',{
        user:true,
        admin:req.session.admin,
        exists:false
    })
}
})


// // To delete all documents in db 
// app.get('/delete',(req,res)=>{
//     user.deleteMany().then((response=>{
//         res.send("All documents deleted successflly")
//     }))
// })

// API to logout out of current session 
app.get('/logout',(req,res)=>{
    // Destroying the current session and logging out
    req.session.destroy();
    res.redirect('/login')
})

app.listen(port,()=>{

})
