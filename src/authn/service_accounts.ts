import * as meta from "../meta"
import * as rm from "../rest_machinery"

import { Token } from "./tokens"

/**
 * Represents a non-human Brigade user, such as an Event gateway.
 */
export interface ServiceAccount {
  /**
   * Encapsulates ServiceAccount metadata
   */
  metadata: meta.ObjectMeta
  /**
   * A natural language description of the ServiceAccount's purpose
   */
  description: string
  /**
   * Indicates when the ServiceAccount has been locked out of the system by an
   * administrator. If this field's value is undefine or null, the
   * ServiceAccount is not locked.
   */
  locked?: Date
}

/**
 * Useful filter criteria when selecting multiple ServiceAccounts for API group
 * operations like list. It currently has no fields, but exists to preserve the
 * possibility of future expansion without having to change client function
 * signatures.
 */
export interface ServiceAccountsSelector {} // eslint-disable-line @typescript-eslint/no-empty-interface

/**
 * A specialized client for managing ServiceAccounts with the Brigade API.
 */
export class ServiceAccountsClient {
  private rmClient: rm.Client

  /**
   * Creates an instance of ServiceAccountsClient.
   *
   * @param apiAddress The base address (protocol + host name or IP) of the API
   * server
   * @param apiToken A bearer token for authenticating to the API server
   * @param [opts] Optional client configuration
   *
   * @example
   * new ServiceAccountsClient("https://brigade.example.com", apiToken, {allowInsecureConnections: true})
   */
  constructor(
    apiAddress: string,
    apiToken: string,
    opts?: rm.APIClientOptions
  ) {
    this.rmClient = new rm.Client(apiAddress, apiToken, opts)
  }

  /**
   * Creates a new ServiceAccount.
   *
   * @param serviceAccount A new ServiceAccount
   * @returns A non-expiring bearer token that may be used by the owner of the
   * new ServiceAccount
   * @throws An error if a ServiceAccount with the specified ID already exists
   */
  public async create(serviceAccount: ServiceAccount): Promise<Token> {
    const req = new rm.Request("POST", "v2/service-accounts")
    req.bodyObjKind = "ServiceAccount"
    req.bodyObj = serviceAccount
    req.successCode = 201
    return this.rmClient.executeRequest(req) as Promise<Token>
  }

  /**
   * Returns a (possibly paginated) list of ServiceAccounts ordered lexically by
   * ID. If, due to pagination, a list contains only a subset of all selected
   * ServiceAccounts, list metadata will contain values to be passed as options
   * to subsequent calls to retrieve subsequent pages.
   *
   * @param [selector] Optional selection criteria
   * @param [opts] Options used to retrieve a specific page from a paginated
   * list
   * @returns A list of ServiceAccounts
   */
  public async list(
    selector?: ServiceAccountsSelector,
    opts?: meta.ListOptions
  ): Promise<meta.List<ServiceAccount>> {
    // eslint-disable-line @typescript-eslint/no-unused-vars
    const req = new rm.Request("GET", "v2/service-accounts")
    req.listOpts = opts
    return this.rmClient.executeRequest(req) as Promise<
      meta.List<ServiceAccount>
    >
  }

  /**
   * Returns a ServiceAccount by ID.
   *
   * @param id Identifier of the requested ServiceAccount
   * @returns The requested ServiceAccount
   * @throws An error if the requested ServiceAccount is not found
   */
  public async get(id: string): Promise<ServiceAccount> {
    const req = new rm.Request("GET", `v2/service-accounts/${id}`)
    return this.rmClient.executeRequest(req) as Promise<ServiceAccount>
  }

  /**
   * Deletes a ServiceAccount.
   *
   * @param id Identifier of the ServiceAccount to delete
   */
  public async delete(id: string): Promise<void> {
    const req = new rm.Request("DELETE", `v2/service-accounts/${id}`)
    return this.rmClient.executeRequest(req) as Promise<void>
  }

  /**
   * Revokes system access for a ServiceAccount.
   *
   * @param id Identifier of the ServiceAccount to be locked
   * @throws An error if the specified ServiceAccount is not found
   */
  public async lock(id: string): Promise<void> {
    const req = new rm.Request("PUT", `v2/service-accounts/${id}/lock`)
    return this.rmClient.executeRequest(req) as Promise<void>
  }

  /**
   * Restores system access for a locked ServiceAccount.
   *
   * @param id Identifier of the ServiceAccount to be unlocked
   * @returns a new, non-expiring bearer token that may be used by the owner of
   * the ServiceAccount
   * @throws An error if the specified ServiceAccount is not found
   */
  public async unlock(id: string): Promise<Token> {
    const req = new rm.Request("DELETE", `v2/service-accounts/${id}/lock`)
    return this.rmClient.executeRequest(req) as Promise<Token>
  }
}
