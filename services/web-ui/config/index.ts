import staging from './staging'
import production from './production'
export default process.env.NODE_ENV === 'development' ? staging : production
