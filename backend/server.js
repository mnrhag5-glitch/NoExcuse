require('dotenv').config();
let app = require('./src/app')
let connectDB = require('./src/db/db')

const port = process.env.PORT || 3000

async function startServer() {
    try {
        await connectDB()
        app.listen(port, () => {
            console.log('Server is running on port : ' + port)
        })
    } catch (error) {
        console.error('MongoDB startup failed:', error.message)
        process.exitCode = 1
    }
}

startServer()
