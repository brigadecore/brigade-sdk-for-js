import * as rm from "../rest_machinery"

export interface SubstrateWorkerCount {
  count: number
}

export interface SubstrateJobCount {
  count: number
}

/**
 * A specialized client for monitoring Brigade's workload execution substrate
 * with the Brigade API.
 */
export class SubstrateClient {
  private rmClient: rm.Client

  /**
   * Creates an instance of SubstrateClient.
   *
   * @param apiAddress The base address (protocol + host name or IP) of the API
   * server
   * @param apiToken A bearer token for authenticating to the API server
   * @param [opts] Optional client configuration
   *
   * @example
   * new SubstrateClient("https://brigade.example.com", apiToken, {allowInsecureConnections: true})
   */
  constructor(
    apiAddress: string,
    apiToken: string,
    opts?: rm.APIClientOptions
  ) {
    this.rmClient = new rm.Client(apiAddress, apiToken, opts)
  }

  /**
   * Counts running Workers.
   *
   * @returns A count of running Workers
   */
  public async countRunningWorkers(): Promise<SubstrateWorkerCount> {
    const req = new rm.Request("GET", "v2/substrate/running-workers")
    return this.rmClient.executeRequest(req) as Promise<SubstrateWorkerCount>
  }

  /**
   * Counts running Jobs.
   *
   * @returns A count of running Jobs
   */
  public async countRunningJobs(): Promise<SubstrateJobCount> {
    const req = new rm.Request("GET", "v2/substrate/running-jobs")
    return this.rmClient.executeRequest(req) as Promise<SubstrateJobCount>
  }
}
