// @ts-check
const core = require('@actions/core')

const API = require('./api')

const getInputs = () => ({
  repository: core.getInput('repository', { required: true }),
})

const main = async () => {
  core.setOutput('loaded', 'false')

  const { repository } = getInputs()
  core.info(`Using repo: ${repository}`)

  const api = new API()
  const artifactId = await api.getLastArtifactId(repository)
  if (artifactId !== null) {
    const entries = await api.getArtifactEntryContent(repository, artifactId)
    const strContent = JSON.stringify(entries)
    core.debug(`Setting output 'content' to the string '${strContent}'`)
    core.setOutput('content', strContent)
    core.debug(`Setting output 'loaded' to the string 'true'`)
    core.setOutput('loaded', 'true')
  }
}

/**
 *
 * @param {Error} err
 */
const handleError = (err) => {
  console.error(err)
  if (err && err.message) {
    core.setFailed(err.message)
  } else {
    core.setFailed(`Unhandled error: ${err}`)
  }

  process.exit(1)
}

process.on('unhandledRejection', handleError)

main().catch(handleError)
