const { v4: uuidv4 } = require('uuid');
const express = require('express')
const passport = require('passport')
const BasicStrategy = require('passport-http').BasicStrategy;
const req = require('express/lib/request')
const res = require('express/lib/response')
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const app = express()
const port = 3000
const multer = require('multer')
const upload = multer({ dest: 'uploads/'})

app.use(bodyParser.json());


passport.use(new BasicStrategy(
    function(username, password, done) {

        console.log(username +  ' ' + password);
        let user = users.find(user => (user.username === username) && (bcrypt.compareSync(password, user.password)));
        if(user != undefined) {
            done(null, user);
        }
        else {
            done(null, false);  
        }
    }
));

//app to run localhost
app.listen(port, () => {
    console.log('app running on port 3000')
})
const users = [{
    "id": uuidv4(),
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "dateOfBirth": "string"
  }]

const items = [
    {
        "Id": uuidv4(),
        "title": "Gold watch",
        "description": "Expensive watch",
        "category": "accessory",
        "location": "Helsinki",
        "price": 300,
        "dateofposting": "12.2.2022",
        "UserId": "2"
      },
      {
        "Id": uuidv4(),
        "title": "Makita angle grinder",
        "description": "heavy duty makita",
        "category": "Powertool",
        "location": "Kemi",
        "price": 100,
        "dateofposting": "1.12.2021",
        "UserId": "3"
      }
]

//JWT
const jwtsecrets = require('./jwtt.json');
const jwt = require('jsonwebtoken')
const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
let opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = jwtsecrets.jwtSignKey;

passport.use(new JwtStrategy(opts, function(jwt_payload, done) {

    const user = users.find(u => u.id === jwt_payload.UserId)
    done(null, user);
}));

app.post('/login',passport.authenticate('basic', {session: false}), (req, res) => {
    //jwt generointi
    const payloadData = {
        UserId: req.user.id
    };
    const options = {
        expiresIn: '30min'
    }

    const token = jwt.sign(payloadData, jwtsecrets.jwtSignKey, options);

    res.json({ token: token })

  
})

app.get('/jwtSecured', passport.authenticate('jwt', {session: false}), (req, res) => {
    
res.json({ status: "ok", user: req.user.username});
})
//JWT
app.post('/users', (req, res) => {
    
    console.log('POST user');
    const salt = bcrypt.genSaltSync(6);
    console.log('salt; ' + salt);
    console.log('password:' + req.body.password);
    
    const hashedpassword = bcrypt.hashSync(req.body.password, salt);
    console.log('hashedpassword:' + hashedpassword);

    const user = {
    id: uuidv4(),
    username: req.body.username,
    password: hashedpassword,
    email: req.body.email,
}
    users.push(user);

    res.sendStatus(201);
})
app.get('/items', (req, res) => {
    console.log(items);
    res.json(items);
  })

    app.get('/items/:itemId', (req, res) => {


    let foundIndex = items.findIndex(t => t.Id === req.params.itemId);

    if(foundIndex === -1){
            res.sendStatus(404);
    }   else {
            res.json(items[foundIndex]);
    }  
})



app.delete('/items/:itemId', (req, res) => {
    let foundIndex = items.findIndex(t => t.Id === req.params.itemId);

    if(foundIndex === -1){
            res.sendStatus(404);
    }   else {
            items.splice(foundIndex, 1);
            res.sendStatus(200)
    }  
})



app.post('/items', (req, res) => {
    console.log(req.body);


    items.push({    
        id: uuidv4(),
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        location: req.body.location,
        price: req.body.price,
        dateofposting: req.body.dateofposting,
        UserId: req.body.UserId

    });
    res.sendStatus(201);
})

app.put('/items/:itemId', (req, res) => {

    let foundItem = items.find(t => t.Id === req.params.itemId);
    if(foundItem){
        foundItem.title = req.body.title
        foundItem.description = req.body.description
        foundItem.category = req.body.category
        foundItem.location = req.body.location
        foundItem.price = req.body.price
        foundItem.dateofposting = req.body.dateofposting
        foundItem.UserId = req.body.UserId
        res.sendStatus(202);
    }
        else{
            res.sendStatus(404)
        }
    
    });

    app.post('/photos/upload', upload.array('images', 12), function (req, res, next) {

    console.log(req.files);
        
    
    res.sendStatus(200)
    })