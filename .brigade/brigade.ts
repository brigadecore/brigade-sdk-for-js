import { events, Event, Job, ConcurrentGroup, SerialGroup } from "@brigadecore/brigadier"

const releaseTagRegex = /^refs\/tags\/v([0-9]+(?:\.[0-9]+)*(?:\-.+)?)$/

const img = "node:12.3.1-stretch"
const localPath = "/workspaces/brigade-sdk-for-js"

// A map of all jobs. When a check_run:rerequested event wants to re-run a
// single job, this allows us to easily find that job by name.
const jobs: {[key: string]: (event: Event) => Job } = {}

// Basic tests:

const testUnitJobName = "test-unit"
const testUnitJob = (event: Event) => {
  const job = new Job("test-unit", img, event)
  job.primaryContainer.sourceMountPath = localPath
  job.primaryContainer.workingDirectory = localPath
  job.primaryContainer.command = ["sh"]
  job.primaryContainer.arguments = ["-c", "yarn install && yarn test"]
  return job
}
jobs[testUnitJobName] = testUnitJob

const lintJobName = "lint"
const lintJob = (event: Event) => {
  const job = new Job("lint", img, event)
  job.primaryContainer.sourceMountPath = localPath
  job.primaryContainer.workingDirectory = localPath
  job.primaryContainer.command = ["sh"]
  job.primaryContainer.arguments = ["-c", "yarn install && yarn lint"]
  return job
}
jobs[lintJobName] = lintJob

const publishJobName = "publish"
const publishJob = (event: Event) => {
  const matchStr = event.worker.git.ref.match(releaseTagRegex)
  let version = ""
  if (matchStr) {
    let matchTokens = Array.from(matchStr)
    version = matchTokens[1]
  }
  const job = new Job("publish", img, event)
  job.primaryContainer.sourceMountPath = localPath
  job.primaryContainer.workingDirectory = localPath
  job.primaryContainer.environment = {
    "NPM_TOKEN": event.project.secrets.npmToken
  }
  job.primaryContainer.command = ["sh"]
  job.primaryContainer.arguments = [
    "-c",
    "yarn install && " +
    "yarn build && " +
    "echo '//registry.npmjs.org/:_authToken=${NPM_TOKEN}' > .npmrc && " +
    `yarn publish --new-version ${version} --access public --no-git-tag-version`
  ]
  return job
}
jobs[publishJobName] = publishJob

async function runSuite(event: Event): Promise<void> {
  await new ConcurrentGroup( // Basic tests
    testUnitJob(event),
    lintJob(event)
  ).run()
}

// Either of these events should initiate execution of the entire test suite.
events.on("brigade.sh/github", "check_suite:requested", runSuite)
events.on("brigade.sh/github", "check_suite:rerequested", runSuite)

// This event indicates a specific job is to be re-run.
events.on("brigade.sh/github", "check_run:rerequested", async event => {
  // Check run names are of the form <project name>:<job name>, so we strip
  // event.project.id.length + 1 characters off the start of the check run name
  // to find the job name.
  const jobName = JSON.parse(event.payload).check_run.name.slice(event.project.id.length + 1)
  const job = jobs[jobName]
  if (job) {
    await job(event).run()
    return
  }
  throw new Error(`No job found with name: ${jobName}`)
})

// Pushing new commits to any branch in github triggers a check suite. Such
// events are already handled above. Here we're only concerned with the case
// wherein a new TAG has been pushed-- and even then, we're only concerned with
// tags that look like a semantic version and indicate a formal release should
// be performed.
events.on("brigade.sh/github", "push", async event => {
  const matchStr = event.worker.git.ref.match(releaseTagRegex)
  if (matchStr) {
    // This is an official release with a semantically versioned tag
    await publishJob(event).run()
  } else {
    console.log(`Ref ${event.worker.git.ref} does not match release tag regex (${releaseTagRegex}); not releasing.`)
  }
})

events.process()
