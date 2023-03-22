var express = require('express');
var parseUrl = require('body-parser')
var cookieParser = require('cookie-parser');
var sessions = require('express-session');
var http = require('http');
var path = require('path');
var bcrypt = require('bcrypt');

var salRounds = 10


var app = express()

app.use(sessions({
  secret : 'webslesson',
  resave : true,
  saveUninitialized : true
}));

const mysql = require('mysql');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));


// Session middleware
// app.use(sessions({
//     secret: "thisismysecrctekey",
//     saveUninitialized:true,
//     cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 24 hours
//     resave: false
// }));

// app.use(cookieParser())
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')

// Database connection
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "user_info"
})

app.get('/',(req,res) => {
    res.render('login',{invalid:""})
})

// app.get("/login",(req,res) => {
//     res.sendFile(__dirname + "/login.html")
// })

// Get user data to /dashboard page
app.post("/login", async (req,response) => {
    var userEmail = req.body.email_address
    var password = req.body.password

    var encryptedPassword = await bcrypt.hash(password,salRounds)

    // console.log(encryptedPassword)

    if(userEmail && password)
    {
        query = `SELECT * FROM users WHERE Email = "${userEmail}"`

        con.query(query, function(error, data)
        {
            if(data.length > 0)
            {
              for(var count = 0; count < data.length; count++)
              {
                //   console.log(data[count].password)
                  if(data[count].password === password || bcrypt.compare(password,encryptedPassword))
                  {
                      response.render('blah', {name: data[count].Name});
                  }
                  else
                  {
                      response.render('login', {invalid:"INVALID PASSWORD"});
                  }
              }
            }
            else
            {
                response.render('login', {invalid:"INVALID EMAIL ADDRESS"});
            }
            response.end()
        })
    }

    else
    {
        response.render('login', {invalid:"PLEASE ENTER EMAIL ID AND PASSWORD"});
        response.end();
    }
})

app.post('/register',async (req,response) => {
    var user_name = req.body.Name
    var user_email = req.body.Email
    var password = req.body.password
    var password_confirm = req.body.passwordc

    var encryptedPassword = await bcrypt.hash(password,salRounds)

    if(user_name && user_email && password && password_confirm)
    {
        if(password===password_confirm)
        {
            query = `INSERT INTO users (Email, password, Name) VAlUES ('${user_email}','${encryptedPassword}','${user_name}')`

            con.query(query,function(err,data)
            {
                if(err)
                {
                    console.log(err)
                }
                else
                {
                    response.render('blah', {name: user_name});
                }
            })

        }
        else
        {
            response.render('signup',{signup:"PASSWORDS DON'T MATCH",invalid:""})
        }
    }
    else
    {
        response.render('signup',{signup:"PLEASE ENTER VALID DETAILS",invalid:""})
        response.end()
    }
})

app.listen(2628, () =>{
    console.log("Server running on port 2628")
})

app.get('/logout', function(request, response, next){
  request.session.destroy();
  response.redirect("/");
});