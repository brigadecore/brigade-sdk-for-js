import * as rm from "../rest_machinery"

import { ContainerSpec } from "./containers"
import { Job, JobsClient } from "./jobs"

/**
 * Represents the desired granularity of Worker log output.
 */
export enum LogLevel {
  /**
   * DEBUG level granularity in Worker log output
   */
  Debug = "DEBUG",
  /**
   * INFO level granularity in Worker log output
   */
  Info = "INFO",
  /**
   * WARN level granularity in Worker log output
   */
  Warn = "WARN",
  /**
   * ERROR level granularity in Worker log output
   */
  Error = "ERROR"
}

/**
 * A type whose values represent where a Worker is within its lifecycle.
 */
export enum WorkerPhase {
  /**
   * Represents the state wherein a Worker was forcefully stopped during
   * execution
   */
  Aborted = "ABORTED",
  /**
   * Represents the state wherein a pending Worker was canceled prior to
   * execution
   */
  Canceled = "CANCELED",
  /**
   * Represents the state wherein a Worker has run to completion but experienced
   * errors
   */
  Failed = "FAILED",
  /**
   * Represents the state wherein a Worker is awaiting execution
   */
  Pending = "PENDING",
  /**
   * Represents the state wherein a Worker is currently being executed
   */
  Running = "RUNNING",
  /**
   * Represents the state wherein a Worker was not scheduled due to some
   * unexpected and unrecoverable error encountered by the scheduler
   */
  SchedulingFailed = "SCHEDULING_FAILED",
  /**
   * Represents the state wherein a Worker is starting on the substrate but isn't
   * running yet
   */
  Starting = "STARTING",
  /**
   * Represents the state where a Worker has run to completion without error
   */
  Succeeded = "SUCCEEDED",
  /**
   * Represents the state wherein a Worker has has not completed within a
   * designated timeframe
   */
  TimedOut = "TIMED_OUT",
  /**
   * Represents the state wherein a Workers's state is unknown. Note that this
   * is possible if and only if the underlying workload execution substrate
   * (Kubernetes), for some unanticipated reason, does not know the Worker's
   * (Pod's) state
   */
  Unknown = "UNKNOWN"
}

/**
 * For convenience, an array of all possible Worker phases.
 */
export const WorkerPhasesAll: WorkerPhase[] = [
  WorkerPhase.Aborted,
  WorkerPhase.Canceled,
  WorkerPhase.Failed,
  WorkerPhase.Pending,
  WorkerPhase.Running,
  WorkerPhase.SchedulingFailed,
  WorkerPhase.Starting,
  WorkerPhase.Succeeded,
  WorkerPhase.TimedOut,
  WorkerPhase.Unknown
]

/**
 * For convenience, an array of all terminal Worker phases. Useful when
 * searching for all Events with Workers in a terminal phase.
 */
export const WorkerPhasesTerminal: WorkerPhase[] = [
  WorkerPhase.Aborted,
  WorkerPhase.Canceled,
  WorkerPhase.Failed,
  WorkerPhase.SchedulingFailed,
  WorkerPhase.Succeeded,
  WorkerPhase.TimedOut
]

/**
 * For convenience, an array of all non-terminal Worker phases. Useful when
 * searching for all Events with Workers in a non-terminal phase.
 */
export const WorkerPhasesNonTerminal: WorkerPhase[] = [
  WorkerPhase.Pending,
  WorkerPhase.Running,
  WorkerPhase.Starting,
  WorkerPhase.Unknown
]

/**
 * A component that orchestrates handling of a single Event.
 */
export interface Worker {
  /**
   * The technical blueprint for the Worker
   */
  spec: WorkerSpec
  /**
   * Contains details of the Worker's current state
   */
  status: WorkerStatus
  /**
   * Contains details of all Jobs spawned by the Worker during handling of
   * the Event
   */
  jobs?: Job[]
}

/**
 * The technical blueprint for a Worker.
 */
export interface WorkerSpec {
  /**
   * Specifies the details of an OCI container that forms the
   * cornerstone of the Worker
   */
  container?: ContainerSpec
  /**
   * Indicates whether the Worker and/or any Jobs it may spawn requires access
   * to a shared workspace. When false or unspecified, no such workspace is
   * provisioned prior to Worker creation.
   */
  useWorkspace?: boolean
  /**
   * If applicable, specifies the size of a volume that will be provisioned as a
   * shared workspace for the Worker and any Jobs it spawns. The value can be
   * expressed in bytes (as a plain integer) or as a fixed-point integer using
   * one of these suffixes: E, P, T, G, M, K. Power-of-two equivalents may also
   * be used: Ei, Pi, Ti, Gi, Mi, Ki.
   */
  workspaceSize?: string
  /**
   * Contains git-specific Worker details
   */
  git?: GitConfig
  /**
   * Contains Kubernetes-specific Worker details
   */
  kubernetes?: KubernetesConfig
  /**
   * Specifies policies for any Jobs spawned by the Worker
   */
  jobPolicies?: JobPolicies
  /**
   * Specifies the desired granularity of Worker log output
   */
  logLevel?: LogLevel
  /**
   * Specifies a directory within the Worker's workspace where any relevant
   * configuration files (e.g. brigade.js, package.json, etc.) can be located
   */
  configFilesDirectory?: string
  /**
   * A map of configuration file names to configuration file content. This is
   * useful for Workers that do not integrate with any source control system and
   * would like to embed configuration (e.g. package.json) or scripts (e.g.
   * brigade.js) directly within the WorkerSpec.
   */
  defaultConfigFiles?: { [key: string]: string }
}

/**
 * Git-specific Worker configuration. These can be overridden by Event-specific
 * Git details.
 */
export interface GitConfig {
  /**
   * Specifies the location from where a source code repository may be cloned
   */
  cloneURL?: string
  /**
   * Specifies a commit (by sha) to be checked out. If specified, takes
   * precedence over any tag or branch specified by the ref field.
   */
  commit?: string
  /**
   * Specifies a tag or branch to be checked out. If left blank, this will
   * default to "master" at runtime.
   */
  ref?: string
  /**
   * Indicates whether to clone the repository's submodules
   */
  initSubmodules?: boolean
}

/**
 * Kubernetes-specific Worker or Job configuration.
 */
export interface KubernetesConfig {
  /**
   * Enumerates any image pull secrets that Kubernetes may use when pulling the
   * OCI image on which a Worker's or Job's container is based. This field only
   * needs to be utilized in the case of private, custom Worker or Job images.
   * The image pull secrets in question must be created out-of-band by a
   * sufficiently authorized user of the Kubernetes cluster.
   */
  imagePullSecrets?: string[]
}

/**
 * Describes policies for any Jobs spawned by a Worker.
 */
export interface JobPolicies {
  /**
   * Specifies whether the Worker is permitted to launch Jobs that utilize
   * privileged containers
   */
  allowPrivileged?: boolean
  /**
   * Specifies whether the Worker is permitted to launch Jobs that mount the
   * underlying host's Docker socket into its own file system
   *
   * Host Docker socket access may be disallowed by Brigade project configuration.
   * If so, the container will run without such access.
   *
   * Note: This is being removed for the 2.0.0 release because of security
   * issues AND declining usefulness. (Many Kubernetes distros now use
   * containerd instead of Docker.) This can be put back in the future if the
   * need is proven AND if it can be done safely.
   *
   * For more details, see https://github.com/brigadecore/brigade/issues/1666
   */
  // allowDockerSocketMount?: boolean
}

/**
 * Represents the status of a Worker.
 */
export interface WorkerStatus {
  /**
   * Indicates the time the Worker began execution. It will be undefined for
   * a Worker that is not yet executing.
   */
  started?: Date
  /**
   * Indicates the time the Worker concluded execution. It will be undefined
   * for a Worker that is not done executing (or hasn't started).
   */
  ended?: Date
  /**
   * Indicates where the Worker is in its lifecycle
   */
  phase?: WorkerPhase
}

class WorkerStatusStream extends rm.ServerSentEventStream<WorkerStatus> {
  constructor(path: string, apiToken: string, opts: rm.APIClientOptions) {
    super(path, apiToken, opts)
  }
}

/**
 * A specialized client for managing Workers with the Brigade API.
 */
export class WorkersClient {
  private apiAddress: string
  private apiToken: string
  private opts: rm.APIClientOptions
  private rmClient: rm.Client
  private jobsClient: JobsClient

  /**
   * Creates an instance of WorkersClient.
   *
   * @param apiAddress The base address (protocol + host name or IP) of the API
   * server
   * @param apiToken A bearer token for authenticating to the API server
   * @param [opts] Optional client configuration
   *
   * @example
   * new WorkersClient("https://brigade.example.com", apiToken, {allowInsecureConnections: true})
   */
  constructor(
    apiAddress: string,
    apiToken: string,
    opts?: rm.APIClientOptions
  ) {
    this.apiAddress = apiAddress
    this.apiToken = apiToken
    this.opts = opts || {}
    this.rmClient = new rm.Client(apiAddress, apiToken, opts)
    this.jobsClient = new JobsClient(apiAddress, apiToken, opts)
  }

  /**
   * Initiates execution of a pending Worker.
   *
   * @param eventID The ID of the Event the Worker belongs to
   * @throws An error if the specified Event is not found
   */
  public async start(eventID: string): Promise<void> {
    const req = new rm.Request("PUT", `v2/events/${eventID}/worker/start`)
    return this.rmClient.executeRequest(req) as Promise<void>
  }

  /**
   * Returns a Worker's status
   *
   * @param eventID The ID of the Event the Worker belongs to
   * @returns The Worker's status
   * @throws An error if the specified Event is not found
   */
  public async getStatus(eventID: string): Promise<WorkerStatus> {
    const req = new rm.Request("GET", `v2/events/${eventID}/worker/status`)
    return this.rmClient.executeRequest(req) as Promise<WorkerStatus>
  }

  public watchStatus(eventID: string): WorkerStatusStream {
    return new WorkerStatusStream(
      `${this.apiAddress}/v2/events/${eventID}/worker/status?watch=true&sse=true`,
      this.apiToken,
      this.opts
    )
  }

  /**
   * Updates the status of a Worker.
   *
   * @param eventID The ID of the Event the Worker belongs to
   * @param status The new Worker status
   * @throws An error if the specified Event is not found
   * @throws An error if the effective state change is invalid
   */
  public async updateStatus(
    eventID: string,
    status: WorkerStatus
  ): Promise<void> {
    const req = new rm.Request("PUT", `v2/events/${eventID}/worker/status`)
    req.bodyObjKind = "WorkerStatus"
    req.bodyObj = status
    return this.rmClient.executeRequest(req) as Promise<void>
  }

  /**
   * Cleans up after a completed Worker.
   *
   * @param eventID The ID of the Event the Worker belongs to
   * @throws An error if the specified Event is not found
   */
  public async cleanup(eventID: string): Promise<void> {
    const req = new rm.Request("PUT", `v2/events/${eventID}/worker/cleanup`)
    return this.rmClient.executeRequest(req) as Promise<void>
  }

  /**
   * Returns a specialized client for managing Jobs.
   *
   * @returns A specialized client for managing Jobs
   */
  public jobs(): JobsClient {
    return this.jobsClient
  }
}
