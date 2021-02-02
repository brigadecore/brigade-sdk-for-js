import { AuthzClient } from "../../src/core/authz" 

import * as common from "../common"

import "mocha"
import { assert } from "chai"

describe("projects", () => {

  describe("ProjectsClient", () => {
    
    const client = new AuthzClient(common.testAPIAddress, common.testAPIToken)

    describe("#roleAssignments", () => {
      it("should return a project-level role assignments client", () => {
        assert.isDefined(client.roleAssignments())
      })
    })

  })

})
