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
    console.log('Hello George')

    console.log(github.context.repo)
    console.log(github.context.issue.number)
    getIssueBody()
    console.log('Finish script')
  } catch (error) {
    // Fail the workflow run if an error occurs
    core.setFailed(error.message)
  }
}

async function addComment() {
  await githubOctokit.request(
    'POST /repos/{owner}/{repo}/issues/{issue_number}/comments',
    {
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: github.context.issue.number,
      body: 'Hi Tester, your comment was added.'
    }
  )
}

async function getIssueBody() {
  const result = await githubOctokit.request(
    'GET /repos/{owner}/{repo}/issues/{issue_number}',
    {
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: github.context.issue.number
    }
  )
  const body = result.data.body
  const match = body.match(
    /### Select for which system is your request \*\s*([\s\S]*?)\s*(?:###|$)/
  )
  if (match) {
    const selectedSystem = match
    console.log(`Selected System: ${selectedSystem}`)
  }

  octokit.rest.issues.addLabels({
    owner,
    repo,
    issue_number,
    labels: ['test', 'moodle_bug_test']
  })
}

module.exports = {
  run
}
