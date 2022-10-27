module.exports = function routesWaiter(waiterSchedule) {

    async function home(req, res) {

        res.render('index', {
            codex: req.session.codex
        })
    }

    async function register(req, res) {
        let user = req.body.uname.charAt(0).toUpperCase() + req.body.uname.slice(1).toLowerCase();
        let alphabet = /^[a-z A-Z]+$/
        let results = await waiterSchedule.duplicate(user)

        const ShortUniqueId = require("short-unique-id");
        const uid = new ShortUniqueId({ length: 10 });
    
        if (results.length !== 0) {
            req.flash('sukuna', `${user}, Username already exists`);
        }
        else if (alphabet.test(user) == false) {
            req.flash('sukuna', 'Please use Alphabets only')
        }
    
    
        else if (results.length === 0) {
            let password = uid();
            req.flash('sukuna', "Hi, here is you code to login__" + password)
            await waiterSchedule.storedNames(user, password)
    
        }
        // else {req.flash('sukuna', 'Username already exists');}
    
        res.redirect('back')
    
    }

    async function login(req, res) {
        let user = req.body.uname
        let code = req.body.psw
        console.log(code);
        var username = await waiterSchedule.greet(user)
        var codex = await waiterSchedule.code(code)
        console.log(codex);
        // console.log(username)
        var name = username.waiters
    
        if (!username) {
            req.flash('sukuna', 'Please register first')
        } else if (username, codex) {
            req.session.codex = codex
            res.redirect(`waiters/${name}`)
        }else{
            req.flash('sukuna', 'Please check if you typed the correct Username or Code')
            res.redirect('/')
        }
    }

    async function waitersPage(req, res) {
        let username = req.params.uname
        let user = await waiterSchedule.getUserId(username)
        // console.log("uygf",user)
        let checked = await waiterSchedule.checkedDays(user.id)
        console.log(checked);
    
        res.render('days', {
            uname: username,
            checked
        })
    }

    async function waitersDays(req, res) {
        let available_days = req.body.weekdays
    
        let username = req.params.uname
        
        if (available_days && username) {
            await waiterSchedule.schedule(username, available_days)
    
            req.flash('success', "Your available days has been saved.")
        }
        res.redirect("back")
    }

    async function login_admin(req, res) {
        let user = req.body.uname
    
        var username = await waiterSchedule.greet(user)
    
        if (!username) {
            req.flash('sukuna', 'Please register first')
        }
    
        res.redirect('/days')
    }

    async function schedule(req, res) {

        let monday = await waiterSchedule.getUserForDay("Monday")
        let tuesday = await waiterSchedule.getUserForDay("Tuesday")
        let wednesday = await waiterSchedule.getUserForDay("Wednesday")
        let thursday = await waiterSchedule.getUserForDay("Thursday")
        let friday = await waiterSchedule.getUserForDay("Friday")
        let saterday = await waiterSchedule.getUserForDay("Saterday")
        let sunday = await waiterSchedule.getUserForDay("Sunday")
    
        let color = await waiterSchedule.colorChange()
        // console.log(color);
    
    
    
        res.render('schedule', {
            monday,
            tuesday,
            wednesday,
            thursday,
            friday,
            saterday,
            sunday,
            color
        })
    }

    async function deleteWorkersOnDay(req, res) {

        const waiterday = req.params.waiterday
        if(waiterday != "all"){
            await waiterSchedule.dlte_day(waiterday)

        } else if (waiterday == "all"){
            await waiterSchedule.reset()  
        }
    
        // await waiterSchedule.reset()
        req.flash('sukuna', 'Cleared')
        res.redirect("back")
    }

    async function logout(req, res) {

        delete req.session.codex
    
        // req.flash('sukuna', 'Thanks for using Zeenat app')
    
        res.render('index')
    }

    return {
        home,
        register,
        login,
        waitersPage,
        waitersDays,
        login_admin,
        schedule,
        deleteWorkersOnDay,
        logout
       
    }
}