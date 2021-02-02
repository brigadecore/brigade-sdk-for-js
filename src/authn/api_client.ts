import * as rm from "../rest_machinery"

import { ServiceAccountsClient } from "./service_accounts"
import { SessionsClient } from "./sessions"
import { UsersClient } from "./users"

/**
 * APIClient is the root of a tree of more specialized API clients within the
 * authn module.
 */
export class APIClient {
  private serviceAccountsClient: ServiceAccountsClient
  private sessionsClient: SessionsClient
  private usersClient: UsersClient

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
    this.serviceAccountsClient = new ServiceAccountsClient(apiAddress, apiToken, opts)
    this.sessionsClient = new SessionsClient(apiAddress, apiToken, opts)
    this.usersClient = new UsersClient(apiAddress, apiToken, opts)
  }

  /**
   * Returns a specialized client for ServiceAccount management.
   * 
   * @returns A specialized client for ServiceAccount management
   */
  public serviceAccounts(): ServiceAccountsClient {
    return this.serviceAccountsClient
  }

  /**
   * Returns a specialized client for Session management.
   * 
   * @returns A specialized client for Session management
   */
  public sessions(): SessionsClient {
    return this.sessionsClient
  }

  /**
   * Returns a specialized client for User management.
   * 
   * @returns A specialized client for User management
   */
  public users(): UsersClient {
    return this.usersClient
  }

}
