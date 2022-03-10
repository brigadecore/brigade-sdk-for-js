import * as rm from "../rest_machinery"

import { ProjectRoleAssignmentsClient } from "./project_role_assignments"

/**
 * A specialized client for managing project-level authorization concerns with
 * the Brigade API.
 */
export class AuthzClient {
  private projectRoleAssignmentsClient: ProjectRoleAssignmentsClient

  /**
   * Creates an instance of AuthzClient.
   *
   * @param apiAddress The base address (protocol + host name or IP) of the API
   * server
   * @param apiToken A bearer token for authenticating to the API server
   * @param [opts] Optional client configuration
   *
   * @example
   * new ProjectsClient("https://brigade.example.com", apiToken, {allowInsecureConnections: true})
   */
  constructor(
    apiAddress: string,
    apiToken: string,
    opts?: rm.APIClientOptions
  ) {
    this.projectRoleAssignmentsClient = new ProjectRoleAssignmentsClient(
      apiAddress,
      apiToken,
      opts
    )
  }

  /**
   * Returns a specialized client for managing project-level RoleAssignments.
   *
   * @returns a specialized client for managing project-level RoleAssignments
   */
  public roleAssignments(): ProjectRoleAssignmentsClient {
    return this.projectRoleAssignmentsClient
  }
}
