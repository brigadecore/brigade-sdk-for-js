import axios from "axios"

import * as meta from "../meta"

import { Request } from "./requests"

// This doesn't work in a browser; only in Node
let https: any // eslint-disable-line @typescript-eslint/no-explicit-any
// @ts-ignore
if (typeof window === "undefined") {
  https = require("https")
}

export interface APIClientOptions {
  allowInsecureConnections?: boolean
}

export class Client {
  apiAddress: string
  apiToken: string
  opts: APIClientOptions

  constructor(apiAddress: string, apiToken: string, opts?: APIClientOptions) {
    this.apiToken = apiToken
    this.apiAddress = apiAddress
    this.apiToken = apiToken
    this.opts = opts || {
      allowInsecureConnections: false
    }
  }

  public async executeRequest(req: Request): Promise<unknown> {
    // If applicable, augment the outbound object with type metadata
    if (req.bodyObj) {
      req.bodyObj.apiVersion = meta.APIVersion
      if (req.bodyObjKind) {
        req.bodyObj.kind = req.bodyObjKind
      }
    }

    const headers: any = {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      "Content-Type": "application/json",
      Accept: "application/json"
    }
    if (req.includeTokenAuthHeader) {
      headers["Authorization"] = `Bearer ${this.apiToken}`
    }
    if (req.headers) {
      req.headers.forEach((val, key) => {
        headers[key] = val
      })
    }

    const queryParams: any = {} // eslint-disable-line @typescript-eslint/no-explicit-any
    if (req.listOpts) {
      if (req.listOpts.continue) {
        queryParams["continue"] = req.listOpts.continue
      }
      if (req.listOpts.limit) {
        queryParams["limit"] = req.listOpts.limit
      }
    }
    if (req.queryParams) {
      req.queryParams.forEach((val, key) => {
        queryParams[key] = val
      })
    }

    let httpsAgent: any // eslint-disable-line @typescript-eslint/no-explicit-any
    if (https) {
      httpsAgent = new https.Agent({
        rejectUnauthorized: !this.opts.allowInsecureConnections
      })
    }

    const response = await axios({
      httpsAgent: httpsAgent,
      method: req.method,
      url: `${this.apiAddress}/${req.path}`,
      headers: headers,
      params: queryParams,
      data: req.bodyObj,
      validateStatus: null // We'll check it ourselves
    })

    if (response.status == Number(req.successCode)) {
      return response.data
    }

    switch (response.status) {
      case 401:
        throw new Error(
          `Could not authenticate the request: ${response.data.reason}`
        )
      case 403:
        throw new Error("The request is not authorized.")
      case 400: {
        let msg = `Bad request: ${response.data.reason}`
        if (response.data.details) {
          response.data.details.forEach((value: string, index: number) => {
            msg = msg + `\n  ${index}. ${value}`
          })
        }
        throw new Error(msg)
      }
      case 404:
        throw new Error(
          `${response.data.type} "${response.data.id}" not found.`
        )
      case 409:
        throw new Error(response.data.reason)
      case 500:
        throw new Error("An internal server error occurred.")
      case 501:
        throw new Error(`Request not supported: ${response.data.details}`)
      default:
        throw new Error(`received ${response.status} from API server`)
    }
  }
}
