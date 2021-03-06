const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload');
require('dotenv').config();
const app = express();
const port = 4000
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASS}@cluster0.z215d.mongodb.net/creativeDB?retryWrites=true&w=majority`;


//middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('services'));
app.use(fileUpload());

app.get('/', (req, res) => {
  res.send('Creative-Agency-Heroku Server v2')
})






const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const orderList = client.db("creativeDB").collection("order");
  const reviewList = client.db("creativeDB").collection("review");
  const adminList = client.db("creativeDB").collection("admin");
  const serviceList = client.db("creativeDB").collection("services");
    //place order
    app.post('/placeorder', (req, res) => {
        const order = req.body;
        orderList.insertOne(order)
        .then(response => {
            if (response.insertedCount > 0) {
                res.status(200).send(response.insertedCount > 0)
            }
        })
    })

    //read orderList
    app.get('/allorders', (req, res) => {
        const user = req.query.email;
        orderList.find({email:user})
        .toArray((err,docs) => {
            res.send(docs);
        })
    })
    //admin service List
    app.get('/allordersadmin', (req, res) => {
        orderList.find({})
        .toArray((err,docs) => {
            res.send(docs);
        })
    })
    //make admin
    app.post('/addadmin', (req, res) => {
        const admin = req.body;
        adminList.insertOne(admin)
        .then(response => {
            if (response.insertedCount > 0) {
                res.status(200).send(response.insertedCount > 0)
            }
        })
    });
    //is admin
    app.post('/isAdmin', (req, res) => {
        const email= req.body.email;
        adminList.find({ adminemail: email})
        .toArray((err,docs) => {
            res.send(docs.length > 0);
        })
    })

    //post service 
    app.post('/addservice', (req, res) => {
        const info = req.body;
        const icon = req.files.icon;
        const service = {
            ...info,
            icon:icon.name
        }
        
        serviceList.insertOne(service)
        .then(response => {
            console.log(response);
            if (response.insertedCount > 0) {
                res.status(200).send(true)
            }
        })

        icon.mv(`${__dirname}/services/${icon.name}`)
    });


    //get service
    app.get('/services', (req, res) => {
        serviceList.find({})
        .toArray((err,docs) => {
            res.send(docs);
        })
    })


    //post review
    app.post('/submitreview', (req, res) => {
        const review = req.body;
        reviewList.insertOne(review)
        .then(response => {
            if (response.insertedCount > 0) {
                res.status(200).send(response.insertedCount > 0)
            }
        })
    })


    //get review

    app.get('/allreview', (req, res) => {
        reviewList.find({})
        .toArray((err,docs) => {
            res.send(docs);
        })
    })


});








app.listen(process.env.PORT || port);