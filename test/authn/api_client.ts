import { APIClient } from "../../src/authn/api_client"
import { PrincipalTypeUser } from "../../src/authz/role_assignments"

import * as common from "../common"

import "mocha"
import { assert } from "chai"
import { PrincipalReference } from "../../src/lib/authz"

describe("api_client", () => {
  describe("APIClient", () => {
    const client = new APIClient(common.testAPIAddress, common.testAPIToken)

    describe("#whoami", () => {
      it("should send/receive properly over HTTP", async () => {
        const testRef: PrincipalReference = {
          type: PrincipalTypeUser,
          id: "stark"
        }
        await common.testClient({
          expectedRequestMethod: "GET",
          expectedRequestPath: "/v2/whoami",
          mockResponseBody: testRef,
          clientInvocationLogic: () => {
            return client.whoAmI()
          }
        })
      })
    })

    describe("#serviceAccounts", () => {
      it("should return a service accounts client", () => {
        assert.isDefined(client.serviceAccounts())
      })
    })

    describe("#sessions", () => {
      it("should return a sessions client", () => {
        assert.isDefined(client.sessions())
      })
    })

    describe("#users", () => {
      it("should return a users client", () => {
        assert.isDefined(client.users())
      })
    })
  })
})
