import { PrincipalTypeUser } from "../../src/authz/role_assignments"
import {
  ProjectRoleAssignment,
  ProjectRoleAssignmentsClient
} from "../../src/core/project_role_assignments"
import * as meta from "../../src/meta"

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
        const testProjectRoleAssignment: ProjectRoleAssignment = {
          projectID: testProjectID,
          role: "ceo",
          principal: {
            type: PrincipalTypeUser,
            id: "tony@starkindustries.com"
          }
        }
        await common.testClient({
          expectedRequestMethod: "POST",
          expectedRequestPath: `/v2/projects/${testProjectID}/role-assignments`,
          expectedRequestBody: testProjectRoleAssignment,
          clientInvocationLogic: () => {
            return client.grant(testProjectID, testProjectRoleAssignment)
          }
        })
      })
    })

    describe("#list", () => {
      const testProjectRoleAssignments: meta.List<ProjectRoleAssignment> = {
        metadata: {},
        items: [
          {
            projectID: "avengers-initiative",
            principal: {
              type: PrincipalTypeUser,
              id: "tony@starkindustries.com"
            },
            role: "ceo"
          }
        ]
      }
      it("should send/receive properly over HTTP when project ID is not specified", async () => {
        await common.testClient({
          expectedRequestMethod: "GET",
          expectedRequestPath: "/v2/project-role-assignments",
          expectedRequestParams: new Map<string, string>([
            ["principalType", String(PrincipalTypeUser)],
            ["principalID", "tony@starkindustries.com"],
            ["role", "ceo"]
          ]),
          mockResponseBody: testProjectRoleAssignments,
          clientInvocationLogic: () => {
            return client.list("", {
              principal: {
                type: PrincipalTypeUser,
                id: "tony@starkindustries.com"
              },
              role: "ceo"
            })
          }
        })
      })
      it("should send/receive properly over HTTP when project ID is specified", async () => {
        const testProjectID = "bluebook"
        await common.testClient({
          expectedRequestMethod: "GET",
          expectedRequestPath: `/v2/projects/${testProjectID}/role-assignments`,
          expectedRequestParams: new Map<string, string>([
            ["principalType", String(PrincipalTypeUser)],
            ["principalID", "tony@starkindustries.com"],
            ["role", "ceo"]
          ]),
          mockResponseBody: testProjectRoleAssignments,
          clientInvocationLogic: () => {
            return client.list(testProjectID, {
              principal: {
                type: PrincipalTypeUser,
                id: "tony@starkindustries.com"
              },
              role: "ceo"
            })
          }
        })
      })
    })

    describe("#revoke", () => {
      it("should send/receive properly over HTTP", async () => {
        const testProjectID = "avengers-initiative"
        const testProjectRoleAssignment: ProjectRoleAssignment = {
          role: "ceo",
          principal: {
            type: PrincipalTypeUser,
            id: "tony@starkindustries.com"
          }
        }
        await common.testClient({
          expectedRequestMethod: "DELETE",
          expectedRequestPath: `/v2/projects/${testProjectID}/role-assignments`,
          expectedRequestParams: new Map<string, string>([
            ["role", String(testProjectRoleAssignment.role)],
            ["principalType", String(testProjectRoleAssignment.principal.type)],
            ["principalID", testProjectRoleAssignment.principal.id]
          ]),
          clientInvocationLogic: () => {
            return client.revoke(testProjectID, testProjectRoleAssignment)
          }
        })
      })
    })
  })
})
