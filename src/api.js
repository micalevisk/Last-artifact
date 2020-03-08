// @ts-check
const admZip = require('adm-zip')

/**
 *
 * @param {string} entryName
 * @param {Buffer} buff
 * @returns {string|undefined}
 */
const getZipBufferEntryContent = (entryName, buff) => {
  const zip = new admZip(buff)
  const zipEntries = zip.getEntries()
  for (const entry of zipEntries) {
    if (entry.entryName === entryName) {
      return zip.readAsText(entry)
    }
  }
}

module.exports = class API {

  constructor(github) {
    this.github = github
  }

  /**
   *
   * @param {string} repository The owner and the repo name separated by slash (`/`).
   * @returns {number|null}
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
   * @param {string} entryName
   * @returns {Promise<{content:string,found:boolean}>}
   */
  getArtifactEntryContent(repository, artifactId, entryName) {
    return this.github
      // https://developer.github.com/v3/actions/artifacts/#download-an-artifact
      .request('GET /repos/:owner_slash_repo/actions/artifacts/:artifact_id/zip', {
        owner_slash_repo: repository,
        artifact_id: artifactId,
      })
      .then(res => res.data)
      .then(arrayBuffer => Buffer.from(arrayBuffer))
      .then((buff) => {
        const content = getZipBufferEntryContent(entryName, buff)
        const found = (typeof content !== 'undefined')
        return { content, found }
      })
  }

}
