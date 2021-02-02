import { Secret, SecretsClient } from "../../src/core/secrets"
import * as meta from "../../src/meta"

import * as common from "../common"

import "mocha"

describe("secrets", () => {

  describe("SecretsClient", () => {

    const client = new SecretsClient(common.testAPIAddress, common.testAPIToken)

    describe("#list", () => {
      it("should send/receive properly over HTTP", async () => { 
        const testProjectID = "bluebook"
        const testSecrets: meta.List<Secret> = {
          metadata: {},
          items: [
            {
              key:   "soylentgreen",
              value: "people"
            },
            {
              key:   "whodunit",
              value: "thebutler"
            },
          ]
        }
        await common.testClient({
          expectedRequestMethod: "GET",
          expectedRequestPath: `/v2/projects/${testProjectID}/secrets`,
          mockResponseBody: testSecrets,
          clientInvocationLogic: () => {
            return client.list(testProjectID)
          }
        })
      })
    })

    describe("#set", () => {
      it("should send/receive properly over HTTP", async () => { 
        const testProjectID = "bluebook"
        const testSecret: Secret = {
          key:   "soylentgreen",
          value: "people"
        }
        await common.testClient({
          expectedRequestMethod: "PUT",
          expectedRequestPath: `/v2/projects/${testProjectID}/secrets/${testSecret.key}`,
          expectedRequestBody: testSecret,
          clientInvocationLogic: () => {
            return client.set(testProjectID, testSecret)
          }
        })
      })
    })

    describe("#unset", () => {
      it("should send/receive properly over HTTP", async () => { 
        const testProjectID = "bluebook"
        const testSecretKey = "soylentgreen"
        await common.testClient({
          expectedRequestMethod: "DELETE",
          expectedRequestPath: `/v2/projects/${testProjectID}/secrets/${testSecretKey}`,
          clientInvocationLogic: () => {
            return client.unset(testProjectID, testSecretKey)
          }
        })
      })
    })

  })

})
