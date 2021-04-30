import { APIClient, PingResponse } from "../../src/system" 

import * as common from "../common"

import "mocha"

describe("api_client", () => {

  describe("APIClient", () => {

    const client = new APIClient(common.testAPIAddress, common.testAPIToken)

    describe("#ping", () => {
      it("should send/receive properly over HTTP", async () => { 
        const testPingResponse: PingResponse = {
          version: "v0.0.0"
        }
        await common.testClient({
          expectedRequestMethod: "GET",
          expectedRequestPath: "/v2/ping",
          mockResponseBody: testPingResponse,
          clientInvocationLogic: () => {
            return client.ping()
          }
        })
      })
    })

    describe("#unversionedPing", () => {
      it("should send/receive properly over HTTP", async () => { 
        const testPingResponse = {
          version: "v0.0.0"
        }
        await common.testClient({
          expectedRequestMethod: "GET",
          expectedRequestPath: "/ping",
          mockResponseBody: testPingResponse,
          clientInvocationLogic: () => {
            return client.unversionedPing()
          }
        })
      })
    })

  })

})
