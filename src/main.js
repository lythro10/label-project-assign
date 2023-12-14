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
const set_labels = core.getInput('selected_system_label')
let stringToMatch = core.getInput('StringToMatch')
stringToMatch = `"${stringToMatch}"`
console.log(`String to match is the follwoing ${stringToMatch}`)
const regex = new RegExp(stringToMatch)
console.log('Labels are below')
console.log(set_labels)

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
    // Slits by , then trims and white space in front of at last .
    const all_selected_system = selected_system.split(',').map(s => s.trim())
    console.log(all_selected_system)
    // Extract the system value from the issue body
    const body = issue.body || ''
    const match = body.match(regex)
    console.log(match)
    // const match = body.match(
    //   /### Select for which system is your request \*\s*([\s\S]*?)\s*(?:###|$)/
    // )

    if (match) {
      const selectedSystem = match[1].trim().toLowerCase()
      console.log(`Selected System: ${selectedSystem}`)
      console.log(all_selected_system.includes(selectedSystem))
      if (all_selected_system.includes(selectedSystem)) {
        const nameForLabel = `${selectedSystem}_label`
        const assigneesForLabel = `${selectedSystem}_assignees`

        // Gets from Environment from workflow
        let labelsForSystem = process.env[nameForLabel]
        labelsForSystem = makeToArray(labelsForSystem)

        // selected_system.split(',').map(s => s.trim())
        let assigneesForSystem = process.env[assigneesForLabel]
        assigneesForSystem = makeToArray(assigneesForSystem)

        console.log(assigneesForLabel)
        console.log(nameForLabel)
        console.log(labelsForSystem)
        console.log(assigneesForSystem)
        assignUser(assigneesForSystem)
        labelAPI(labelsForSystem)
      }
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

function makeToArray(inputString) {
  const resultArray = inputString.split(',').map(s => s.trim())
  return resultArray
}
module.exports = {
  run
}
