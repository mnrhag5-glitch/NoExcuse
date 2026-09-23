let app = require('./src/app')
require('dotenv').config();
let connectDB = require('./src/db/db')

connectDB()

app.listen(3000,()=>{
    console.log('Server is running on port : 3000')
})


