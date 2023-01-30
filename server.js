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

// Login API
app.get('/login',(req,res)=>{
    
    res.render('login')
})

// API to add users/admins
app.get('/add',(req,res)=>{
    res.render('add',{
        user:true,
        admin:req.session.admin
    })
})

app.get('/view',(req,res)=>{
    if(!req.session.authenticated)res.render('login')
    var admin = req.session.admin;
    user.find({}).then((use)=>{
        res.render('update',{
            users:use,
            admin:admin
        })
    })
  // res.render('update')
   
})

// app.get('/view',(req,res)=>{

//     user.find({}).then((users)=>{
//         res.send(users);
//     }).catch((error)=>{
//         res.status(500).send(error)
//     })
// //    res.render('update')
// })

app.post('/login',(req,res)=>{
    const curr_user = {
        username:req.body.username,
        password:req.body.password
    }

    user.findOne({username:req.body.username}).then((response)=>{
                if(response!=undefined&&response.password ==req.body.password){
                    if(response.role=="admin")req.session.admin = true;
                    else req.session.admin = false
                    req.session.authenticated = true;
                    res.send("Logged in successfully")
                }
                else{   
                    res.send("Invalid username/password")
                }
             
    })
    // jwt.sign({curr_user},secretkey,{expiresIn:'100000s'},(err,token)=>{
    //     res.send("The token generated is " + token)
    // })
})



function verifyToken(req,res,next){
            var bearer = req.headers['token'];
            bearer= bearer.split(" ");
            req.token = bearer[1];
            jwt.verify(req.token,secretkey,(err,response)=>{
            if(!err)next()
            else res.send("Invalid token")
        })
            
}

app.get('/update/:name',(req,res)=>{
    if(!req.session.authenticated)res.render('login')
    user.findOne({first_name:req.params.name}).then((response)=>{
        res.render('edit',{
            user:response
        })
    })
})

app.post('/update/:name',(req,res)=>{
    if(!req.session.authenticated)res.render('login') 
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

// app.get('/view/:field',(req,res)=>{
//     const fields={
//         1:"first_name",
//         2:"middle_name",
//         3:"last_name",
//         4:"email",
//         6:"role",
//         7:"department"
//     }

//     user.find({}).then((users)=>{
//         if(req.params.field==5){
//             res.send("Cannot display password")
//         }
//         else if(req.params.field>=1&&req.params.field<=7)
//         res.send(fields[req.params.field] + " : " + users[0][fields[req.params.field]]);
//         else res.send("Enter proper field number")
//     }).catch((error)=>{
//         res.status(500).send(error)
//     })
// //    res.render('update')
// })




app.post('/add',async (req,res)=>{
    if(!req.session.authenticated)res.render('login')
    var admin = false
    console.log("The name taken is"  + req.body.fname)
    const col= await user.find().limit(1).sort({$natural:-1})
    if(col[0]!=undefined)ind = col[0]["id"] + 1;     
    else ind=1;
   // res.send(col)
    console.log("Value of ind " + ind)
    var new_user; 
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
        admin:req.session.admin
    })
})


// To delete all documents in db 
app.get('/delete',(req,res)=>{
    user.deleteMany().then((response=>{
        res.send("All documents deleted successflly")
    }))
})

app.listen(port,()=>{

})
