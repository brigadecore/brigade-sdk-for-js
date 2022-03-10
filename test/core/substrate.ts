import {
  SubstrateWorkerCount,
  SubstrateJobCount,
  SubstrateClient
} from "../../src/core/substrate"

import * as common from "../common"

import "mocha"

describe("substrate", () => {
  describe("SubstrateClient", () => {
    const client = new SubstrateClient(
      common.testAPIAddress,
      common.testAPIToken
    )

    describe("#countRunningWorkers", () => {
      it("should send/receive properly over HTTP", async () => {
        const testCount: SubstrateWorkerCount = {
          count: 5
        }
        await common.testClient({
          expectedRequestMethod: "GET",
          expectedRequestPath: "/v2/substrate/running-workers",
          mockResponseBody: testCount,
          clientInvocationLogic: () => {
            return client.countRunningWorkers()
          }
        })
      })
    })

    describe("#countRunningJobs", () => {
      it("should send/receive properly over HTTP", async () => {
        const testCount: SubstrateJobCount = {
          count: 5
        }
        await common.testClient({
          expectedRequestMethod: "GET",
          expectedRequestPath: "/v2/substrate/running-jobs",
          mockResponseBody: testCount,
          clientInvocationLogic: () => {
            return client.countRunningJobs()
          }
        })
      })
    })
  })
})
