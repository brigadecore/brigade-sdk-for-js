import * as rm from "../rest_machinery"

import { EventsClient } from "./events"
import { ProjectsClient } from "./projects"
import { SubstrateClient } from "./substrate"

/**
 * APIClient is the root of a tree of more specialized API clients within the
 * core module.
 */
export class APIClient {
  private eventsClient: EventsClient
  private projectsClient: ProjectsClient
  private substrateClient: SubstrateClient

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
    this.eventsClient = new EventsClient(apiAddress, apiToken, opts)
    this.projectsClient = new ProjectsClient(apiAddress, apiToken, opts)
    this.substrateClient = new SubstrateClient(apiAddress, apiToken, opts)
  }

  /**
   * Returns a specialized client for Event management.
   * 
   * @returns A specialized client for Event management
   */
  public events(): EventsClient {
    return this.eventsClient
  }

  /**
   * Returns a specialized client for Project management.
   * 
   * @returns a specialized client for Project management
   */
  public projects(): ProjectsClient {
    return this.projectsClient
  }

  /**
   * Returns a specialized client for substrate monitoring.
   * 
   * @returns a specialized client for substrate monitoring
   */
  public substrate(): SubstrateClient {
    return this.substrateClient
  }

}
