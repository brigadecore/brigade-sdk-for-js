import { User, UsersClient } from "../../src/authn/users"
import * as meta from "../../src/meta"

import * as common from "../common"

import "mocha"

describe("users", () => {

  describe("UsersClient", () => {
  
    const client = new UsersClient(common.testAPIAddress, common.testAPIToken)

    describe("#list", () => {
      it("should send/receive properly over HTTP", async () => {
        const testUsers: meta.List<User> = {
          metadata: {},
          items: [
            {
              metadata: {
                id: "tony@starkindustries.com"
              },
              name: "Tony Stark"
            },
            {
              metadata: {
                id: "pepper@starkindustries.com"
              },
              name: "Pepper Potts"
            }
          ]
        }
        await common.testClient({
          expectedRequestMethod: "GET",
          expectedRequestPath: "/v2/users",
          mockResponseBody: testUsers,
          clientInvocationLogic: () => {
            return client.list()
          }
        })
      })
    })

    describe("#get", () => {
      it("should send/receive properly over HTTP", async () => {
        const testUser: User = {
          metadata: {
            id: "tony@starkindustries.com"
          },
          name: "Tony Stark"
        }
        await common.testClient({
          expectedRequestMethod: "GET",
          expectedRequestPath: `/v2/users/${testUser.metadata.id}`,
          mockResponseBody: testUser,
          clientInvocationLogic: () => {
            return client.get(testUser.metadata.id)
          }
        })
      })
    })

    describe("#delete", () => {
      it("should send/receive properly over HTTP", async () => {
        const testUserID = "tony@starkindustries.com"
        await common.testClient({
          expectedRequestMethod: "DELETE",
          expectedRequestPath: `/v2/users/${testUserID}`,
          clientInvocationLogic: () => {
            return client.delete(testUserID)
          }
        })
      })
    })

    describe("#lock", () => {
      it("should send/receive properly over HTTP", async () => {
        const testUserID = "tony@starkindustries.com"
        await common.testClient({
          expectedRequestMethod: "PUT",
          expectedRequestPath: `/v2/users/${testUserID}/lock`,
          clientInvocationLogic: () => {
            return client.lock(testUserID)
          }
        })
      })
    })

    describe("#unlock", () => {
      it("should send/receive properly over HTTP", async () => {
        const testUserID = "tony@starkindustries.com"
        await common.testClient({
          expectedRequestMethod: "DELETE",
          expectedRequestPath: `/v2/users/${testUserID}/lock`,
          clientInvocationLogic: () => {
            return client.unlock(testUserID)
          }
        })
      })
    })

  })

})
