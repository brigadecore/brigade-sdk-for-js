import { Project, ProjectsClient } from "../../src/core/projects" 
import * as meta from "../../src/meta"

import * as common from "../common"

import "mocha"
import { assert } from "chai"

describe("projects", () => {

  describe("ProjectsClient", () => {
    
    const client = new ProjectsClient(common.testAPIAddress, common.testAPIToken)

    describe("#create", () => {
      it("should send/receive properly over HTTP", async () => {
        const testProject: Project = {
          metadata: {
            id: "bluebook"
          },
          spec: {
            workerTemplate: {}
          }
        }
        await common.testClient({
          expectedRequestMethod: "POST",
          expectedRequestPath: "/v2/projects",
          expectedRequestBody: testProject,
          mockResponseCode: 201,
          mockResponseBody: testProject,
          clientInvocationLogic: () => {
            return client.create(testProject)
          }
        })
      })
    })

    describe("#list", () => {
      it("should send/receive properly over HTTP", async () => {
        const testProjects: meta.List<Project> = {
          metadata: {},
          items: [
            {
              metadata: {
                id: "bluebook"
              },
              spec: {
                workerTemplate: {}
              }
            },
            {
              metadata: {
                id: "runway"
              },
              spec: {
                workerTemplate: {}
              }
            }
          ],
        }
        await common.testClient({
          expectedRequestMethod: "GET",
          expectedRequestPath: "/v2/projects",
          mockResponseBody: testProjects,
          clientInvocationLogic: () => {
            return client.list()
          }
        })
      })
    })

    describe("#get", () => {
      it("should send/receive properly over HTTP", async () => {
        const testProject: Project = {
          metadata: {
            id: "bluebook"
          },
          spec: {
            workerTemplate: {}
          }
        }
        await common.testClient({
          expectedRequestMethod: "GET",
          expectedRequestPath: `/v2/projects/${testProject.metadata.id}`,
          mockResponseBody: testProject,
          clientInvocationLogic: () => {
            return client.get(testProject.metadata.id)
          }
        })
      })
    })

    describe("#update", () => {
      it("should send/receive properly over HTTP", async () => {
        const testProject: Project = {
          metadata: {
            id: "bluebook"
          },
          spec: {
            workerTemplate: {}
          }
        }
        await common.testClient({
          expectedRequestMethod: "PUT",
          expectedRequestPath: `/v2/projects/${testProject.metadata.id}`,
          expectedRequestBody: testProject,
          mockResponseBody: testProject,
          clientInvocationLogic: () => {
            return client.update(testProject)
          }
        })
      })
    })

    describe("#delete", () => {
      it("should send/receive properly over HTTP", async () => {
        const testProjectID = "bluebook"
        await common.testClient({
          expectedRequestMethod: "DELETE",
          expectedRequestPath: `/v2/projects/${testProjectID}`,
          clientInvocationLogic: () => {
            return client.delete(testProjectID)
          }
        })
      })
    })

    describe("#authz", () => {
      it("should return a project-level authz client", () => {
        assert.isDefined(client.authz())
      })
    })

    describe("#secrets", () => {
      it("should return a secrets client", () => {
        assert.isDefined(client.secrets())
      })
    })

  })

})
