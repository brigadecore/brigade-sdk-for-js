import { APIClient } from "../../src/authn/api_client"

import * as common from "../common"

import "mocha"
import { assert } from "chai"

describe("api_client", () => {

  describe("APIClient", () => {

    const client = new APIClient(common.testAPIAddress, common.testAPIToken)

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
