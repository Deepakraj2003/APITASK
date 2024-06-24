import express from "express";
import path from "path";
import { MongoClient } from 'mongodb'
import { ObjectId } from "mongodb";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const app = express();


app.use(cors())
//authentication
const auth=(req,res,next)=>{
try{
const token = req.header("backend-token");//keyname,assign value as token
jwt.verify(token,"abcd");
next();
}
catch(error) {
res.status(401).send({message:error.message});
}
}

// Connection URL
const url = "mongodb+srv://deera3468:wQYHszmzEZiYK4tD@back153.i8nqqzc.mongodb.net/?retryWrites=true&w=majority&appName=back153";
const client = new MongoClient(url);

// Database Name
const dbName = 'myProject';
await client.connect();
console.log('Mongodb Connected successfully to server');

//middleware
app.use(express.json())



app.get('/', (req, res) => {
    const filePath = path.resolve('src','k.html');
    console.log("sdfghjh");
    res.status(200).send("Hello World!");
});
app.get('/get1', (req, res) => {
    const filePath = path.resolve('k.html');
    console.log("sdfghjh");
    res.status(201).send("sdfghjh");
});
app.post('/post' ,async(req, res) => {
    const getPostman=req.body;
    console.log(getPostman);
    const sendMethod=await client.db("CURD").collection("data").insertOne(getPostman);
    res.status(200).send(sendMethod);
});
app.post('/postmany',async(req, res) => {
    const getPostman=req.body;
    console.log(getPostman);
    const sendMethod=await client.db("CURD").collection("data").insertMany(getPostman);
    res.status(200).send(sendMethod);
});

app.get('/getmany',async (req,res)=>{
    const getdata= await client.db("CURD").collection("data").find({}).toArray();
    res.status(200).send(getdata);
});

app.get('/getone/:id', async (req, res) => {
    const { id } = req.params;
    const getdata = await client.db("CURD").collection("data").findOne({_id:new ObjectId(id)});
    res.status(200).send(getdata);
});

//update

app.put('/update/:id', async (req, res) => {
    const {id}=req.params;
    const getpostman=req.body;
    const updatedata = await client.db("CURD").collection("data").updateOne({_id:new ObjectId(id)},{$set:getpostman});
    res.status(201).send(updatedata);
});

//delete

app.delete('/delete/:id', async (req, res)=>{
    const {id}=req.params;
    const deletedata = await client.db("CURD").collection("data").deleteOne({_id:new ObjectId(id)});
    res.status(200).send(deletedata);
});

app.post("/register",async (req, res)=>{
    const {username,email,password} = req.body;
    const userfind=await client.db("CURD").collection("registerdata").findOne({email:email});
    if (!userfind){
    const salt=await bcrypt.genSalt(10);
    const encrypt=await bcrypt.hash(password,salt);
    const registerData = await client.db("CURD").collection("registerdata").insertOne({name:username,email:email,password:encrypt});
    res.status(201).send(registerData);
    
    }
    else{
        res.status(400).send("user already registerd");
    }
    
    
})
app.post('/login', async(req, res) => {
    const {email,password} = req.body;
    const userfind=await client.db("CURD").collection("registerdata").findOne({email:email});
    if (userfind){
        const mongopass=userfind.password;
        const check= await bcrypt.compare(password, mongopass);
        if(check){
            const token=jwt.sign({id:userfind._id},"abcd");// jwt token abcd
            res.status(200).send({token:token})
        }
        else{
            res.status(400).send({message:"not Verified user"});
        }
    }
    else{
        res.status(400).send({message:"User not Found"});
    }
})
;

app.listen(4000, () => {
    console.log("Server is running on http://localhost:4000");
});




