// .env is only used for local
require('dotenv').config()
export interface Config {
    port: number
    mongo: {
        db: string
        host: string
        user: string
        password: string
    }
    jwt: string
    gmail: {
        user: string
        pass: string
    }
}
export default {
    port: process.env.PORT || 8080,
    jwt: process.env.JWT_SECRET,
    mongo: {
        db: process.env.MONGO_DB,
        host: process.env.MONGO_HOST,
        user: process.env.MONGO_USER,
        password: process.env.MONGO_PASS,
    },
    gmail: {
        user: process.env.GMAIL_ADDRESS,
        pass: process.env.GMAIL_PASSWORD,
    },
} as Config
