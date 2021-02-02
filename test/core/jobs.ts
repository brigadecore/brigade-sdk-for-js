import { Job, JobStatus, JobPhase, JobsClient } from "../../src/core/jobs"

import * as common from "../common"

import "mocha"

describe("jobs", () => {

  describe("JobsClient", () => {

    const client = new JobsClient(common.testAPIAddress, common.testAPIToken)

    describe("#create", () => {
      it("should send/receive properly over HTTP", async () => { 
        const testEventID = "12345"
        const testJobName = "Italian"
        const testJob: Job = {
          spec: {
            primaryContainer: {
              image: "debian:latest"
            }
          }
        }
        await common.testClient({
          expectedRequestMethod: "PUT",
          expectedRequestPath: `/v2/events/${testEventID}/worker/jobs/${testJobName}`,
          expectedRequestBody: testJob,
          mockResponseCode: 201,
          clientInvocationLogic: () => {
            return client.create(testEventID, testJobName, testJob)
          }
        })
      })
    })

    describe("#start", () => {
      it("should send/receive properly over HTTP", async () => { 
        const testEventID = "12345"
        const testJobName = "Italian"
        await common.testClient({
          expectedRequestMethod: "PUT",
          expectedRequestPath: `/v2/events/${testEventID}/worker/jobs/${testJobName}/start`,
          clientInvocationLogic: () => {
            return client.start(testEventID, testJobName)
          }
        })
      })
    })

    describe("#getStatus", () => {
      it("should send/receive properly over HTTP", async () => {
        const testEventID = "12345"
        const testJobName = "Italian"
        const testJobStatus: JobStatus = {
          phase: JobPhase.Running,
        }
        await common.testClient({
          expectedRequestMethod: "GET",
          expectedRequestPath: `/v2/events/${testEventID}/worker/jobs/${testJobName}/status`,
          mockResponseBody: testJobStatus,
          clientInvocationLogic: () => {
            return client.getStatus(testEventID, testJobName)
          }
        })
      })
    })

    describe("#watchStatus", () => {
      // TODO: Test this
    })

    describe("#updateStatus", () => {
      it("should send/receive properly over HTTP", async () => {
        const testEventID = "12345"
        const testJobName = "Italian"
        const testJobStatus: JobStatus = {
          phase: JobPhase.Running,
        }
        await common.testClient({
          expectedRequestMethod: "PUT",
          expectedRequestPath: `/v2/events/${testEventID}/worker/jobs/${testJobName}/status`,
          expectedRequestBody: testJobStatus,
          clientInvocationLogic: () => {
            return client.updateStatus(testEventID, testJobName, testJobStatus)
          }
        })
      })
    })

    describe("#cleanup", () => {
      it("should send/receive properly over HTTP", async () => {
        const testEventID = "12345"
        const testJobName = "Italian"
        await common.testClient({
          expectedRequestMethod: "PUT",
          expectedRequestPath: `/v2/events/${testEventID}/worker/jobs/${testJobName}/cleanup`,
          clientInvocationLogic: () => {
            return client.cleanup(testEventID, testJobName)
          }
        })
      })
    })
    
  })

})
