const staging = {
    api: {
        host: 'http://localhost:8080/api',
        refresh: 10000,
    },
    login: {
        forward: {
            delay: 3000
        },
        forgot: {
            url: 'https://profile.callofduty.com/cod/login'
        }
    },
    filters: {
        default: {
            stats: {
                teamPlacement: { max: 20 }
            },
            sort: {
                order: 1,
                limit: 100,
                prop: 'startTime',
            }
        }
    },
    docs: {
        postman: {
            url: 'https://documenter.getpostman.com/view/5519582/SzzgAefq'
        }
    }
}

const production = {
    ...staging,
    api: {
        host: 'https://stagg.co/api',
        refresh: 10000,
    }
}

export default process.env.NODE_ENV === 'development' ? staging : production
