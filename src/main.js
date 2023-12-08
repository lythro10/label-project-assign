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

const selected_system = core.getInput('selected_system')

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

    const all_selected_system = selected_system.split(',').map(s => s.trim())
    console.log(all_selected_system)
    // Extract the system value from the issue body
    const body = issue.body || ''
    const match = body.match(
      /### Select for which system is your request \*\s*([\s\S]*?)\s*(?:###|$)/
    )

    if (match) {
      const selectedSystem = match[1].trim().toLowerCase()
      console.log(`Selected System: ${selectedSystem}`)
      console.log(all_selected_system.includes(selectedSystem))
    } else {
      console.log('Failed to extract the selected system from the issue body.')
    }
  } catch (error) {
    console.error('Error:', error.message || error)
    process.exit(1)
  }
}

async function labelAPI(labels) {
  // Adds Labels to issue
  await octokit.issues.addLabels({
    owner,
    repo,
    issue_number,
    labels
  })
}

async function assignUser(assignees) {
  // Only users who have access to repo can be assigned otherwise user will be ignored.
  await octokit.rest.issues.addAssignees({
    owner,
    repo,
    issue_number,
    assignees
  })
}

module.exports = {
  run
}
