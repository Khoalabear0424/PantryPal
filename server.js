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

var con

if (process.env.JAWSDB_URL) {
    con = mysql.createConnection(process.env.JAWSDB_URL)

} else {
    con = mysql.createConnection({
        host: "localhost",
        port: 3306,
        user: "root",
        password: "password",
        database: "food_db"
    });
}


con.connect();

app.get('/', (req, res) => {
    res.send('index')
})

app.post('/newUser', (req, res) => {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(req.body.password, salt, (err, p_hash) => {
            con.query('INSERT INTO user_auth(userName, email, password_hash) VALUES(?,?,?)', [req.body.userName, req.body.email, p_hash], (err, results, fields) => {
            })
            res.redirect('/login/' + req.body.email + '/' + p_hash);
        })
    })
})

app.get('/newUser/login/:email/:password', (req, res) => {

    console.log('params.email:', req.params.email);
    console.log('params.password:', req.params.password);

    con.query('SELECT * FROM user_auth WHERE email = ?', [req.params.email], (error, results, fields) => {
        console.log("post login api call..")
        if (error) throw error;

        if (results.length == 0) {
            // res.json({status: 'failed'});
            console.log("login failed");
        } else {
            bcrypt.compare(req.params.password, results[0].password_hash, (err, result) => {

                if (result == true) {
                    req.session.user_id = results[0].id;
                    req.session.email = results[0].email;
                    res.redirect('/inventory');
                    console.log("login success");
                } else {
                    res.json({ status: 'failed' });
                    console.log("login failed")
                    // res.redirect('')
                }
            });
        }
    });
});

app.post('/login', (req, res) => {
    con.query('SELECT * FROM user_auth WHERE email = ?', [req.body.email], (error, results, fields) => {
        console.log("post login api call..")
        if (error) throw error;

        if (results.length == 0) {
            // res.json({status: 'failed'});
            console.log('Login failed. Please go back and try again.');
        } else {
            bcrypt.compare(req.body.password, results[0].password_hash, (err, result) => {

                if (result == true) {
                    req.session.user_id = results[0].id;
                    req.session.email = results[0].email;
                    console.log("login success");
                    res.redirect('/homedash');
                } else {
                    console.log("login failed");
                    res.send('Login failed. Please go back and try again.');
                }
            });
        }
    });
});

app.post('/newCustomIcon', (req, res) => {
    con.query('INSERT INTO foods (food_name, expiry_time, custom_user_id) VALUES (?, ?, ?)', [req.body.foodName, req.body.expiration, req.session.user_id], (err, results, fields) => {
    })
    res.json({ message: 'ok' })
    // res.redirect('/inventory');
});

app.delete('/deleteCustomIcon', (req, res) => {
    console.log(req.body.selectedIcon);
    var query = con.query('DELETE FROM foods WHERE id IN (?)', [req.body.selectedIcon], (err, results, fields) => {
        console.log(query.sql);
        if (err) res.send(err);
        else res.send('Success!');
    })
})

app.get('/inventory', (req, res) => {
    if (!req.session.user_id) {
        res.redirect('non-user.html')
    }
    con.query('SELECT id, food_name, custom_user_id FROM foods WHERE custom_user_id = 0 OR custom_user_id = (?) ORDER BY id ASC;', req.session.user_id, (err, results, fields) => {
        res.render('pages/inventory', {
            foodInfo: results
        });
    })
});

app.get('/show-currently-selected', (req, res) => {
    con.query('SELECT * FROM user_data WHERE user_id = (?)', req.session.user_id, (err, results, fields) => {
        if (err) throw err;
        res.send(results);
    })
})


app.get('/homedash', (req, res) => {
    if (!req.session.user_id) {
        res.redirect('non-user.html')
    }
    con.query('SELECT food_id, food_name, custom_user_id, foods.expiry_time, 24 * expiry_time - TIMESTAMPDIFF(HOUR, IFNULL(purchase_time, 0), CURRENT_TIMESTAMP()) AS hours_to_expiry FROM user_data LEFT JOIN foods ON foods.id = user_data.food_id WHERE user_id = ? ORDER BY hours_to_expiry ASC', [req.session.user_id], (err, results, fields) => {
        if (err) throw err;
        res.render('pages/homedash', {
            expiringFoods: results
        });
    })
})

app.post('/update-purchase_time', (req, res) => {
    con.query('UPDATE user_data SET purchase_time = CURRENT_TIMESTAMP() WHERE user_id = (?) AND food_id = (?)', [req.session.user_id, req.body.food_id]);
    res.redirect('/homedash');
});

app.post('/icons-to-home', (req, res) => {
    console.log(`req.body.si ${req.body.si}`);
    if (req.body.si) {
        var selectedItems = req.body.si.map(x => {
            return parseInt(x);
        });
        con.query('SELECT food_id FROM user_data WHERE user_id = (?)', [req.session.user_id], (err, results, fields) => {
            var resultArr = [];
            for (let i in results) {
                resultArr.push(results[i].food_id);
            }
            var foodToAdd = selectedItems.filter(food => !resultArr.includes(food));
            var foodToDelete = resultArr.filter(food => !selectedItems.includes(food));
            console.log(`Food to add ${foodToAdd}`);
            console.log(`Food to delete ${foodToDelete}`);

            for (let i in foodToAdd) {
                con.query('INSERT INTO user_data (user_id, food_id, added_to_home) VALUES (?,?,1)', [req.session.user_id, foodToAdd[i]], (err, results, fields) => {
                    if (err) throw err;
                })
            }
            console.log(`Added food_id of ${foodToAdd} into user_data table, current user : ${req.session.user_id}...`);
            for (let i in foodToDelete) {
                con.query('DELETE FROM user_data WHERE user_id = (?) AND food_id = (?)', [req.session.user_id, foodToDelete[i]], (err, results, fields) => {
                    if (err) throw err;
                })
            }
            console.log(`Deleted food_id of ${foodToDelete} into user_data table, current user : ${req.session.user_id}...`);
        }
        )
    } else {
        con.query('DELETE FROM user_data WHERE user_id = ?', [req.session.user_id], (err, results, fields) => {
            if (err) throw err;
            console.log('deleted all rows for current user...')
        })
    }
    res.redirect('/homedash');
});

app.delete('/remove-food', (req, res) => {
    var removingItem = req.body.food_id;
    con.query('DELETE FROM user_data WHERE user_id = ? AND food_id = ?', [req.session.user_id, removingItem], (err, results, fields) => {
        if (err) throw err;
        else
            console.log(`Deleted food ${removingItem} of user ${req.session.user_id}..`);
        res.send('success');
    })
})

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        console.log('Successful Log Out...')
        res.redirect('non-user.html')
    })
});

app.get('*', (req, res) => {
    res.redirect('/');
});

var port = (process.env.PORT || 3000);

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})
