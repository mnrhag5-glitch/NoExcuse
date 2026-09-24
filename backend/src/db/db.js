const mongoose = require('mongoose')
const dns = require('dns')

// Use public resolvers when the local/host resolver refuses MongoDB SRV queries.
dns.setServers(['1.1.1.1', '8.8.8.8'])

async function connectDB() {
    const mongoUri = process.env.MONGODB_URI || process.env.mongoDB_URI
    if (!mongoUri) {
        throw new Error('MONGODB_URI is not configured')
    }
    if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
        throw new Error('MONGODB_URI must start with mongodb:// or mongodb+srv://')
    }

    mongoose.connection.on('disconnected', () => {
        console.error('MongoDB disconnected')
    })
    mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected')
    })

    const connectionOptions = {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10
    }

    for (let attempt = 1; attempt <= 5; attempt += 1) {
        try {
            await mongoose.connect(mongoUri, connectionOptions)
            console.log('MongoDB connected successfully')
            return
        } catch (error) {
            await mongoose.disconnect()
            if (attempt === 5) throw error
            console.error(`MongoDB connection attempt ${attempt}/5 failed: ${error.message}`)
            await new Promise((resolve) => setTimeout(resolve, 5000))
        }
    }
}

module.exports = connectDB