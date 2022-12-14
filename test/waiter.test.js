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

    it("Should return false if the person is not the admin", async function () {
        const waiterz = waitersff(db)

        await waiterz.storedNames('Zeenat', 'aayBrUj5Px')


        assert.deepEqual( false, await waiterz.admin());

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
    
    it("Should check if the waiter has check any days", async function () {
        const waiterz = waitersff(db)

        await waiterz.storedNames('Zeenat', 'aayBrUj5Px')
        await waiterz.schedule('Zeenat', [])

        let inner = await waiterz.checkedDays()
      
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

    it("Should return warning if the waiters is less then 3 for Wednesday", async function () {
        const waiterz = waitersff(db)

        await waiterz.storedNames('Zeenat', 'aayBrUj5Px')
        await waiterz.schedule('Zeenat', ['Wednesday'])

        let inner = await waiterz.colorChange()
        // console.log(inner);
        let colorWednesday = inner.find(weekday => {
            if(weekday.id == 3) {
                return weekday
            }
        })
        // console.log(colorWednesday);
      
        assert.deepEqual('warning', colorWednesday.color);

    })

    it("Should return accepted if the waiters is equal to 3 for Monday", async function () {
        const waiterz = waitersff(db)

        await waiterz.storedNames('Zeenat', 'aayBrUj5Px')
        await waiterz.storedNames('Siphokazi', '6icfUetrc2')
        await waiterz.storedNames('Funny', 'qPJCYU7QBm')
        
        await waiterz.schedule('Zeenat', ['Monday'])
        await waiterz.schedule('Funny', ['Monday'])
        await waiterz.schedule('Siphokazi', ['Monday'])

        let inner = await waiterz.colorChange()
        // console.log(inner);
        let colorMonday = inner.find(weekday => {
            if(weekday.id == 1) {
                return weekday
            }
        })
        // console.log(colorWednesday);
      
        assert.deepEqual('good', colorMonday.color);

    })

    it("Should return danger if the waiters is more then 3 for Friday", async function () {
        const waiterz = waitersff(db)

        await waiterz.storedNames('Zeenat', 'aayBrUj5Px')
        await waiterz.storedNames('Siphokazi', '6icfUetrc2')
        await waiterz.storedNames('Funny', 'qPJCYU7QBm')
        await waiterz.storedNames('Cindy', 'cH1mqW24xz')
        
        await waiterz.schedule('Zeenat', ['Friday'])
        await waiterz.schedule('Funny', ['Friday'])
        await waiterz.schedule('Siphokazi', ['Friday'])
        await waiterz.schedule('Cindy', ['Friday'])

        let inner = await waiterz.colorChange()
        // console.log(inner);
        let colorMonday = inner.find(weekday => {
            if(weekday.id == 5) {
                return weekday
            }
        })
        // console.log(colorWednesday);
      
        assert.deepEqual('danger', colorMonday.color);

    })

    it("Should return nothing from the database when you reset", async function () {
        const waiterz = waitersff(db)

        await waiterz.reset()

        assert.deepEqual([], await waiterz.getName());

    })

})