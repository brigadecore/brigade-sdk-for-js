import * as rm from "../rest_machinery"

/**
 * Represents the expected response object returned by the API Server's ping
 * endpoint.
 */
export interface PingResponse {
  /**
   * The version of the API server.
   */
  version: string
}

/**
 * A specialized client for performing system-level operations with the Brigade
 * API.
 */
export class APIClient {
  private rmClient: rm.Client

  /**
   * Creates an instance of APIClient.
   *
   * @param apiAddress The base address (protocol + host name or IP) of the API
   * server
   * @param apiToken A bearer token for authenticating to the API server
   * @param [opts] Optional client configuration
   *
   * @example
   * new APIClient("https://brigade.example.com", apiToken, {allowInsecureConnections: true})
   */
  constructor(apiAddress: string, apiToken: string, opts?: rm.APIClientOptions) {
    this.rmClient = new rm.Client(apiAddress, apiToken, opts)    
  }

  /**
   * Pings the API server.
   */
  public async ping(): Promise<PingResponse> {
    const req = new rm.Request("GET", "v2/ping")
    return this.rmClient.executeRequest(req) as Promise<PingResponse>
  }

}
