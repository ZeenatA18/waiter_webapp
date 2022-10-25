const assert = require('assert');
const waitersff = require('../waiter.ff');
const pgp = require('pg-promise')();

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:pg123@localhost:5432/coffe_shop_test';

const config = {
    connectionString: DATABASE_URL
}

const db = pgp(config);

describe("Coffee shop schedule", function () {

    beforeEach(async function () {
        await db.none("truncate waiters_key, schedule");
    });

    it("Should return the name that is entered", async function () {
        const waiterz = waitersff(db)

        await waiterz.storedNames('Zeenat', 'aayBrUj5Px')


        assert.deepEqual([{ "waiters": "Zeenat" }], await waiterz.getName("Zeenat"));

    })

    it("Should return the code for the user from the database", async function () {
        const waiterz = waitersff(db)

        await waiterz.storedNames('Zeenat', 'aayBrUj5Px')

        assert.deepEqual({ password: 'aayBrUj5Px' }, await waiterz.code('aayBrUj5Px'));

    })

    it("Should return the amount of waiters working for monday ", async function () {
        const waiterz = waitersff(db)

        await waiterz.storedNames('Zeenat', 'aayBrUj5Px')
        await waiterz.schedule('Zeenat', ['Monday'])

        let amountOfWaiters = await waiterz.getUserForDay('Monday')

        assert.equal(1, amountOfWaiters.length);

    })

    
    it("Should return the amount of waiters working for Wednesday ", async function () {
        const waiterz = waitersff(db)
        
        await waiterz.storedNames('Zeenat', 'aayBrUj5Px')
        await waiterz.storedNames('Siphokazi', '6icfUetrc2')
        await waiterz.storedNames('Funny', 'qPJCYU7QBm')
        
        await waiterz.schedule('Zeenat', ['Wednesday'])
        await waiterz.schedule('Funny', ['Wednesday'])
        await waiterz.schedule('Siphokazi', ['Wednesday'])
        
        let amountOfWaiters = await waiterz.getUserForDay('Wednesday')
        
        assert.equal(3, amountOfWaiters.length);
        
        
    })
    
    it("Should return the amount of waiters working for monday ", async function () {
        const waiterz = waitersff(db)

        await waiterz.storedNames('Zeenat', 'aayBrUj5Px')
        await waiterz.schedule('Zeenat', [])

        let inner = await waiterz.checkedDays()
        console.log(inner);
        assert.deepEqual(  [
               false,
               false,
               false,
               false,
               false,
               false,
               false
             ], inner);

    })

    // it("Should return ", async function () {
    //     const waiterz = waitersff(db)
        
    //     await waiterz.storedNames('Zeenat', 'aayBrUj5Px')
    //     await waiterz.storedNames('Siphokazi', '6icfUetrc2')
    //     await waiterz.storedNames('Funny', 'qPJCYU7QBm')
        
    //     await waiterz.schedule('Zeenat', ['Wednesday'])
    //     await waiterz.schedule('Funny', ['Wednesday'])
    //     await waiterz.schedule('Siphokazi', ['Wednesday'])
        
    //     let amountOfWaiters = await waiterz.colorChange()
    //     console.log(amountOfWaiters);
    //     assert.equal(
    //         [
    //         { id: 1, weekdays: 'Monday', color: 'warning' },
    //         { id: 2, weekdays: 'Tuesday', color: 'warning' },
    //         { id: 3, weekdays: 'Wednesday', color: 'good' },
    //         { id: 4, weekdays: 'Thursday', color: 'warning' },
    //         { id: 5, weekdays: 'Friday', color: 'warning' },
    //         { id: 6, weekdays: 'Saturday', color: 'warning' },
    //         { id: 7, weekdays: 'Sunday', color: 'warning' }
    //       ]
    //       , amountOfWaiters);
        
        
    // })

    it("Should return nothing from the database when you reset", async function () {
        const waiterz = waitersff(db)

        await waiterz.reset()

        assert.deepEqual([], await waiterz.getName());

    })

})