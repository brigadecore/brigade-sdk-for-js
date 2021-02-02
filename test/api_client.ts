import { APIClient } from "../src/api_client"

import * as common from "./common"

import "mocha"
import { assert } from "chai"

describe("api_client", () => {
  
  describe("APIClient", () => {
    
    const client = new APIClient(common.testAPIAddress, common.testAPIToken)

    describe("#authn", () => {
      it("should return an authn client", () => {
        assert.isDefined(client.authn())
      })
    })

    describe("#authz", () => {
      it("should return a system client", () => {
        assert.isDefined(client.authz())
      })
    })

    describe("#core", () => {
      it("should return a core client", () => {
        assert.isDefined(client.core())
      })
    })

  })

})
