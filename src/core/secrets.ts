import * as meta from "../meta"
import * as rm from "../rest_machinery"

/**
 * Project-level sensitive information.
 */
export interface Secret {
  /**
   * A key by which the secret can referred
   */
  key: string
  /**
   * Sensitive information. This is a write-only field.
   */
  value: string
}

/**
 * A specialized client for managing Project Secrets with the Brigade API.
 */
export class SecretsClient {
  private rmClient: rm.Client

  /**
   * Creates an instance of SecretsClient.
   *
   * @param apiAddress The base address (protocol + host name or IP) of the API
   * server
   * @param apiToken A bearer token for authenticating to the API server
   * @param [opts] Optional client configuration
   *
   * @example
   * new SecretsClient("https://brigade.example.com", apiToken, {allowInsecureConnections: true})
   */
  constructor(
    apiAddress: string,
    apiToken: string,
    opts?: rm.APIClientOptions
  ) {
    this.rmClient = new rm.Client(apiAddress, apiToken, opts)
  }

  /**
   * Returns a (possibly paginated) list of Secrets ordered lexically by
   * key. If, due to pagination, a list contains only a subset of all Project
   * Secrets, list metadata will contain values to be passed as options
   * to subsequent calls to retrieve subsequent pages.
   *
   * Note: All Secret values are redacted. i.e. Once a Secret is set, end
   * clients are unable to retrieve values.
   *
   * @param projectID
   * @param [opts] Options used to retrieve a specific page from a paginated
   * list
   * @returns A list of Secrets
   * @throws An error if the specified Project does not exist
   */
  public async list(
    projectID: string,
    opts?: meta.ListOptions
  ): Promise<meta.List<Secret>> {
    // eslint-disable-line @typescript-eslint/no-unused-vars
    const req = new rm.Request("GET", `v2/projects/${projectID}/secrets`)
    req.listOpts = opts
    return this.rmClient.executeRequest(req) as Promise<meta.List<Secret>>
  }

  /**
   * Sets the value of a new Secret or updates the value of an existing Secret.
   * If the specified Key does not exist, it is created. If the specified Key
   * does exist, its corresponding Value is overwritten.
   *
   * @param projectID The Project the secret belongs to
   * @param secret A secret
   */
  public async set(projectID: string, secret: Secret): Promise<void> {
    const req = new rm.Request(
      "PUT",
      `v2/projects/${projectID}/secrets/${secret.key}`
    )
    req.bodyObjKind = "Secret"
    req.bodyObj = secret
    return this.rmClient.executeRequest(req) as Promise<void>
  }

  /**
   * Clears the value of an existing Secret.
   *
   * Note: If the specified Key does not exist, no error is returned.
   *
   * @param projectID The Project the secret belongs to
   * @param key The key of the Secret to be cleared
   */
  public async unset(projectID: string, key: string): Promise<void> {
    const req = new rm.Request(
      "DELETE",
      `v2/projects/${projectID}/secrets/${key}`
    )
    return this.rmClient.executeRequest(req) as Promise<void>
  }
}
