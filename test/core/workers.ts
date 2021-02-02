import { WorkerStatus, WorkerPhase, WorkersClient } from "../../src/core/workers"

import * as common from "../common"

import "mocha"
import { assert } from "chai"

describe("workers", () => {

  describe("WorkersClient", () => {

    const client = new WorkersClient(common.testAPIAddress, common.testAPIToken)
  
    describe("#start", () => {
      it("should send/receive properly over HTTP", async () => {
        const testEventID = "12345"
        await common.testClient({
          expectedRequestMethod: "PUT",
          expectedRequestPath: `/v2/events/${testEventID}/worker/start`,
          clientInvocationLogic: () => {
            return client.start(testEventID)
          }
        })
      })
    })

    describe("#getStatus", () => {
      it("should send/receive properly over HTTP", async () => {
        const testEventID = "12345"
        const testWorkerStatus: WorkerStatus = {
          phase: WorkerPhase.Running,
        }
        await common.testClient({
          expectedRequestMethod: "GET",
          expectedRequestPath: `/v2/events/${testEventID}/worker/status`,
          mockResponseBody: testWorkerStatus,
          clientInvocationLogic: () => {
            return client.getStatus(testEventID)
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
        const testWorkerStatus: WorkerStatus = {
          phase: WorkerPhase.Running,
        }
        await common.testClient({
          expectedRequestMethod: "PUT",
          expectedRequestPath: `/v2/events/${testEventID}/worker/status`,
          expectedRequestBody: testWorkerStatus,
          clientInvocationLogic: () => {
            return client.updateStatus(testEventID, testWorkerStatus)
          }
        })
      })
    })

    describe("#cleanup", () => {
      it("should send/receive properly over HTTP", async () => {
        const testEventID = "12345"
        await common.testClient({
          expectedRequestMethod: "PUT",
          expectedRequestPath: `/v2/events/${testEventID}/worker/cleanup`,
          clientInvocationLogic: () => {
            return client.cleanup(testEventID)
          }
        })
      })
    })

    describe("#jobs", () => {
      it("should return a jobs client", () => {
        assert.isDefined(client.jobs())
      })
    })

  })

})
