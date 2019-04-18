var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var mysql = require('mysql');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bcrypt = require('bcrypt');

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: 'app', cookie: { maxAge: 1 * 1000 * 60 * 60 * 24 * 365 } }));
app.use(cookieParser());

var con = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "food_db"
});

con.connect();

app.get('/', (req, res) => {
    res.send('index')
})

var tempId = 3;

app.post('/newUser', (req, res) => {
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(req.body.password, salt, function (err, p_hash) {
            con.query('INSERT INTO user_auth(userName, email, password_hash) VALUES(?,?,?)', [req.body.userName, req.body.email, p_hash], (err, results, fields) => {
            })
            res.redirect('/login/' + req.body.email + '/' + p_hash);
        })
    })
})

app.post('/newCustomIcon', (req, res) => {
    con.query('INSERT INTO foods (food_name, expiry_time, custom_user_id) VALUES (?, ?, ?)', [req.body.foodName, req.body.expiration, tempId], (err, results, fields) => {
    })
    res.redirect('/inventory');
})

app.get('/inventory', (req, res) => {
    con.query('SELECT id, food_name, custom_user_id FROM foods WHERE custom_user_id = 0 OR custom_user_id = (?) ORDER BY id ASC;', tempId, (err, results, fields) => {
        res.render('pages/inventory', {
            foodInfo: results
        });
    })
})

app.get('/homedash', (req, res) => {
    req.session.user_id = tempId;
    con.query('SELECT food_id, food_name, custom_user_id, expiry_time - DATEDIFF(CURDATE(), purchase_time) AS days_to_expiry FROM user_data LEFT JOIN foods ON foods.id = user_data.food_id WHERE user_id = ? ORDER BY days_to_expiry ASC', [req.session.user_id], (err, results, fields) => {
        if (err) throw err;
        res.render('pages/homedash', {
            expiringFoods: results
        });
    })
});

app.post('/homedash', (req, res) => {
    req.session.user_id = 1;
    purchase_time = req.body.time;
    console.log(req.body.time);

    con.query('UPDATE user_data SET purchase_time = CURRDATE() WHERE user_id = (?) AND food_id = (?)', [req.session.user_id, ])
});

app.post('/icons-to-home', (req, res) => {
    console.log(req.body.si)
    var selectedItem = req.body.si;
    var currentUser = 1; //this should be req.sessions.user_id
    con.query('DELETE FROM user_data WHERE user_id = 1', (err, results, fields) => {
        if (err) throw err;
        console.log('deleted all rows for current user...')
    })

    for (let i in selectedItem) {
        con.query('INSERT INTO user_data (user_id, food_id, purchase_time) VALUES (?,?,CURDATE())', [1, selectedItem[i]], (err, results, fields) => {
            if (err) throw err;
            console.log(`Added food_id of ${selectedItem[i]} into user_data table, current user : ${currentUser}...`);
        })
    }
});

app.listen(3000, () => {
    console.log('Listening on port 3000...')
})