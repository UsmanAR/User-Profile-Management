const ejs = require("ejs")
const express= require('express')
const mong = require("mongoose");
const port =  process.env.PORT || 5000;

const app=express()
app.use( express.static( "public" ) );
app.set('view engine','ejs');
mong.connect("mongodb://localhost:27017/Users")
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

app.get('/login',(req,res)=>{
    res.render('main')
})

app.get('/add',(req,res)=>{
    
    res.render('add')
})


app.listen(port,()=>{

})
