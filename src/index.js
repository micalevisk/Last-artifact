// @ts-check
const core = require('@actions/core')
const { Octokit } = require('@octokit/action')

const API = require('./api')
const github = new Octokit()

const getInputs = () => ({
  filename: core.getInput('filename', { required: true }),
  repository: core.getInput('repository', { required: true }),
})

const main = async () => {
  core.setOutput('found', 'false')

  const { filename, repository } = getInputs()
  core.info(`Using>> filename: ${filename} | repo: ${repository}`)

  const api = new API(github)

  const artifactId = await api.getLastArtifactId(repository)
  if (artifactId) {
    const {content, found} = await api.getArtifactEntryContent(repository, artifactId, filename)
    if (!found) return
    const strContent = JSON.stringify(content)
    core.debug(`Setting output 'content' to the string '${strContent}'`)
    core.setOutput('content', strContent)
    core.debug(`Setting output 'found' to the string 'true'`)
    core.setOutput('found', 'true')
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

