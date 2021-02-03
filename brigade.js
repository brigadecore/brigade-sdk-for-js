// ============================================================================
// NOTE: This is a Brigade 1.x script for now.
//
// TODO: Once a Brigade 2 compatible GitHub gateway exists, transition to
// Brigade 2.
// ============================================================================
const { events, Job } = require("brigadier");
const { Check } = require("@brigadecore/brigade-utils");

const img = "node:12.3.1-stretch";
const localPath = "/workspaces/brigade-sdk-for-js";

// testUnit defines and returns (but doesn't run) a job that performs unit
// tests.
function testUnit() {
  const job = new Job("test-unit", img);
  job.mountPath = localPath;
  job.tasks = [
    `cd ${localPath}`,
    "yarn install",
    "yarn test"
  ];
  return job;
}

// lint defines and returns (but doesn't run) a job that performs unit lint
// checks.
function lint() {
  const job = new Job("lint", img);
  job.mountPath = localPath;
  job.tasks = [
    `cd ${localPath}`,
    "yarn install",
    "yarn lint"
  ];
  return job;
}

// runSuite runs the entire suite of tests. All jobs run concurrently.
function runSuite(e, p) {
  // Important: To prevent Promise.all() from failing fast, we catch and
  // return all errors. This ensures Promise.all() always resolves. We then
  // iterate over all resolved values looking for errors. If we find one, we
  // throw it so the whole build will fail.
  //
  // Ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all#Promise.all_fail-fast_behaviour
  return Promise.all([
    run(e, p, testUnit).catch((err) => { return err }),
    run(e, p, lint).catch((err) => { return err }),
  ]).then((values) => {
    values.forEach((value) => {
      if (value instanceof Error) throw value;
    });
  });
}

// runCheck is used for running a single job. The name of the job to be re-run
// is identified by the payload.
function runCheck(e, p) {
  const payload = JSON.parse(e.payload);
  const name = payload.body.check_run.name;
  // Determine which check to run
  switch (name) {
    case "test-unit":
      return run(e, p, testUnit);
    case "lint":
      return run(e, p, lint);
    default:
      throw new Error(`No check found with name: ${name}`);
  }
}

// Given a function that returns a job, run will use brigade-utils to create a
// so-called "job sandwich" that consists of:
//
// 1. A job that uses the GitHub checks API to notify GitHub that the job is
//    in-progress.
// 2. The job we actually want to run.
// 3. A job that uses the GitHub checks API to notify GitHub of the job's
//    success or failure.
function run(e, p, jobFunc) {
  console.log("Check requested");
  var check = new Check(e, p, jobFunc(), `http://byu.kashti.sh/builds/${e.buildID}`);
  return check.run();
}

// Either of these events emitted by the GitHub gateway indicate the entire
// suite of tests should be run.
events.on("check_suite:requested", runSuite);
events.on("check_suite:rerequested", runSuite);

// This event indicates a specific job should be run. Presumably this event
// originated in response to a user who clicked "re-run" in GitHub for the check
// associated with a job that has already run and failed. The event's payload
// identifies the specific job to run.
events.on("check_run:rerequested", runCheck);
