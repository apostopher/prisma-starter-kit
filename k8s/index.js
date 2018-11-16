import { exec } from 'child_process'

import Bluebird from 'bluebird'
import keys from 'lodash/keys'
import startsWith from 'lodash/startsWith'
import reduce from 'lodash/reduce'
import identity from 'lodash/identity'

const execAsync = Bluebird.promisify(exec)

function getLiteralsFromEnv() {
  const literals = reduce(
    keys(process.env),
    (acc, key) => {
      if (startsWith(key, 'K8S_')) {
        acc.push(`--from-literal=${key}=${process.env[key]}`)
      }
      return acc
    },
    [],
  )
  return literals.join(' ')
}

async function deploySecrets({ name = 'vault', namespace = 'prisma' } = {}) {
  const literals = getLiteralsFromEnv()
  const deleteCommand = `kubectl delete secret ${name} --namespace=${namespace}`
  const createCommand = `kubectl create secret generic ${name} ${literals} --namespace=${namespace}`
  await execAsync(deleteCommand).catch(identity)
  return execAsync(createCommand)
}

function deployNamespace() {
  return execAsync('kubectl apply -f namespace.yml', { cwd: __dirname })
}

async function deployDatabase() {
  await execAsync('kubectl apply -f pvc.yml', { cwd: __dirname })
  await execAsync('kubectl apply -f db.yml', { cwd: __dirname })
  return execAsync('kubectl apply -f dbService.yml', { cwd: __dirname })
}

async function deployPrisma() {
  await execAsync('kubectl apply -f prismaConfig.yml', { cwd: __dirname })
  await execAsync('kubectl apply -f prisma.yml', { cwd: __dirname })
  return execAsync('kubectl apply -f prismaService.yml', { cwd: __dirname })
}

async function deploy() {
  await deployNamespace()
  await deploySecrets()
  await deployDatabase()
  return deployPrisma()
}

if (require.main === module) {
  deploy()
    .then(console.log)
    .catch(console.error)
}
