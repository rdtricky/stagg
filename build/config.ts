// .env is only used for local
require('dotenv').config()
export interface Config {
    port: number
    io: {
        delay: number
    }
    api: {
        retry: number
        delay: number
        failures: number
    }
    mongo: {
        db: string
        host: string
        user: string
        pass: string
    }
    scrape: {
        wait: number
    }
    discord: {
        token: string
    }
}
export default {
    port: process.env.PORT || 8080,
    io: {
        delay: 150,
    },
    api: {
        retry: 3,
        delay: 100,
        failures: 1,
    },
    mongo: {
        db: process.env.MONGO_DB,
        host: process.env.MONGO_HOST,
        user: process.env.MONGO_USER,
        pass: process.env.MONGO_PASS,
    },
    scrape: {
        wait: 3000
    },
    discord: {
        token: process.env.DISCORD_TOKEN,
    }
} as Config
