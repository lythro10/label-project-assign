const core = require('@actions/core')
const { wait } = require('./wait')
const github = require('@actions/github')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    console.log('Hello George')
    const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN')
    const octokit = github.getOctokit(GITHUB_TOKEN)

    console.log(github.context.repo)
    console.log(github.context.issue.number)
    console.log(octokit.request.arguments)
    console.log('Finish script')
  } catch (error) {
    // Fail the workflow run if an error occurs
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}
