// @ts-check
const { Octokit } = require('@octokit/action')
const admZip = require('adm-zip')

/**
 *
 * @param {Buffer} buff
 * @returns {{[k:string]:string}}
 */
const mapEntries = (buff) => {
  const zip = new admZip(buff)
  const zipEntries = zip.getEntries()
  return zipEntries.reduce((acum, entry) => {
    if (entry.isDirectory) { // skip directories
      return acum
    }
    acum[ entry.entryName ] = zip.readAsText(entry)
    return acum
  }, {})
}

module.exports = class API {

  constructor() {
    this.github = new Octokit()
  }

  /**
   *
   * @param {string} repository The owner and the repo name separated by slash (`/`).
   * @returns {Promise<number|null>}
   */
  getLastArtifactId(repository) {
    return this.github
      // https://developer.github.com/v3/actions/artifacts/#list-artifacts-for-a-repository
      .request('GET /repos/:owner_slash_repo/actions/artifacts?per_page=1', {
        owner_slash_repo: repository,
      })
      .then(res => res.data)
      .then(({ total_count, artifacts }) => {
        if (total_count > 0) return artifacts[0].id
        return null
      })
  }

  /**
   *
   * @param {string} repository The owner and the repo name separated by slash (`/`).
   * @param {string|number} artifactId
   * @returns {Promise<{[k:string]:string}>}
   */
  getArtifactEntryContent(repository, artifactId) {
    return this.github
      // https://developer.github.com/v3/actions/artifacts/#download-an-artifact
      .request('GET /repos/:owner_slash_repo/actions/artifacts/:artifact_id/zip', {
        owner_slash_repo: repository,
        artifact_id: artifactId,
      })
      .then(res => res.data)
      .then(arrayBuffer => Buffer.from(arrayBuffer))
      .then(mapEntries)
  }

}
