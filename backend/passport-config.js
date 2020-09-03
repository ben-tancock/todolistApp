const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt');
const { ConnectionBase } = require('mongoose');
//const { Local } = require('protractor/built/driverProviders');

// this function will be called inside server.js
// all of our passport configuration will be done here
function initialize(passport, getUserByUsername){

  // done function, called when we're done authenticating user
  // what we're going to call from login to make sure user is correct
  // putting async there worked! hallelujah!
  const authenticateUser = async (username, password, done) => {
    //console.log("this is the username: " + username);

    // this is an asynchronous function that isn't being returned yet
    const user = await getUserByUsername(username)
    console.log("this is the user id: " + user.id); // undefined


    if(user == null){
      return done(null, false, {message: "no user with that email"})
    }

    try{
      // check to make sure passwords are the same
      // password = pw sent in login form
      // if bcrypt returns true, we have an authenticated user
      /*let testHash = bcrypt.hash("testdata", 10);
      console.log("testhash: " + testHash);
      let testPassword = "testpw";*/
      //console.log("\nthis is passport password: " + password)
      //console.log("\nthis is passport user.password: " + user) // undefined because user object is undefined
      console.log(password + " being compared with " + user[0].password);
      if(bcrypt.compare(password, JSON.stringify(user[0].password))){
        // null = no error (on server end)
        // user = user you want to authenticate with
        return done(null, user)
      } else {
        return done(null, false, {message: "password incorrect"})
      }
    } catch (e){
      return done(e)
    }
  }


  // this means that authenticateUser is called whenever passport.authenticate() is called
  // let's say passport.authenticate was attached to a '/login' POST method
  // that POST request MUST have the fields your function (authenticateUser) requires, with the SAME NAME
  // e.g. {username: <username>, password: <password>, done: <done>}
  // THAT is how authenticateUser gets user data!
  // now, getUserByUsername must be initialized in server.js to be a mongoose function thingymabob!
  passport.use(new LocalStrategy({ usernameField: 'username'}, authenticateUser))

  // serialize user as single id
  // called when the user logs in, decides what is stored in the cookie
  passport.serializeUser((user, done) => done(null, user[0].id))

  // this is supposed to retrieve the whole user object, somehow?
  // called on each request, loads user data based on cookies contents
  passport.deserializeUser((id, done) => {
    return done(null, getUserById(id))
  })
}

// module exports = initialize function
// export so we can call that function by requiring in our passport-config
module.exports = initialize
