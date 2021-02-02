import * as authn from "./authn"
import * as authz from "./authz"
import * as core from "./core"
import * as rm from "./rest_machinery"


/**
 * APIClient is the root of a tree of more specialized Brigade API clients.
 */
export class APIClient {
  private authnClient: authn.APIClient
  private authzClient: authz.APIClient
  private coreClient: core.APIClient

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
    this.authnClient = new authn.APIClient(apiAddress, apiToken, opts)
    this.authzClient = new authz.APIClient(apiAddress, apiToken, opts)
    this.coreClient = new core.APIClient(apiAddress, apiToken, opts)
  }

  /**
   * Returns a specialized client for managing identity and authentication
   * concerns.
   * 
   * @returns A specialized client for for managing identity, authentication,
   * and authorization concerns
   */
  public authn(): authn.APIClient {
    return this.authnClient
  }

  /**
   * Returns a specialized client for managing system-wide authorization
   * configuration.
   * 
   * @returns A specialized client for for managing system-wide Brigade
   * configuration
   */
  public authz(): authz.APIClient {
    return this.authzClient
  }

  /**
   * Returns a specialized client for managing core Brigade resources such as
   * Projects and Events.
   * 
   * @returns A specialized client for for managing core Brigade resources such
   * as Projects and Events
   */
  public core(): core.APIClient {
    return this.coreClient
  }

}
