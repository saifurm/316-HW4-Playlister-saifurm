import { beforeAll, beforeEach, afterEach, afterAll, expect, test } from 'vitest';
const dotenv = require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose')

/**
 * Vitest test script for the Playlister app's Mongo Database Manager. Testing should verify that the Mongo Database Manager 
 * will perform all necessarily operations properly.
 *  
 * Scenarios we will test:
 *  1) Reading a User from the database
 *  2) Creating a User in the database
 *  3) ...
 * 
 * You should add at least one test for each database interaction. In the real world of course we would do many varied
 * tests for each interaction.
 */

/**
 * Executed once before all tests are performed.
 */
beforeAll(async () => {
    // SETUP THE CONNECTION VIA MONGOOSE JUST ONCE - IT IS IMPORTANT TO NOTE THAT INSTEAD
    // OF DOING THIS HERE, IT SHOULD BE DONE INSIDE YOUR Database Manager (WHICHEVER)
    await mongoose
        .connect(process.env.DB_CONNECT, { useNewUrlParser: true })
        .catch(e => {
            console.error('Connection error', e.message)
        })
});

/**
 * Executed before each test is performed.
 */
beforeEach(() => {
});

/**
 * Executed after each test is performed.
 */
afterEach(() => {
});

/**
 * Executed once after all tests are performed.
 */
afterAll(() => {
});

/**
 * Vitest test to see if the Database Manager can get a User.
 */
test('Test #1) Reading a User from the Database', () => {
    // FILL IN A USER WITH THE DATA YOU EXPECT THEM TO HAVE
    const expectedUser = {
        // FILL IN EXPECTED DATA
    };

    // THIS WILL STORE THE DATA RETRUNED BY A READ USER
    const actualUser = {};

    // READ THE USER
    // actualUser = dbManager.somethingOrOtherToGetAUser(...)

    // COMPARE THE VALUES OF THE EXPECTED USER TO THE ACTUAL ONE
    expect(expectedUser.firstName, actualUser.firstName)
    expect(expectedUser.lastName, actualUser.lastName);
    // AND SO ON
});

/**
 * Vitest test to see if the Database Manager can create a User
 */
test('Test #2) Creating a User in the Database', () => {
    // MAKE A TEST USER TO CREATE IN THE DATABASE
    const testUser = {
        // FILL IN TEST DATA, INCLUDE AN ID SO YOU CAN GET IT LATER
    };

    // CREATE THE USER
    // dbManager.somethingOrOtherToCreateAUser(...)

    // NEXT TEST TO SEE IF IT WAS PROPERLY CREATED

    // FILL IN A USER WITH THE DATA YOU EXPECT THEM TO HAVE
    const expectedUser = {
        // FILL IN EXPECTED DATA
    };

    // THIS WILL STORE THE DATA RETRUNED BY A READ USER
    const actualUser = {};

    // READ THE USER
    // actualUser = dbManager.somethingOrOtherToGetAUser(...)

    // COMPARE THE VALUES OF THE EXPECTED USER TO THE ACTUAL ONE
    expect(expectedUser.firstName, actualUser.firstName)
    expect(expectedUser.lastName, actualUser.lastName);
    // AND SO ON

});

// THE REST OF YOUR TEST SHOULD BE PUT BELOW