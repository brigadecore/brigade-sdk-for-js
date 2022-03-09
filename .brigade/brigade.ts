import { events, Event, Job } from "@brigadecore/brigadier"

const img = "node:12.3.1-stretch"
const localPath = "/workspaces/brigade-sdk-for-js"

// A map of all jobs. When a ci:job_requested event wants to re-run a single
// job, this allows us to easily find that job by name.
const jobs: {[key: string]: (event: Event) => Job } = {}

// Basic tests:

const testUnitJobName = "test-unit"
const testUnitJob = (event: Event) => {
  const job = new Job(testUnitJobName, img, event)
  job.primaryContainer.sourceMountPath = localPath
  job.primaryContainer.workingDirectory = localPath
  job.primaryContainer.command = ["sh"]
  job.primaryContainer.arguments = ["-c", "yarn install && yarn test"]
  return job
}
jobs[testUnitJobName] = testUnitJob

const styleCheckJobName = "style-check"
const styleCheckJob = (event: Event) => {
  const job = new Job(styleCheckJobName, img, event)
  job.primaryContainer.sourceMountPath = localPath
  job.primaryContainer.workingDirectory = localPath
  job.primaryContainer.command = ["sh"]
  job.primaryContainer.arguments = ["-c", "yarn install && yarn style:check"]
  return job
}
jobs[styleCheckJobName] = styleCheckJob

const lintJobName = "lint"
const lintJob = (event: Event) => {
  const job = new Job(lintJobName, img, event)
  job.primaryContainer.sourceMountPath = localPath
  job.primaryContainer.workingDirectory = localPath
  job.primaryContainer.command = ["sh"]
  job.primaryContainer.arguments = ["-c", "yarn install && yarn lint"]
  return job
}
jobs[lintJobName] = lintJob

const auditJobName = "audit"
const auditJob = (event: Event) => {
  const job = new Job(auditJobName, img, event)
  job.primaryContainer.sourceMountPath = localPath
  job.primaryContainer.workingDirectory = localPath
  job.primaryContainer.command = ["sh"]
  job.primaryContainer.arguments = ["-c", "yarn install && yarn audit"]
  job.fallible = true
  return job
}
jobs[auditJobName] = auditJob

const publishJobName = "publish"
const publishJob = (event: Event, version: string) => {
  // We always have a leading v. We need to remove it because NPM doesn't accept
  // it.
  version = version.substr(1)
  const job = new Job(publishJobName, img, event)
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

events.on("brigade.sh/github", "ci:pipeline_requested", async event => {
  await Job.concurrent( // Basic tests
    testUnitJob(event),
    styleCheckJob(event),
    lintJob(event),
    auditJob(event)
  ).run()
})

// This event indicates a specific job is to be re-run.
events.on("brigade.sh/github", "ci:job_requested", async event => {
  const job = jobs[event.labels.job]
  if (job) {
    await job(event).run()
    return
  }
  throw new Error(`No job found with name: ${event.labels.job}`)
})

events.on("brigade.sh/github", "cd:pipeline_requested", async event => {
  const version = JSON.parse(event.payload).release.tag_name
  await publishJob(event, version).run()
})

events.process()
