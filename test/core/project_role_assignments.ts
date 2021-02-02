import { RoleTypeProject } from "../../src/core/roles"
import { PrincipalType, RoleAssignment } from "../../src/authz/role_assignments"
import { ProjectRoleAssignmentsClient } from "../../src/core/project_role_assignments"

import * as common from "../common"

import "mocha"

describe("project_roles", () => {

  describe("ProjectRoleAssignmentsClient", () => {

    const client = new ProjectRoleAssignmentsClient(
      common.testAPIAddress,
      common.testAPIToken
    )
    
    describe("#grant", () => {
      it("should send/receive properly over HTTP", async () => { 
        const testProjectID = "avengers-initiative"
        const testRoleAssignment: RoleAssignment = {
          role: {
            type: RoleTypeProject,
            name: "ceo",
            scope: testProjectID
          },
          principal: {
            type: PrincipalType.User,
            id: "tony@starkindustries.com"
          }
        }
        await common.testClient({
          expectedRequestMethod: "POST",
          expectedRequestPath: "/v2/project-role-assignments",
          expectedRequestBody: testRoleAssignment,
          clientInvocationLogic: () => {
            return client.grant(testRoleAssignment)
          }
        })
      })
    })

    describe("#revoke", () => {
      it("should send/receive properly over HTTP", async () => { 
        const testProjectID = "avengers-initiative"
        const testRoleAssignment: RoleAssignment = {
          role: {
            type: RoleTypeProject,
            name: "ceo",
            scope: testProjectID
          },
          principal: {
            type: PrincipalType.User,
            id: "tony@starkindustries.com"
          }
        }
        await common.testClient({
          expectedRequestMethod: "DELETE",
          expectedRequestPath: "/v2/project-role-assignments",
          expectedRequestParams: new Map<string, string>([
            ["roleType", String(testRoleAssignment.role.type)],
            ["roleName", String(testRoleAssignment.role.name)],
            ["roleScope", testRoleAssignment.role.scope || ""],
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
