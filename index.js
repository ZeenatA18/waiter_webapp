const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const flash = require('express-flash');
const session = require('express-session');
const app = express();

const waiter = require('./waiter.ff');
const routes = require('./routes/routes')
const pgp = require('pg-promise')();

const ShortUniqueId = require("short-unique-id");
const uid = new ShortUniqueId({ length: 10 });

let useSSL = false;
let local = process.env.LOCAL || false;
if (process.env.DATABASE_URL && !local) {
    useSSL = true;
}

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:pg123@localhost:5432/coffee_shop';

const config = {
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
}

const db = pgp(config);

const waiterSchedule = waiter(db);
// const waiterRoutes = routes(waiterSchedule);

app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(session({
    secret: "This is my long String that is used for session",
    resave: false,
    saveUninitialized: true
}));

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(flash());

app.get('/', async function (req, res) {

    res.render('index', {
codex:req.session.codex
    })
})

app.post('/register', async function (req, res) {
    let user = req.body.uname.charAt(0).toUpperCase() + req.body.uname.slice(1).toLowerCase();
    let alphabet = /^[a-z A-Z]+$/
    let results = await waiterSchedule.duplicate(user)

 
    if (results.length !== 0){
        req.flash('sukuna', 'Username already exists');
    }
    else if(alphabet.test(user) == false){
        req.flash('sukuna', 'Please use Alphabets only')
    }


   else if (results.length === 0) {
        let password = uid();
        req.flash('sukuna', "Hi, here is you code to login__" + password)
        await waiterSchedule.storedNames(user, password)

    }
    // else {req.flash('sukuna', 'Username already exists');}

    res.redirect('back')

})

app.post('/login', async function (req, res) {
    let user = req.body.uname
let code = req.body.psw
console.log(code);
var username = await waiterSchedule.greet(user)
var codex = await waiterSchedule.code(code)
console.log(codex);
    // console.log(username)
    var name = username.waiters

    if(!username){
        req.flash('sukuna', 'Please register first')
    }else if (username, codex){
req.session.codex = codex
        res.redirect(`waiters/${name}`)
    }


})

app.post('/login_admin', async function (req, res) {
    let user = req.body.uname

    var username = await waiterSchedule.greet(user)
    // console.log(username)
    // var name = username.waiters

    if(!username){
        req.flash('sukuna', 'Please register first')
    }

    res.redirect('/days')


})

app.get('/waiters/:uname', async function (req, res) {
    let username = req.params.uname
    let user = await waiterSchedule.getUserId(username)
    // console.log("uygf",user)
    let checked = await waiterSchedule.checkedDays(user.id)
    console.log(checked);

    res.render('days', {
        uname: username,
        checked
    })
})

app.post('/waiters/:uname', async function (req, res) {
    let available_days = req.body.weekdays

    let username = req.params.uname
    // console.log(available_days)

// if()

       if(available_days && username){
    await waiterSchedule.schedule(username, available_days)
    req.flash('success', "Your available days has been saved.")
       }


    res.render('days', {
        uname: username
    })
})


app.get('/days', async function (req, res) {



 let monday = await waiterSchedule.getUserForDay("Monday")
 let tuesday = await waiterSchedule.getUserForDay("Tuesday")
 let wednesday = await waiterSchedule.getUserForDay("Wednesday")
 let thursday = await waiterSchedule.getUserForDay("Thursday")
 let friday = await waiterSchedule.getUserForDay("Friday")
 let saterday = await waiterSchedule.getUserForDay("Saterday")
 let sunday = await waiterSchedule.getUserForDay("Sunday")

await waiterSchedule.colorChange()
 
    res.render('schedule', {
        monday,
        tuesday,
        wednesday,
        thursday,
        friday,
        saterday,
        sunday
    })
})

app.get('/resets', async function (req, res) {

await waiterSchedule.reset()

req.flash('sukuna','You have cleared your schedule')

    res.render('schedule')
})



const PORT = process.env.PORT || 3001;

app.listen(PORT, function () {
    console.log("App started at port:", PORT)
});