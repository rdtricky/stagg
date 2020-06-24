const fs = require('fs');
const yaml = require('js-yaml');
// Translate GCP Secrets into ENV Vars
const envVars = ['DISCORD_TOKEN', 'MONGO_DB', 'MONGO_HOST', 'MONGO_USER', 'MONGO_PASS']
const templateYaml = fs.readFileSync(`${__dirname}/app.yaml`, 'utf8')
const [objYaml] = yaml.safeLoadAll(templateYaml)
for(const v of envVars) {
    objYaml.env_variables[v] = fs.readFileSync(`${__dirname}/.env.${v}`, 'utf8').trim()
    fs.unlinkSync(`${__dirname}/.env.${v}`)
}
const genericYaml = yaml.safeDump(objYaml)
const services = ['api', 'discord', 'download', 'scrape'] // ui does not take env vars
console.log('[+] Secret app.yaml generated')
for(const service of services) {
    const serviceYaml = genericYaml.replace('<% SERVICE %>', service)
    fs.writeFileSync(`${__dirname}/../services/${service}/app.yaml`, serviceYaml, 'utf8')
    console.log(`    ${service}/app.yaml ready`)
}
// Copy common modules to services
const commonServices = ['api', 'mongo']
for(const service of services) {
    for(const commonModule of commonServices) {
        const serviceCommonDir = `${__dirname}/../services/${service}/common/`
        if (!fs.existsSync(serviceCommonDir)) fs.mkdirSync(serviceCommonDir)
        const commonModuleSrc = fs.readFileSync(`${__dirname}/../common/${commonModule}.ts`, 'utf8')
        fs.writeFileSync(`${serviceCommonDir}/${commonModule}.ts`, commonModuleSrc, 'utf8')
    }
}