import * as rm from "../rest_machinery"

import { ContainerSpec } from "./containers"

/**
 * A type whose values represent where a Job is within its lifecycle.
 */
export enum JobPhase {
  /**
   * Represents the state wherein a Job was forcefully stopped during execution
   */
  Aborted = "ABORTED",
  /**
   * Represents the state wherein a Job has run to completion but experienced
   * errors
   */
  Failed = "FAILED",
  /**
   * Represents the state wherein a Job is awaiting execution
   */
  Pending = "PENDING",
  /**
   * Represents the state wherein a Job is currently being executed
   */
  Running = "RUNNING",
  /**
   * Represents the state wherein a Job was not scheduled due to some unexpected
   * and unrecoverable error encountered by the scheduler
   */
  SchedulingFailed = "SCHEDULING_FAILED",
  /**
   * Represents the state wherein a Job is starting on the substrate but isn't
   * running yet
   */
  Starting = "STARTING",
  /**
   * Represents the state where a Job has run to completion without error
   */
  Succeeded = "SUCCEEDED",
  /**
   * Represents the state wherein a Job has has not completed within a
   * designated timeframe
   */
  TimedOut = "TIMED_OUT",
  /**
   * Represents the state wherein a Job's state is unknown. Note that this is
   * possible if and only if the underlying workload execution substrate
   * (Kubernetes), for some unanticipated reason, does not know the Job's
   * (Pod's) state
   */
  Unknown = "UNKNOWN"
}

/**
 * A component spawned by a Worker to complete a single task in the course of
 * handling an Event.
 */
export interface Job {
  /**
   * The Job's name. Must be unique per Worker.
   */
  name: string
  /**
   * The technical blueprint for the Job
   */
  spec: JobSpec
  /**
   * Contains details of the Job's current state
   */
  Status?: JobStatus
}

/**
 * The technical blueprint for a Job.
 */
export interface JobSpec {
  /**
   * Specifies the details of an OCI container that forms the cornerstone of the
   * Job. Job success or failure is tied to completion and exit code of this
   * container.
   */
  primaryContainer: JobContainerSpec
  /**
   * Specifies the details of supplemental, "sidecar" containers. Their
   * completion and exit code do not directly impact Job status. Brigade does
   * not understand dependencies between a Job's multiple containers and cannot
   * enforce any specific startup or shutdown order. When such dependencies
   * exist (for instance, a primary container than cannot proceed with a suite
   * of tests until a database is launched and READY in a sidecar container),
   * then logic within those containers must account for these constraints.
   */
  sidecarContainers?: { [key: string]: JobContainerSpec }
  /**
   * Specifies the time, in seconds, that must elapse before a running Job
   * should be considered to have timed out
   */
  timeoutSeconds?: number
  /**
   * Optional criteria for selecting a suitable host (substrate node) for the
   * Job. This is useful in cases where a Job requires a specific, non-default
   * operating system (i.e. Windows) or specific hardware (e.g. a GPU.)
   */
  host?: JobHost
}

/**
 * Amends the ContainerSpec type with additional Job-specific fields.
 */
export interface JobContainerSpec extends ContainerSpec {
  /**
   * Specifies the OCI container's working directory
   */
  workingDirectory?: string
  /**
   * Specifies the path in the OCI container's file system where, if applicable,
   * the Worker's shared workspace should be mounted. If left unspecified, the
   * Job implicitly does not use the Worker's shared workspace.
   */
	workspaceMountPath?: string
  /**
   * Specifies the path in the OCI container's file system where, if applicable,
   * source code retrieved from a VCS repository should be mounted. If left
   * unspecified, the Job implicitly does not use source code retrieved from a VCS
   * repository.
   */
  sourceMountPath?: string
  /**
   * Indicates whether the OCI container should operate in a "privileged"
   * (relaxed permissions) mode. This is commonly used to effect
   * "Docker-in-Docker" ("DinD") scenarios wherein one of a Job's OCI containers
   * must run its own Docker daemon. Note this field REQUESTS privileged status
   * for the container, but that may be disallowed by Project-level
   * configuration.
   */
  privileged?: boolean
  /**
   * Indicates whether the OCI container should mount the host's Docker socket
   * into its own file system. This is commonly used to effect
   * "Docker-out-of-Docker" ("DooD") scenarios wherein one of a Job's OCI
   * containers must utilize the host's Docker daemon. GENERALLY, THIS IS HIGHLY
   * DISCOURAGED. Note this field REQUESTS to mount the host's Docker socket
   * into the container, but that may be disallowed by Project-level
   * configuration.
   */
	useHostDockerSocket?: boolean
}

/**
 * Criteria for selecting a suitable host (substrate node) for a Job.
 */
export interface JobHost {
  /**
   * Specifies which "family" of operating system is required on a substrate
   * node to host a Job. Valid values are "linux" and "windows". When
   * unspecified, Brigade assumes "linux".
   */
  os?: string
  /**
   * Specifies labels that must be present on the substrate node to host a Job.
   * This provides an opaque mechanism for communicating Job needs such as
   * specific hardware like an SSD or GPU.
   */
	nodeSelector?: { [key: string]: string }
}

/**
 * Represents the status of a Job.
 */
export interface JobStatus {
  /**
   * Indicates the time the Job began execution. It will be undefined for
   * a Job that is not yet executing.
   */
  started?: Date
  /**
   * Indicates the time the Job concluded execution. It will be undefined
   * for a Job that is not done executing (or hasn't started).
   */
  ended?: Date
  /**
   * Indicates where the Job is in its lifecycle
   */
  phase?: JobPhase
}

class JobStatusStream extends rm.ServerSentEventStream<JobStatus> {
  constructor(path: string, apiToken: string, opts: rm.APIClientOptions) {
    super(path, apiToken, opts)
  }
}

/**
 * A specialized client for managing Jobs with the Brigade API.
 */
export class JobsClient {
  private apiAddress: string
  private apiToken: string
  private opts: rm.APIClientOptions
  private rmClient: rm.Client

  /**
   * Creates an instance of JobsClient.
   *
   * @param apiAddress The base address (protocol + host name or IP) of the API
   * server
   * @param apiToken A bearer token for authenticating to the API server
   * @param [opts] Optional client configuration
   *
   * @example
   * new JobsClient("https://brigade.example.com", apiToken, {allowInsecureConnections: true})
   */
  constructor(apiAddress: string, apiToken: string, opts?: rm.APIClientOptions) {
    this.apiAddress = apiAddress
    this.apiToken = apiToken
    this.opts = opts || {}
    this.rmClient = new rm.Client(apiAddress, apiToken, opts)
  }


  /**
   * Creates a new pending Job and schedules it for execution.
   *
   * @param eventID The ID of the Event the Job is for
   * @param jobName A name for the new Job; must be unique per Event
   * @param job A new Job
   * @throws An error if the specified Event already has a Job with the
   * specified name
   */
  public async create(eventID: string, job: Job): Promise<void> {
    const req = new rm.Request("POST", `v2/events/${eventID}/worker/jobs`)
    req.bodyObjKind = "Job"
    req.bodyObj = job
    req.successCode = 201
    return this.rmClient.executeRequest(req) as Promise<void>
  }

  
  /**
   * Initiates execution of a pending Job.
   * 
   * @param eventID The ID of the Event the Job belongs to
   * @param jobName The Job name
   * @throws An error if the specified Event or Job thereof is not found
   */
  public async start(eventID: string, jobName: string): Promise<void> {
    const req = new rm.Request("PUT", `v2/events/${eventID}/worker/jobs/${jobName}/start`)
    return this.rmClient.executeRequest(req) as Promise<void>
  }

  /**
   * Returns a Job's status
   * 
   * @param eventID The ID of the Event the Job belongs to
   * @param jobName The Job name
   * @returns The Job's status
   * @throws An error if the specified Event or Job thereof is not found
   */
  public async getStatus(eventID: string, jobName: string): Promise<JobStatus> {
    const req = new rm.Request("GET", `v2/events/${eventID}/worker/jobs/${jobName}/status`)
    return this.rmClient.executeRequest(req) as Promise<JobStatus>
  }

  public watchStatus(eventID: string, jobName: string): JobStatusStream {
    return new JobStatusStream(
      `${this.apiAddress}/v2/events/${eventID}/worker/jobs/${jobName}/status?watch=true&sse=true`,
      this.apiToken,
      this.opts,
    )
  }

  /**
   * Updates the status of a Job.
   * 
   * @param eventID The ID of the Event the Job belongs to
   * @param jobName The Job name
   * @param status The new Job status
   * @throws An error if the specified Event or Job thereof is not found
   * @throws An error if the effective state change is invalid
   */
  public updateStatus(eventID: string, jobName: string, status: JobStatus): Promise<void> {
    const req = new rm.Request("PUT", `v2/events/${eventID}/worker/jobs/${jobName}/status`)
    req.bodyObjKind = "JobStatus"
    req.bodyObj = status
    return this.rmClient.executeRequest(req) as Promise<void>
  }

  /**
   * Cleans up after a completed Job.
   * 
   * @param eventID The ID of the Event the Job belongs to
   * @param jobName The Job name
   * @throws An error if the specified Event or Job thereof is not found
   */
  public async cleanup(eventID: string, jobName: string): Promise<void> {
    const req = new rm.Request("PUT", `v2/events/${eventID}/worker/jobs/${jobName}/cleanup`)
    return this.rmClient.executeRequest(req) as Promise<void>
  }
}
