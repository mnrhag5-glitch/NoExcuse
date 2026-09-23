// let express = require('express')
// let cookie = require('cookie-parser')
// let app = express();
// let userRoute = require('./routes/user.routes')
// let taskRoute = require('./routes/task.routes') 
// let cors = require('cors')

// app.use(cookie())

// app.use(cors({
//     origin: 'https://noexcuse-1.onrender.com',
//     credentials: true
// }))


// app.use((req, res, next) => {
//     const origin = req.headers.origin
//     if (origin === 'http://localhost:5173' || origin === 'http://127.0.0.1:5173') {
//         res.header('Access-Control-Allow-Origin', origin)
//         res.header('Access-Control-Allow-Credentials', 'true')
//     }
//     res.header('Access-Control-Allow-Headers', 'Content-Type')
//     res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
//     if (req.method === 'OPTIONS') return res.sendStatus(204)
//     next()
// })

// app.get('/',(req,res)=>{
//     res.send("is it working...?????")
// })
// app.use(express.json());
// app.use('/api/user/',userRoute)
// app.use('/api/task/',taskRoute)




// module.exports = app;


//----------------------------------------- gpt ka code---------------------------------





let express = require('express')
let cookie = require('cookie-parser')
let cors = require('cors')

let app = express()

let userRoute = require('./routes/user.routes')
let taskRoute = require('./routes/task.routes')


app.use(cookie())

app.use(cors({
    origin: 'https://noexcuse-1.onrender.com',
    credentials: true
}))


app.use(express.json())


app.get('/', (req, res) => {
    res.send("is it working...?????")
})


app.use('/api/user/', userRoute)
app.use('/api/task/', taskRoute)


module.exports = app