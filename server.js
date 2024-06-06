//importing
require('dotenv').config();
const express = require('express')
const app = express()
const path = require('path');
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const {logger} = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const verifyJWT = require('./middleware/verifyjwt')
const credentials = require('./middleware/credentials');
const mongoose = require('mongoose')
const connectDB = require('./config/dbConn')
const cookieParser = require('cookie-parser')
//defining our port for our website(it will have address of localhost)
const PORT = process.env.PORT || 3500

//Connect to MongoDB
connectDB()

//custom middleware logger
app.use(logger)

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);
 
// Cross Origin Resource Sharing
app.use(cors(corsOptions))



// built-in middleware to handle urlencoded form  data
 
app.use(express.urlencoded({ extended: false }))

// built-in middleware for json 
app.use(express.json());

//middleware for cookies
app.use(cookieParser())

//serve static files
app.use(express.static(path.join(__dirname, '/public')))


// routes
app.use('/', require('./routes/root'))
app.use('/register', require('./routes/register'))
app.use('/auth', require('./routes/auth'))
app.use('/refresh', require('./routes/refresh'))
app.use('/logout', require('./routes/logout'))

app.use(verifyJWT)
app.use('/employees', require('./routes/api/employees'))

//This code sets up a route handler for all paths that haven't been matched by any other route in the Express.js application
//The req.accepts() method is used to determine the best response format to send back to the client based on its preferences.
app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ "error": "404 Not Found" });
    } else {
        res.type('txt').send("404 Not Found");
    }
});

app.use(errorHandler)
 
//to enable server to listen for events (should always be at the end of our server.js file)
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})




