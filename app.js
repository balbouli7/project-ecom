const express = require('express')
const session = require('express-session');
const dotenv=require('dotenv')
const connectDB=require('./config/database')
const userRoutes=require('./routes/userRoutes')
const productRoutes = require('./routes/productRoutes'); // Importez les routes produits
const commandRoutes = require('./routes/commandRoutes');
const deliveryRoutes=require('./routes/deliveryRoutes')
const cors=require('cors')
dotenv.config()
const app= express()
const bodyParser=require("body-parser")
const PORT=process.env.PORT||3000

connectDB()
app.use(cors())
app.use(bodyParser.json())
app.use(express.json())
app.use(
    session({
      secret: process.env.SESSION_SECRET || 'your-secret-key',
      resave: false, // Do not save session if unmodified
      saveUninitialized: false, // Do not create a session until something is stored
      cookie: { secure: false }, // Set to true for HTTPS in production
    })
  );
app.use('/api',userRoutes)
app.use('/api',productRoutes)
app.use('/api',commandRoutes)
app.use('/api',deliveryRoutes)
app.listen(PORT,()=>{
    console.log(`server running : http://localhost:${PORT}`)
 })