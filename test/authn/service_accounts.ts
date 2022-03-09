import {
  ServiceAccount,
  ServiceAccountsClient
} from "../../src/authn/service_accounts"
import { Token } from "../../src/authn/tokens"
import * as meta from "../../src/meta"

import * as common from "../common"

import "mocha"

describe("service_accounts", () => {
  describe("ServiceAccountsClient", () => {
    const client = new ServiceAccountsClient(
      common.testAPIAddress,
      common.testAPIToken
    )

    describe("#create", () => {
      it("should send/receive properly over HTTP", async () => {
        const testServiceAccount: ServiceAccount = {
          metadata: {
            id: "jarvis"
          },
          description: "Tony Stark's super cool AI assistant"
        }
        const testServiceAccountToken: Token = {
          value: "opensesame"
        }
        await common.testClient({
          expectedRequestMethod: "POST",
          expectedRequestPath: "/v2/service-accounts",
          expectedRequestBody: testServiceAccount,
          mockResponseCode: 201,
          mockResponseBody: testServiceAccountToken,
          clientInvocationLogic: () => {
            return client.create(testServiceAccount)
          }
        })
      })
    })

    describe("#list", () => {
      it("should send/receive properly over HTTP", async () => {
        const testServiceAccounts: meta.List<ServiceAccount> = {
          metadata: {},
          items: [
            {
              metadata: {
                id: "jarvis"
              },
              description: "Tony Stark's super cool AI assistant"
            },
            {
              metadata: {
                id: "friday"
              },
              description: "Tony Stark's NEW super cool AI assistant"
            }
          ]
        }
        await common.testClient({
          expectedRequestMethod: "GET",
          expectedRequestPath: "/v2/service-accounts",
          mockResponseBody: testServiceAccounts,
          clientInvocationLogic: () => {
            return client.list()
          }
        })
      })
    })

    describe("#get", () => {
      it("should send/receive properly over HTTP", async () => {
        const testServiceAccount: ServiceAccount = {
          metadata: {
            id: "jarvis"
          },
          description: "Tony Stark's super cool AI assistant"
        }
        await common.testClient({
          expectedRequestMethod: "GET",
          expectedRequestPath: `/v2/service-accounts/${testServiceAccount.metadata.id}`,
          mockResponseBody: testServiceAccount,
          clientInvocationLogic: () => {
            return client.get(testServiceAccount.metadata.id)
          }
        })
      })
    })

    describe("#delete", () => {
      it("should send/receive properly over HTTP", async () => {
        const testServiceAccountID = "jarvis"
        await common.testClient({
          expectedRequestMethod: "DELETE",
          expectedRequestPath: `/v2/service-accounts/${testServiceAccountID}`,
          clientInvocationLogic: () => {
            return client.delete(testServiceAccountID)
          }
        })
      })
    })

    describe("#lock", () => {
      it("should send/receive properly over HTTP", async () => {
        const testServiceAccountID = "jarvis"
        await common.testClient({
          expectedRequestMethod: "PUT",
          expectedRequestPath: `/v2/service-accounts/${testServiceAccountID}/lock`,
          clientInvocationLogic: () => {
            return client.lock(testServiceAccountID)
          }
        })
      })
    })

    describe("#unlock", () => {
      it("should send/receive properly over HTTP", async () => {
        const testServiceAccountID = "jarvis"
        const testServiceAccountToken: Token = {
          value: "opensesame"
        }
        await common.testClient({
          expectedRequestMethod: "DELETE",
          expectedRequestPath: `/v2/service-accounts/${testServiceAccountID}/lock`,
          mockResponseBody: testServiceAccountToken,
          clientInvocationLogic: () => {
            return client.unlock(testServiceAccountID)
          }
        })
      })
    })
  })
})
