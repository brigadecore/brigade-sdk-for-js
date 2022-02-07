import * as meta from "../meta"
import { PrincipalReference, Role } from "../lib/authz"
import * as rm from "../rest_machinery"

/**
 * Represents the assignment of a ProjectRole to a principal such as a User or
 * ServiceAccount.
 */
export interface ProjectRoleAssignment {
	/**
	 * Qualifies the scope of the Role
	 */
  projectID?: string
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
 * Represents useful filter criteria when selecting multiple
 * ProjectRoleAssignments for API group operations like list.
 */
export interface ProjectRoleAssignmentsSelector {
  /**
   * Specifies that only ProjectRoleAssignments for the specified Principal
   * should be selected.
   */
  principal?: PrincipalReference
	/**
   * Specifies that only ProjectRoleAssignments for the specified Role should be
   * selected.
   */
  role?: Role
}

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
   * @param projectID The Project ID
   * @param projectRoleAssignment Specifies the project-level Role to grant and who to
   * grant it to
   * @throws An error if the specified Project, Role, or principal does not
   * exist
   */
  public grant(projectID: string, projectRoleAssignment: ProjectRoleAssignment): Promise<void> {
    // Blank this out because the schema won't accept it.
    delete projectRoleAssignment.projectID
    const req = new rm.Request("POST", `v2/projects/${projectID}/role-assignments`)
    req.bodyObjKind = "ProjectRoleAssignment"
    req.bodyObj = projectRoleAssignment
    return this.rmClient.executeRequest(req) as Promise<void>
  }

  /**
   * Returns a list of ProjectRoleAssignments ordered by principal type,
   * principalID, and role.
   * 
   * @param projectID The Project ID
   * @param [selector] Optional selection criteria
   * @param [opts] Options used to retrieve a specific page from a paginated
   * @returns A list of ProjectRoleAssignments
   */
  public async list(projectID: string, selector?: ProjectRoleAssignmentsSelector, opts?: meta.ListOptions): Promise<meta.List<ProjectRoleAssignment>> {
    let path = "v2/project-role-assignments"
    if (projectID && projectID !== "") {
      path = `v2/projects/${projectID}/role-assignments`
    }
    const req = new rm.Request("GET", path)
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
    return this.rmClient.executeRequest(req) as Promise<meta.List<ProjectRoleAssignment>> 
  }

  /**
   * Revokes a project-level Role from a principal.
   *
   * @param projectID The Project ID
   * @param roleAssignment Specifies the Role to revoke and who to revoke it
   * from
   * @throws An error if the specified Project or principal does not exist
   */
  public revoke(projectID: string, roleAssignment: ProjectRoleAssignment): Promise<void> {
    const req = new rm.Request("DELETE", `v2/projects/${projectID}/role-assignments`)
    req.queryParams = new Map<string, string>()
    req.queryParams.set("role", String(roleAssignment.role))
    req.queryParams.set("principalType", String(roleAssignment.principal.type))
    req.queryParams.set("principalID", roleAssignment.principal.id)
    return this.rmClient.executeRequest(req) as Promise<void>
  }
}
