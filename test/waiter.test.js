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
        await db.none("delete from waiters_key");
        // let all = await db.any('SELECT * FROM waiters_key')
        // // console.log(all)
    });


    it("Should return the name that is entered", async function () {
        const waiterz = waitersff(db)

        await waiterz.storedNames('Zeenat')
       

        assert.deepEqual([ {"waiters": "Zeenat"}], await waiterz.getName());

    })

    it("Should return nothing from the database when you reset", async function () {
        const waiterz = waitersff(db)

        await waiterz.storedNames('Zeenat');
        await waiterz.reset()

        assert.deepEqual([], await waiterz.getName());

    })

})