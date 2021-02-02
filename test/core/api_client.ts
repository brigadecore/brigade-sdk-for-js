import { APIClient } from "../../src/core/api_client"

import * as common from "../common"

import "mocha"
import { assert } from "chai"

describe("api_client", () => {

  describe("APIClient", () => {

    const client = new APIClient(common.testAPIAddress, common.testAPIToken)

    describe("#event", () => {
      it("should return an events client", () => {
        assert.isDefined(client.events())
      })
    })

    describe("#projects", () => {
      it("should return a projects client", () => {
        assert.isDefined(client.projects())
      })
    })

    describe("#substrate", () => {
      it("should return a substrate client", () => {
        assert.isDefined(client.substrate())
      })
    })

  })

})
