var express = require('express');
var router = express.Router();

const mysql = require('mysql');

const connection = mysql.createConnection({
	host : 'localhost',
	database : 'testingLogin',
	user : 'root',
	password : 'password'
});

connection.connect(function(error){
	if(error)
	{
		throw error;
	}
	else
	{
		console.log('MySQL Database is connected Successfully');
	}
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Express', session : req.session ,invalid:""});
});

router.post('/login', function(request, response, next){

    var user_email_address = request.body.user_email;

    var user_password = request.body.user_password;

    if(user_email_address && user_password)
    {
        query = `
        SELECT * FROM users 
        WHERE username = "${user_email_address}"
        `;

        connection.query(query, function(error, data){
            //console.log(data)
            if(data.length > 0)
            {
                for(var count = 0; count < data.length; count++)
                {
                    if(data[count].user_password == user_password)
                    {
                        //console.log(data[count].user_password)
                        request.session.user_id = data[count].user_id;
                        //console.log(data[count].name)
                        response.render('blah', { title: 'Express', session : request.session ,name:data[count].name});
                    }
                    else
                    {
                        console.log("2")
                        response.render('index', { title: 'Express', session : request.session ,invalid:"INVALID PASSWORD"});
                    }
                }
            }
            else
            {
                response.render('index', { title: 'Express', session : request.session ,invalid:"INVALID EMAIL ADDRESS"});
            }
            response.end();
        });
    }
    else
    {
        response.render('index', { title: 'Express', session : request.session ,invalid:"PLEASE ENTER DETAILS"});
        response.end();
    }
});

// router.get('/logout', function(request, response, next){
//     request.session.destroy();
//     response.redirect("/");
// });

module.exports = router;