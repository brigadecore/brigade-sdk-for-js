import { RoleAssignment } from "../../src/lib/authz"
import { PrincipalTypeUser, RoleAssignmentsClient } from "../../src/authz/role_assignments"
import * as meta from "../../src/meta"

import * as common from "../common"

import "mocha"

describe("roles", () => {

  describe("RoleAssignmentsClient", () => {

    const client = new RoleAssignmentsClient(
      common.testAPIAddress,
      common.testAPIToken
    )

    describe("#grant", () => {
      it("should send/receive properly over HTTP", async () => { 
        const testRoleAssignment: RoleAssignment = {
          role: "ceo",
          principal: {
            type: PrincipalTypeUser,
            id: "tony@starkindustries.com"
          }
        }
        await common.testClient({
          expectedRequestMethod: "POST",
          expectedRequestPath: "/v2/role-assignments",
          expectedRequestBody: testRoleAssignment,
          clientInvocationLogic: () => {
            return client.grant(testRoleAssignment)
          }
        })
      })
    })

    describe("#list", () => {
      it("should send/receive properly over HTTP", async () => { 
        const testRoleAssignments: meta.List<RoleAssignment> = {
          metadata: {},
          items: [
            {
              principal: {
                type: PrincipalTypeUser,
                id: "tony@starkindustries.com"
              },
              role: "ceo"
            }
          ]
        }
        await common.testClient({
          expectedRequestMethod: "GET",
          expectedRequestPath: "/v2/role-assignments",
          expectedRequestParams: new Map<string, string>([
            ["principalType", String(PrincipalTypeUser)],
            ["principalID", "tony@starkindustries.com"],
            ["role", "ceo"],
          ]),
          mockResponseBody: testRoleAssignments,
          clientInvocationLogic: () => {
            return client.list({
              principal: {
                type: PrincipalTypeUser,
                id: "tony@starkindustries.com",
              },
              role: "ceo"
            })
          }
        })
      })
    })

    describe("#revoke", () => {
      it("should send/receive properly over HTTP", async () => { 
        const testRoleAssignment: RoleAssignment = {
          role: "ceo",
          principal: {
            type: PrincipalTypeUser,
            id: "tony@starkindustries.com"
          }
        }
        await common.testClient({
          expectedRequestMethod: "DELETE",
          expectedRequestPath: "/v2/role-assignments",
          expectedRequestParams: new Map<string, string>([
            ["role", String(testRoleAssignment.role)],
            ["principalType", String(testRoleAssignment.principal.type)],
            ["principalID", testRoleAssignment.principal.id]
          ]),
          clientInvocationLogic: () => {
            return client.revoke(testRoleAssignment)
          }
        })
      })
    })

  })

})
