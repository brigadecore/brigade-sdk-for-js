import * as http from "http"
import { URL } from "url"

export const testPort = 5001
export const testAPIAddress = `http://localhost:${testPort}`
export const testAPIToken = "fakeToken"

import { assert } from "chai"

interface ClientTestCase {
  expectedRequestMethod: string
  expectedRequestPath: string
  expectTokenAuthHeader?: boolean
  expectedHeaders?: Map<string, string>
  expectedRequestParams?: Map<string, string>
  expectedRequestBody?: unknown
  mockResponseCode?: number
  mockResponseBody?: unknown
  clientInvocationLogic: () => unknown
}

export async function testClient(testCase: ClientTestCase): Promise<void> {
  const server = http.createServer((req, res) => {
    try {
      assert.equal(req.method, testCase.expectedRequestMethod, "incorrect HTTP request method")
      const url = new URL(req.url || "", testAPIAddress)
      assert.equal(url.pathname, testCase.expectedRequestPath, "incorrect HTTP request path")
      if (testCase.expectTokenAuthHeader || testCase.expectTokenAuthHeader == undefined) {
        assert.isDefined(req.headers["authorization"])
        assert.isTrue(req.headers["authorization"]?.startsWith("Bearer"))
      }
      if (testCase.expectedHeaders) {
        testCase.expectedHeaders.forEach((value, key) => {
          console.log(req.headers)
          assert.equal(req.headers[key], value, `incorrect value for request parameter ${key}`)
        })
      }
      if (testCase.expectedRequestParams) {
        testCase.expectedRequestParams.forEach((value, key) => {
          assert.equal(url.searchParams.get(key), value, `incorrect value for request parameter ${key}`)
        })
      }
      if (testCase.expectedRequestBody) {
        const requestBody: any[] = [] // eslint-disable-line @typescript-eslint/no-explicit-any
        req.on("data", (chunks) => {
          requestBody.push(chunks)
        })
        req.on("end", () => {
          const requestBodyObj = JSON.parse(Buffer.concat(requestBody).toString())
          assert.deepEqual(requestBodyObj, testCase.expectedRequestBody, "did not receive expected HTTP request body")
        })
      }
      res.statusCode = testCase.mockResponseCode || 200
      if (testCase.mockResponseBody) {
        res.write(JSON.stringify(testCase.mockResponseBody))
      }
    } finally {
      res.end()
    }
  })
  server.listen(testPort)
  try {
    const response = await testCase.clientInvocationLogic()
    if (testCase.mockResponseBody) {
      assert.deepEqual(response, testCase.mockResponseBody, "response from client does not match HTTP response body")
    }
  } finally {
    server.close()
  }
}
