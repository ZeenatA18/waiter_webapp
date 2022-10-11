module.exports = function Waiter(db) {

    async function storedNames(waiter, password) {


        // if (duplicate == null) {
        await db.none('INSERT INTO waiters_key(waiters,password) values($1,$2)', [waiter, password]);
        // }

    }

    async function duplicate(waiter) {
        let db_results = await db.any('SELECT waiters FROM waiters_key WHERE waiters = $1', [waiter]);
        return db_results;
    }

    async function greet(personName) {

        var db_results = await db.one('select waiters from waiters_key where waiters=$1', [personName])
        //   console.log(currentName)
        return db_results

    }

    async function getName() {
        let storedName = await db.manyOrNone('SELECT  waiters from  waiters_key')
        return storedName
    }

    async function reset() {
        let db_results = await db.none('delete from waiters_key')
        return db_results
    }

    async function schedule(user, daysofweek) {

        let day = Array.isArray(daysofweek) === false ? [daysofweek] : daysofweek
        // console.log(day)

        for (let i = 0; i < day.length; i++) {
            // for (let v = 0; v < user.length; i++) {
            const days = day[i]
            const worker = user
            //    console.log(days)

            let weekday_id = await db.one('SELECT id from weekday_key WHERE weekdays=$1', [days])
            // console.log("day id",weekday_id)

            let waiters_id = await db.one('SELECT id from waiters_key WHERE waiters=$1', [worker])
            // console.log("user id",waiters_id)
            await db.none('INSERT INTO schedule(waiters_id, weekday_id) values($1, $2)', [waiters_id.id, weekday_id.id]);
            // }
        }
    }

    async function getUserForDay( weekdays) {
        const db_results = db.manyOrNone('SELECT weekday_key.weekdays, waiters_key.waiters FROM schedule INNER JOIN weekday_key ON schedule.weekday_id = weekday_key.id INNER JOIN waiters_key ON schedule.waiters_id = waiters_key.id WHERE  weekdays = $1', [weekdays])
        return db_results
    }





    return {
        storedNames,
        getName,
        reset,
        greet,
        schedule,
        duplicate,
        getUserForDay
    }
}