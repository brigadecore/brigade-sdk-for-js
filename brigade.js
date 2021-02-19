// ============================================================================
// NOTE: This is a Brigade 1.x script for now.
//
// TODO: Once a Brigade 2 compatible GitHub gateway exists, transition to
// Brigade 2.
// ============================================================================
const { events, Job } = require("brigadier");
const { Check } = require("@brigadecore/brigade-utils");

const releaseTagRegex = /^refs\/tags\/v([0-9]+(?:\.[0-9]+)*(?:\-.+)?)$/;

const img = "node:12.3.1-stretch";
const localPath = "/workspaces/brigade-sdk-for-js";

// A map of all jobs. When a check_run:rerequested event wants to re-run a
// single job, this allows us to easily find that job by name.
const jobs = {};

const testUnitJobName = "test-unit";
const testUnitJob = (e, p) => {
  const job = new Job("test-unit", img);
  job.mountPath = localPath;
  job.tasks = [
    `cd ${localPath}`,
    "yarn install",
    "yarn test"
  ];
  return job;
}
jobs[testUnitJobName] = testUnitJob;

const lintJobName = "lint";
const lintJob = (e, p) => {
  const job = new Job("lint", img);
  job.mountPath = localPath;
  job.tasks = [
    `cd ${localPath}`,
    "yarn install",
    "yarn lint"
  ];
  return job;
}
jobs[lintJobName] = lintJob;

const publishJobName = "publish";
const publishJob = (e, p) => {
  const matchStr = e.revision.ref.match(releaseTagRegex);
  let version = "";
  if (matchStr) {
    let matchTokens = Array.from(matchStr);
    version = matchTokens[1];
  }
  const job = new Job("publish", img);
  job.mountPath = localPath;
  job.env = {
    "NPM_TOKEN": p.secrets.npmToken
  };
  job.tasks = [
    `cd ${localPath}`,
    "yarn install",
    "yarn build",
    "echo '//registry.npmjs.org/:_authToken=${NPM_TOKEN}' > .npmrc",
    `yarn publish --new-version ${version} --access public --no-git-tag-version`
  ];
  return job;
}
jobs[publishJobName] = publishJob;

// runSuite runs the entire suite of tests. All jobs run concurrently.
function runSuite(e, p) {
  // Important: To prevent Promise.all() from failing fast, we catch and
  // return all errors. This ensures Promise.all() always resolves. We then
  // iterate over all resolved values looking for errors. If we find one, we
  // throw it so the whole build will fail.
  //
  // Ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all#Promise.all_fail-fast_behaviour
  return Promise.all([
    run(e, p, testUnitJob(e, p)).catch((err) => { return err }),
    run(e, p, lintJob(e, p)).catch((err) => { return err })
  ]).then((values) => {
    values.forEach((value) => {
      if (value instanceof Error) throw value;
    });
  });
}

// Given a function that returns a job, run will use brigade-utils to create a
// so-called "job sandwich" that consists of:
//
// 1. A job that uses the GitHub checks API to notify GitHub that the job is
//    in-progress.
// 2. The job we actually want to run.
// 3. A job that uses the GitHub checks API to notify GitHub of the job's
//    success or failure.
function run(e, p, job) {
  console.log("Check requested");
  var check = new Check(e, p, job, `https://brigadecore.github.io/kashti/builds/${e.buildID}`);
  return check.run();
}

// Either of these events emitted by the GitHub gateway indicate the entire
// suite of tests should be run.
events.on("check_suite:requested", runSuite);
events.on("check_suite:rerequested", runSuite);

// These events MAY indicate that a maintainer has expressed, via a comment,
// that the entire test suite should be run.
events.on("issue_comment:created", (e, p) => Check.handleIssueComment(e, p, runSuite));
events.on("issue_comment:edited", (e, p) => Check.handleIssueComment(e, p, runSuite));

// This event indicates a specific job is to be re-run.
events.on("check_run:rerequested", (e, p) => {
  const jobName = JSON.parse(e.payload).body.check_run.name;
  const job = jobs[jobName];
  if (job) {
    return run(e, p, job(e, p));
  }
  throw new Error(`No job found with name: ${jobName}`);
});

// Pushing new commits to any branch in github triggers a check suite. Such
// events are already handled above. Here we're only concerned with the case
// wherein a new TAG has been pushed-- and even then, we're only concerned with
// tags that look like a semantic version and indicate a formal release should
// be performed.
events.on("push", (e, p) => {
  const matchStr = e.revision.ref.match(releaseTagRegex);
  if (matchStr) {
    return publishJob(e ,p).run();
  }
  console.log(`Ref ${e.revision.ref} does not match release tag regex (${releaseTagRegex}); not releasing.`);
});
