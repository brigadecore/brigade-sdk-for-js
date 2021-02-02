import { RoleAssignment } from "../authz"
import * as rm from "../rest_machinery"

/**
 * A specialized client for managing project-level RoleAssignments with the
 * Brigade API.
 */
export class ProjectRoleAssignmentsClient {
  private rmClient: rm.Client

  /**
   * Creates an instance of ProjectRoleAssignmentsClient.
   *
   * @param apiAddress The base address (protocol + host name or IP) of the API
   * server
   * @param apiToken A bearer token for authenticating to the API server
   * @param [opts] Optional client configuration
   *
   * @example
   * new ProjectRoleAssignmentsClient("https://brigade.example.com", apiToken, {allowInsecureConnections: true})
   */
  constructor(apiAddress: string, apiToken: string, opts?: rm.APIClientOptions) {
    this.rmClient = new rm.Client(apiAddress, apiToken, opts)
  }

  /**
   * Grants a project-level Role to a principal.
   *
   * @param roleAssignment Specifies the Role to grant and who to grant it to
   * @throws An error if the specified Project, Role, or principal does not
   * exist
   */
  public grant(roleAssignment: RoleAssignment): Promise<void> {
    const req = new rm.Request("POST", "v2/project-role-assignments")
    req.bodyObjKind = "RoleAssignment"
    req.bodyObj = roleAssignment
    return this.rmClient.executeRequest(req) as Promise<void>
  }

  /**
   * Revokes a project-level Role from a principal.
   *
   * @param roleAssignment Specifies the Role to revoke and who to revoke it
   * from
   * @throws An error if the specified Project or principal does not exist
   */
  public revoke(roleAssignment: RoleAssignment): Promise<void> {
    const req = new rm.Request("DELETE", "v2/project-role-assignments")
    req.queryParams = new Map<string, string>()
    req.queryParams.set("roleType", String(roleAssignment.role.type))
    req.queryParams.set("roleName", String(roleAssignment.role.name))
    req.queryParams.set("roleScope", String(roleAssignment.role.scope))
    req.queryParams.set("principalType", String(roleAssignment.principal.type))
    req.queryParams.set("principalID", roleAssignment.principal.id)
    return this.rmClient.executeRequest(req) as Promise<void>
  }
}
