import { RoleTypeSystem } from "../../src/system/roles"
import { PrincipalType, RoleAssignment, RoleAssignmentsClient } from "../../src/authz/role_assignments"

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
          role: {
            type: RoleTypeSystem,
            name: "ceo"
          },
          principal: {
            type: PrincipalType.User,
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

    describe("#revoke", () => {
      it("should send/receive properly over HTTP", async () => { 
        const testRoleAssignment: RoleAssignment = {
          role: {
            type: RoleTypeSystem,
            name: "ceo"
          },
          principal: {
            type: PrincipalType.User,
            id: "tony@starkindustries.com"
          }
        }
        await common.testClient({
          expectedRequestMethod: "DELETE",
          expectedRequestPath: "/v2/role-assignments",
          expectedRequestParams: new Map<string, string>([
            ["roleType", String(testRoleAssignment.role.type)],
            ["roleName", String(testRoleAssignment.role.name)],
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
