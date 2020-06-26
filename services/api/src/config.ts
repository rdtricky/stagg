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
}
export default {
    port: process.env.PORT || 8080,
    mongo: {
        db: process.env.MONGO_DB,
        host: process.env.MONGO_HOST,
        user: process.env.MONGO_USER,
        password: process.env.MONGO_PASS,
    },
} as Config
