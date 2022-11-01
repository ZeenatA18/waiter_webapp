module.exports = function Waiter(db) {

    // insert code and name and getting name and code

    async function storedNames(waiter, password) {
        await db.none('INSERT INTO waiters_key(waiters,password) values($1,$2)', [waiter, password]);
    }

    async function code(codex) {
        var db_results = await db.oneOrNone('select password from waiters_key where password=$1', [codex])
        return db_results
    }

    async function getName() {
        let storedName = await db.manyOrNone('SELECT  waiters from  waiters_key')
        return storedName
    }


    // getting for user and days // keeping days checked

    async function schedule(user, daysofweek) {

        let day = Array.isArray(daysofweek) === false ? [daysofweek] : daysofweek

        const worker = user
        let waiters_id = await db.one('SELECT id from waiters_key WHERE waiters=$1', [worker])

        await db.none('DELETE FROM schedule WHERE  waiters_id = $1', [waiters_id.id])

        for (let i = 0; i < day.length; i++) {
            const days = day[i]

            let weekday_id = await db.one('SELECT id from weekday_key WHERE weekdays=$1', [days])

            await db.none('INSERT INTO schedule(waiters_id, weekday_id) values($1, $2)', [waiters_id.id, weekday_id.id]);

        }
    }

    async function getUserForDay(weekdays) {
        const db_results = db.manyOrNone('SELECT weekday_key.weekdays, waiters_key.waiters FROM schedule INNER JOIN weekday_key ON schedule.weekday_id = weekday_key.id INNER JOIN waiters_key ON schedule.waiters_id = waiters_key.id WHERE  weekdays = $1', [weekdays])
        return db_results
    }

    async function checkedDays(waiter) {
        let userDays = await db.manyOrNone('SELECT weekday_key.weekdays FROM schedule JOIN weekday_key ON schedule.weekday_id = weekday_key.id WHERE waiters_id = $1', [waiter])
        userDays = userDays.map(obj => obj.weekdays)

        let days = await db.manyOrNone('SELECT * from weekday_key')
        days = days.map(obj => obj.weekdays)

        let checked = []

        for (let i = 0; i < days.length; i++) {
            checked.push(userDays.includes(days[i]))
        }

        return checked

    }

    async function colorChange() {
        let days = await db.manyOrNone('SELECT * from weekday_key')

        for (let weekday of days) {

            let use = await db.manyOrNone('SELECT count(*) FROM schedule WHERE weekday_id = $1', [weekday.id])
            let uses = use[0].count

            if (uses > 3) {
                // adding the danger class will make the text red
                weekday.color = "danger";
            }
            else if (uses == 3) {
                weekday.color = "good";
            } else if (uses < 3) {
                weekday.color = "warning"
            }
        }
        return days;

    }

    //deleting

    async function reset() {
        let db_results = await db.none('truncate schedule')
        return db_results
    }

    async function dlte_day(weekday) {
        let day = await db.oneOrNone('select * from weekday_key where weekdays = $1', [weekday])
        await db.none('Delete from schedule where weekday_id = $1', [day.id])
    }

    //gettings users

    async function getUserId(user) {
        let users = await db.oneOrNone("SELECT * FROM waiters_key WHERE waiters = $1", [user])
        return users
    }


    async function duplicate(waiter) {
        let db_results = await db.any('SELECT waiters FROM waiters_key WHERE waiters = $1', [waiter]);
        return db_results;
    }

    async function greet(personName) {
        var db_results = await db.oneOrNone('select waiters from waiters_key where waiters=$1', [personName])
        return db_results
    }

    async function admin(code){
        let db_results = await db.oneOrNone("select * from waiters_key where waiters = 'Admin' and password = $1", [code])
        return db_results != null
    }


    return {
        storedNames,
        getName,
        reset,
        greet,
        schedule,
        duplicate,
        getUserForDay,
        checkedDays,
        getUserId,
        code,
        colorChange,
        dlte_day,
        admin
    }
}