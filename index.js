const ejs = require("ejs")
const jwt = require("jsonwebtoken")
const express= require('express')
const mong = require("mongoose");
const port =  process.env.PORT || 5000;
const bodyParser = require('body-parser');
const app=express()
app.use( express.static( "public" ) );
app.set('view engine','ejs');
mong.connect("mongodb://localhost:27017/Portfolio_db")



app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

const secretkey = "SecretKey" 

// Admin/User Schema 
const schema = new mong.Schema({
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

app.get('/login',(req,res)=>{
    res.render('login')
})

app.get('/add',(req,res)=>{

    res.render('add',{
        user:true
    })
})

app.get('/update',(req,res)=>{
    user.find({}).then((use)=>{
        res.render('update',{
            users:use
        })
    })
  // res.render('update')
   
})

app.get('/view',(req,res)=>{

    user.find({}).then((users)=>{
        res.send(users);
    }).catch((error)=>{
        res.status(500).send(error)
    })
//    res.render('update')
})

app.post('/login',(req,res)=>{
    const user = {
        username:req.body.username,
        password:req.body.password
    }
    jwt.sign({user},secretkey,{expiresIn:'100000s'},(err,token)=>{
        res.send("The token generated is " + token)
    })
})


app.get('/test',verifyToken,(req,res)=>{
        res.send("This is test page")
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

app.get('/edit/:name',(req,res)=>{
    user.findOne({first_name:req.params.name}).then((response)=>{
        res.render('edit',{
            user:response
        })
    })
})

app.post('/edit/:name',(req,res)=>{
    user.updateOne({first_name:req.params.name},{
        first_name:req.body.fname,
        middle_name:req.body.mname,
        last_name:req.body.lname,
        email:req.body.email,
        role:req.body.role,
        department:req.body.dept,
    }).then((response)=>{
        user.find({}).then((use)=>{
            res.render('update',{
                users:use
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




app.post('/add',(req,res)=>{
    console.log("The name taken is"  + req.body.fname)
    const new_user = new user({
        first_name:req.body.fname,
        middle_name:req.body.mname,
        last_name:req.body.lname,
        email:req.body.email,
        role:req.body.role,
        department:req.body.dept,

    })
    new_user.save();
    res.render('add',{
        user:true
    })
})


app.listen(port,()=>{

})
