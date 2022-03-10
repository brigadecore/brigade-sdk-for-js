import { encode } from "js-base64"

import * as rm from "../rest_machinery"

import { Token } from "./tokens"

/**
 * Encapsulates user-specified options when creating a new Session that will
 * authenticate using a third-party identity provider.
 */
export interface ThirdPartyAuthOptions {
  /**
   * Indicates where users should be redirected to after successful completion
   * of a third-party authentication workflow. If this is left unspecified,
   * users will be redirected to a default success page.
   */
  successURL: string
}

/**
 * Encapsulates all information required for a client authenticating by means of
 * a third-party identity provider to complete the authentication workflow.
 */
export interface ThirdPartyAuthDetails {
  /**
   * A URL that can be requested in a user's web browser to complete
   * authentication via a third-party identity provider.
   */
  authURL: string
  /**
   * An opaque bearer token issued by Brigade to correlate a User with a
   * Session. It remains unactivated (useless) until the authentication workflow
   * is successfully completed. Clients may expect that that the token expires
   * (at an interval determined by a system administrator) and, for simplicity,
   * is NOT refreshable. When the token has expired, re-authentication is
   * required.
   */
  token: string
}

/**
 * A specialized client for managing Brigade API Sessions.
 */
export class SessionsClient {
  private rmClient: rm.Client

  /**
   * Creates an instance of SessionsClient.
   *
   * @param apiAddress The base address (protocol + host name or IP) of the API
   * server
   * @param apiToken A bearer token for authenticating to the API server
   * @param [opts] Optional client configuration
   *
   * @example
   * new SessionsClient("https://brigade.example.com", apiToken, {allowInsecureConnections: true})
   */
  constructor(
    apiAddress: string,
    apiToken: string,
    opts?: rm.APIClientOptions
  ) {
    this.rmClient = new rm.Client(apiAddress, apiToken, opts)
  }

  /**
   * Creates a Session for Brigade's root user (if enabled by the system
   * administrator). In contrast to most other operations exposed by the Brigade
   * API, a valid token is NOT required to invoke this.
   *
   * @param password The root password
   * @returns A bearer token with a short expiry period (determined by a system
   * administrator)
   */
  public async createRootSession(password: string): Promise<Token> {
    const req = new rm.Request("POST", "v2/sessions")
    req.includeTokenAuthHeader = false
    req.headers = new Map<string, string>([
      ["Authorization", `Basic ${encode(`root:${password}`)}`]
    ])
    req.queryParams = new Map<string, string>([["root", "true"]])
    req.successCode = 201
    return this.rmClient.executeRequest(req) as Promise<Token>
  }

  /**
   * Creates a new User Session and initiates an authentication workflow with a
   * third-party identity provider.
   *
   * @returns Details needed to continue the authentication process with a
   * third-party identity provider.
   */
  public async createUserSession(
    opts?: ThirdPartyAuthOptions
  ): Promise<ThirdPartyAuthDetails> {
    const req = new rm.Request("POST", "v2/sessions")
    if (opts?.successURL) {
      req.queryParams = new Map<string, string>([
        ["successURL", opts.successURL]
      ])
    }
    req.includeTokenAuthHeader = false
    req.successCode = 201
    return this.rmClient.executeRequest(req) as Promise<ThirdPartyAuthDetails>
  }

  /**
   * Deletes the current Session.
   */
  public async delete(): Promise<void> {
    const req = new rm.Request("DELETE", "v2/session")
    return this.rmClient.executeRequest(req) as Promise<void>
  }
}
