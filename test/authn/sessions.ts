import { OIDCAuthDetails, SessionsClient } from "../../src/authn/sessions"
import { Token } from "../../src/authn/tokens"

import * as common from "../common"

import "mocha"

describe("sessions", () => {

  describe("SessionsClient", () => {

    const client = new SessionsClient(common.testAPIAddress, common.testAPIToken)

    describe("#createRootSession", () => {
      it("should send/receive properly over HTTP", async () => {
        const testRootPassword = "foobar"
        const testSessionToken: Token = {
          value: "opensesame"
        }
        await common.testClient({
          expectedRequestMethod: "POST",
          expectedRequestPath: "/v2/sessions",
          expectTokenAuthHeader: false,
          expectedHeaders: new Map<string, string>([
            ["authorization", `Basic ${Buffer.from(`root:${testRootPassword}`).toString("base64")}`]
          ]),
          mockResponseCode: 201,
          mockResponseBody: testSessionToken,
          clientInvocationLogic: () => {
            return client.createRootSession(testRootPassword)
          }
        })
      })
    })

    describe("#createUserSession", () => {
      it("should send/receive properly over HTTP", async () => {
        const testOIDCAuthDetails: OIDCAuthDetails = {
          authURL: "https://openid.example.com/blah/blah/blah",
          token: "opensesame"
        }
        await common.testClient({
          expectedRequestMethod: "POST",
          expectedRequestPath: "/v2/sessions",
          expectTokenAuthHeader: false,
          mockResponseCode: 201,
          mockResponseBody: testOIDCAuthDetails,
          clientInvocationLogic: () => {
            return client.createUserSession()
          }
        })
      })
    })

    describe("#delete", () => {
      it("should send/receive properly over HTTP", async () => {
        await common.testClient({
          expectedRequestMethod: "DELETE",
          expectedRequestPath: "/v2/session",
          clientInvocationLogic: () => {
            return client.delete()
          }
        })
      })
    })

  })

})
