import * as meta from "../meta"
import * as rm from "../rest_machinery"

/**
 * Represents a (presumably human) Brigade user.
 */
export interface User {
  /**
   * encapsulates User metadata
   */
  metadata: meta.ObjectMeta
  /**
   * The given name and surname of the User
   */
  name: string
  /**
   * Indicates when the User has been locked out of the system by an
   * administrator. If this field's value is undefine or null, the User is not
   * locked.
   */
  locked?: Date
}

/**
 * Useful filter criteria when selecting multiple Users for API group operations
 * like list. It currently has no fields, but exists to preserve the possibility
 * of future expansion without having to change client function signatures.
 */
export interface UsersSelector{} // eslint-disable-line @typescript-eslint/no-empty-interface

/**
 * A specialized client for managing Users with the Brigade API.
 */
export class UsersClient {
  private rmClient: rm.Client

  /**
   * Creates an instance of UsersClient.
   *
   * @param apiAddress The base address (protocol + host name or IP) of the API
   * server
   * @param apiToken A bearer token for authenticating to the API server
   * @param [opts] Optional client configuration
   *
   * @example
   * new UsersClient("https://brigade.example.com", apiToken, {allowInsecureConnections: true})
   */
  constructor(apiAddress: string, apiToken: string, opts?: rm.APIClientOptions) {
    this.rmClient = new rm.Client(apiAddress, apiToken, opts)
  }

  /**
   * Returns a (possibly paginated) list of Users ordered lexically by ID. If,
   * due to pagination, a list contains only a subset of all selected Users,
   * list metadata will contain values to be passed as options to subsequent
   * calls to retrieve subsequent pages.
   * 
   * @param [selector] Optional selection criteria
   * @param [opts] Options used to retrieve a specific page from a paginated
   * list 
   * @returns A list of Users
   */
  public async list(selector?: UsersSelector, opts?: meta.ListOptions): Promise<meta.List<User>> { // eslint-disable-line @typescript-eslint/no-unused-vars
    const req = new rm.Request("GET", "v2/users")
    req.listOpts = opts
    return this.rmClient.executeRequest(req) as Promise<meta.List<User>>
  }

  /**
   * Returns a User by ID.
   * 
   * @param id Identifier of the requested User
   * @returns The requested User
   * @throws An error if the requested User is not found
   */
  public async get(id: string): Promise<User> {
    const req = new rm.Request("GET", `v2/users/${id}`)
    return this.rmClient.executeRequest(req) as Promise<User>
  }

  /**
   * Deletes a User.
   * 
   * @param id Identifier of the User to delete
   */
  public async delete(id: string): Promise<void> {
    const req = new rm.Request("DELETE", `v2/users/${id}`)
    return this.rmClient.executeRequest(req) as Promise<void>
  }

  /**
   * Revokes system access for a User.
   * 
   * @param id Identifier of the User to be locked
   * @throws An error if the specified User is not found
   */
  public async lock(id: string): Promise<void> {
    const req = new rm.Request("PUT", `v2/users/${id}/lock`)
    return this.rmClient.executeRequest(req) as Promise<void>
  }

  /**
   * Restores system access for a locked User.
   *
   * @param id Identifier of the User to be unlocked
   * @throws An error if the specified User is not found
   */
  public async unlock(id: string): Promise<void> {
    const req = new rm.Request("DELETE", `v2/users/${id}/lock`)
    return this.rmClient.executeRequest(req) as Promise<void>
  }
}
