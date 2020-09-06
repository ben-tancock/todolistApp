const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt');
const { ConnectionBase } = require('mongoose');

// this function will be called inside server.js
// all of our passport configuration will be done here
function initialize(passport, getUserByUsername){

  // done function, called when we're done authenticating user
  // what we're going to call from login to make sure user is correct
  // putting async there worked! hallelujah!
  const authenticateUser = async (username, password, done) => {
    //console.log("this is the username: " + username);

    // this was asynchronous function that isn't being returned yet
    // await fixed it though
    const user = await getUserByUsername(username)

    // we're going to need to somehow prevent people from creating a user with the same username and password
    if(!user.length || user == null){
      console.log("PASSPORT: user not found, no user with that email \n");
      return done(null, false, {message: "no user with that email"})
    }

    try{

      if(await bcrypt.compare(password, user[0].password)){
        // null = no error (on server end)
        // user = user you want to authenticate with
        console.log("PASSPORT: bcrypt is successful \n");
        return done(null, user)
      } else {
        console.log("PASSPORT: bcrypt returns false on comparison! \n");
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
  passport.serializeUser((user, done) => {
    console.log("\nSerializing User");
    done(null, user[0].id);
  })

  // this is supposed to retrieve the whole user object, somehow?
  // called on each request, loads user data based on cookies contents
  passport.deserializeUser((id, done) => {
    console.log("\nDESERIALIZING USER");
    return done(null, getUserByUsername(id))
  })
}

// module exports = initialize function
// export so we can call that function by requiring in our passport-config
module.exports = initialize
