
import { Role } from "../lib/authz/roles"
import * as rm from "../rest_machinery"

/**
 * A type whose values can be used to disambiguate one type of principal from
 * another. For instance, when assigning a Role to a principal via a
 * RoleAssignment, a PrincipalType field is used to indicate whether the value
 * of the PrincipalID field reflects a User ID or a ServiceAccount ID.
 */
export enum PrincipalType {
  /**
   * Represents a principal that is a ServiceAccount
   */
  ServiceAccount = "SERVICE_ACCOUNT",
  /**
   * Represents a principal that is a User
   */
  User = "USER"
}

// A reference to any sort of security principal (human user, service account,
// etc.)
export interface PrincipalReference {
	/**
	 * Type qualifies what kind of principal is referenced by the ID field-- for
	 * instance, a User or a ServiceAccount
	 */
	type: PrincipalType
	/**
	 * ID references a principal. The Type qualifies what type of principal that
	 * is-- for instance, a User or a ServiceAccount.
	 */
	id: string
}

/**
 * Represents the assignment of a Role to a principal.
 */
export interface RoleAssignment {
	/**
	 * Assigns a Role to the specified principal
	 */
	role: Role
	/**
	 * Specifies the principal to whom the Role is assigned
	 */
	principal: PrincipalReference
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
    req.queryParams.set("roleType", String(roleAssignment.role.type))
    req.queryParams.set("roleName", String(roleAssignment.role.name))
    req.queryParams.set("principalType", String(roleAssignment.principal.type))
    req.queryParams.set("principalID", roleAssignment.principal.id)
    if (roleAssignment.role.scope) {
      req.queryParams.set("roleScope", String(roleAssignment.role.scope))
    }
    return this.rmClient.executeRequest(req) as Promise<void>
  }
}
