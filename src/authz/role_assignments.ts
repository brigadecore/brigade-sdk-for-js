import * as meta from "../meta"
import { PrincipalReference, PrincipalType } from "../lib/authz/principals"
import { Role } from "../lib/authz/roles"
import { RoleAssignment } from "../lib/authz/role_assignments"
import * as rm from "../rest_machinery"

/**
 * Represents a principal that is a ServiceAccount.
 */
export const PrincipalTypeServiceAccount: PrincipalType = "SERVICE_ACCOUNT"

/**
 * Represents a principal that is a User.
 */
export const PrincipalTypeUser: PrincipalType = "USER"

/**
 * Represents useful filter criteria when selecting multiple RoleAssignments for
 * API group operations like list.
 */
export interface RoleAssignmentsSelector {
  /**
   * Specifies that only RoleAssignments for the specified Principal should be
   * selected.
   */
  principal?: PrincipalReference
	/**
   * Specifies that only RoleAssignments for the specified Role should be
   * selected.
   */
  role?: Role
}

/**
 * A specialized client for managing system-level RoleAssignments with the
 * Brigade API.
 */
export class RoleAssignmentsClient {
  private rmClient: rm.Client

  /**
   * Creates an instance of RolesClient.
   *
   * @param apiAddress The base address (protocol + host name or IP) of the API
   * server
   * @param apiToken A bearer token for authenticating to the API server
   * @param [opts] Optional client configuration
   *
   * @example
   * new RolesClient("https://brigade.example.com", apiToken, {allowInsecureConnections: true})
   */
  constructor(apiAddress: string, apiToken: string, opts?: rm.APIClientOptions) {
    this.rmClient = new rm.Client(apiAddress, apiToken, opts)
  }

  /**
   * Returns a list of RoleAssignments, ordered by principal type, principalID,
   * role, and scope.
   * 
   * @param [selector] Optional selection criteria
   * @param [opts] Options used to retrieve a specific page from a paginated
   * list
   * @returns A list of RoleAssignments
   */
  public async list(selector?: RoleAssignmentsSelector, opts?: meta.ListOptions): Promise<meta.List<RoleAssignment>> {
    const req = new rm.Request("GET", "v2/role-assignments")
    req.listOpts = opts
    req.queryParams = new Map<string, string>()
    if (selector) {
      if (selector.principal) {
        req.queryParams.set("principalType", String(selector.principal.type))
        req.queryParams.set("principalID", selector.principal.id)
      }
      if (selector.role) {
        req.queryParams.set("role", String(selector.role))
      }
    }
    return this.rmClient.executeRequest(req) as Promise<meta.List<RoleAssignment>> 
  }

  /**
   * Grants a system-level Role to a principal.
   * 
   * @param roleAssignment Specifies the Role to grant and who to grant it to
   * @throws An error if the specified Role or principal does not exist
   */
  public async grant(roleAssignment: RoleAssignment): Promise<void> {
    const req = new rm.Request("POST", "v2/role-assignments")
    req.bodyObjKind = "RoleAssignment"
    req.bodyObj = roleAssignment
    return this.rmClient.executeRequest(req) as Promise<void>
  }

  /**
   * Revokes a system-level Role from a principal.
   *
   * @param roleAssignment Specifies the Role to revoke and who to revoke it
   * from
   * @throws An error if the specified principal does not exist
   */
  public async revoke(roleAssignment: RoleAssignment): Promise<void> {
    const req = new rm.Request("DELETE", "v2/role-assignments")
    req.queryParams = new Map<string, string>()
    req.queryParams.set("role", String(roleAssignment.role))
    req.queryParams.set("principalType", String(roleAssignment.principal.type))
    req.queryParams.set("principalID", roleAssignment.principal.id)
    if (roleAssignment.scope) {
      req.queryParams.set("scope", String(roleAssignment.scope))
    }
    return this.rmClient.executeRequest(req) as Promise<void>
  }
}
