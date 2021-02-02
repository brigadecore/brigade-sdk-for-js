import * as querystring from "querystring"

import * as rm from "../rest_machinery"

/**
 * One line of output from an OCI container.
 */
export interface LogEntry {
  /**
   * The time the line was written
   */
  time?: Date
  /**
   * A single line of log output from an OCI container
   */
  message: string
}

/**
 * Useful criteria for selecting logs to be streamed from any container
 * belonging to some Worker OR any container belonging to Jobs spawned by that
 * Worker.
 */
export interface LogsSelector {
  /**
   * Specifies, by name, a Job spawned by some Worker. If not specified, log
   * streaming operations presume logs are desired for the Worker itself.
   */
  job?: string
  /**
   * Specifies, by name, a container belonging to some Worker or, if Job is
   * specified, that Job. If not specified, log streaming operations presume
   * logs are desired from a container having the same name as the selected
   * Worker or Job.
   */
  container?: string
}

/**
 * Useful options for streaming logs from some container of a Worker or Job.
 */
export interface LogStreamOptions {
  /**
   * Indicates whether the stream should conclude after the last available line
   * of logs has been sent to the client (false or unspecified) or remain open
   * until closed by the client (true), continuing to send new lines as they
   * become available.
   */
  follow?: boolean
}

class LogEntryStream extends rm.ServerSentEventStream<LogEntry> {
  constructor(path: string, apiToken: string, opts: rm.APIClientOptions) {
    super(path, apiToken, opts)
  }
}

/**
 * A specialized client for managing Logs with the Brigade API.
 */
export class LogsClient {
  private apiAddress: string
  private apiToken: string
  private opts: rm.APIClientOptions

  constructor(apiAddress: string, apiToken: string, opts?: rm.APIClientOptions) {
    this.apiAddress = apiAddress
    this.apiToken = apiToken
    this.opts = opts || {}
  }

  public stream(eventID: string, selector?: LogsSelector, opts?: LogStreamOptions): LogEntryStream {
    const queryParams: any = { // eslint-disable-line @typescript-eslint/no-explicit-any
      sse: "true"
    }

    selector = selector || {}
    if (selector.container) {
      queryParams["container"] = selector.container
    }
    if (selector.job) {
      queryParams["job"] = selector.job
    }

    opts = opts || {}
    if (opts.follow) {
      queryParams["follow"] = opts.follow
    }

    return new LogEntryStream(
      `${this.apiAddress}/v2/events/${eventID}/logs?${querystring.encode(queryParams)}`,
      this.apiToken,
      this.opts,
    )
  }
}
