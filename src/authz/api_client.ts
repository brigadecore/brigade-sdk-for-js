import * as rm from "../rest_machinery"

import { RoleAssignmentsClient } from "./role_assignments"

/**
 * APIClient is the root of a tree of more specialized API clients within the
 * authz module.
 */
export class APIClient {
  private roleAssignmentsClient: RoleAssignmentsClient

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
    this.roleAssignmentsClient = new RoleAssignmentsClient(
      apiAddress,
      apiToken,
      opts
    )
  }

  /**
   * Returns a specialized client for managing system-level RoleAssignments.
   * 
   * @returns A specialized client for managing system-level RoleAssignments
   */
  public roleAssignments(): RoleAssignmentsClient {
    return this.roleAssignmentsClient
  }

}
