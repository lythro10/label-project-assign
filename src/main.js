const core = require('@actions/core')
const { wait } = require('./wait')
const github = require('@actions/github')
const { Octokit } = require('@octokit/rest')
const fetch = require('node-fetch')
const { getOctokit } = require('@actions/github')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
// Token gets the input from the workflow
const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN')
const githubOctokit = github.getOctokit(GITHUB_TOKEN)
const owner = github.context.repo.owner
const repo = github.context.repo.repo
const issue_number = github.context.issue.number
const baseUrl = process.env.GITHUB_API_URL ?? 'https://api.github.com'

const octokit = new Octokit({
  request: {
    fetch
  },
  auth: GITHUB_TOKEN,
  baseUrl,
  owner,
  repo,
  issue_number
})
async function run() {
  try {
    // Get the issue body
    const { data: issue } = await octokit.issues.get({
      owner,
      repo,
      issue_number
    })

    // Extract the system value from the issue body
    const body = issue.body || ''
    const match = body.match(
      /### Select for which system is your request \*\s*([\s\S]*?)\s*(?:###|$)/
    )

    if (match) {
      const selectedSystem = match[1].trim()
      console.log(`Selected System: ${selectedSystem}`)
      // Use a switch statement to handle different system values
      switch (selectedSystem) {
        case 'UNISIS System':
          console.log(`Adding Label for  System: ${selectedSystem}`)
          await octokit.issues.addLabels({
            owner,
            repo,
            issue_number,
            labels: [`${selectedSystem}`]
          })
          break
        case 'moodle':
          console.log(`Adding Label for  System: ${selectedSystem}`)
          await octokit.issues.addLabels({
            owner,
            repo,
            issue_number,
            labels: [`${selectedSystem}`]
          })
          break

        // Add more cases as needed

        default:
          console.log(`No label added for system: ${selectedSystem}`)
          break
      }
    } else {
      console.log('Failed to extract the selected system from the issue body.')
    }
  } catch (error) {
    console.error('Error:', error.message || error)
    process.exit(1)
  }
}

module.exports = {
  run
}
