import "mocha"

import { APIClient } from "../../src/authz/api_client"

import * as common from "../common"

import "mocha"
import { assert } from "chai"

describe("api_client", () => {
  describe("APIClient", () => {
    const client = new APIClient(common.testAPIAddress, common.testAPIToken)

    describe("#roleAssignments", () => {
      it("should return a role assignments client", () => {
        assert.isDefined(client.roleAssignments())
      })
    })
  })
})
