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

async function deploySecrets(name = 'vault') {
  const literals = getLiteralsFromEnv()
  const deleteCommand = `kubectl delete secret ${name}`
  const createCommand = `kubectl create secret generic ${name} ${literals}`
  await execAsync(deleteCommand).catch(identity)
  return execAsync(createCommand)
}

if (require.main === module) {
  deploySecrets()
    .then(console.log)
    .catch(console.error)
}
