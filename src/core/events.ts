import * as meta from "../meta"
import * as rm from "../rest_machinery"

import { LogsClient } from "./logs"
import { WorkerPhase, Worker, WorkersClient } from "./workers" 

/**
 * Represents an occurrence in some upstream system. Once accepted into the
 * system, Brigade amends each Event with a plan for handling it in the form of
 * a Worker. An Event's status is, implicitly, the status of its Worker.
 */
export interface Event {
  /**
   * Contains Event metadata
   */
  metadata?: meta.ObjectMeta
  /**
   * Specifies the Project this Event is for. Often, this field will be left
   * blank when creating a new Event, in which case the Event is matched against
   * subscribed Projects on the basis of the Source, Type, and Labels fields,
   * then used as a template to create a discrete Event for each subscribed
   * Project.
   */
  projectID?: string
  /**
   * Specifies the source of the event, e.g. what gateway created it. Gateways
   * should populate this field with a unique string that clearly identifies
   * itself as the source of the event. The ServiceAccount used by each gateway
   * can be authorized (by an administrator) to only create events having a
   * specified value in the Source field, thereby eliminating the possibility of
   * gateways maliciously creating events that spoof events from another
   * gateway.
   */
  source: string
  /**
   * Specifies the exact event that has occurred in the upstream system. Values
   * are opaque and source-specific.
   */
  type: string
  /**
   * Conveys additional event details for the purposes of matching Events
   * to subscribed Projects. For instance, no subscribers to the "GitHub" Source
   * and the "push" Type are likely to want to hear about push events for ALL
   * repositories. If the "GitHub" gateway labels events with the name of the
   * repository from which the event originated (e.g. "repo=github.com/foo/bar")
   * then subscribers can utilize those same criteria to narrow their
   * subscription from all push events emitted by the GitHub gateway to just
   * those having originated from a specific repository.
   */
  labels?: any // eslint-disable-line @typescript-eslint/no-explicit-any
  /**
   * An optional, succinct title for the Event, ideal for use in lists or in
   * scenarios where UI real estate is constrained.
   */
  shortTitle?: string
  /**
   * An optional, detailed title for the Event
   */
  longTitle?: string
  /**
   * If applicable, contains git-specific Event details. These can be used to override
   * similar details defined at the Project level. This is useful for scenarios
   * wherein an Event may need to convey an alternative source, branch, etc.
   */
  git?: GitDetails
  /**
   * Optionally contains Event details provided by the upstream system that was
   * the original source of the event. Payloads MUST NOT contain sensitive
   * information. Since Projects SUBSCRIBE to Events, the potential exists for
   * any Project to express an interest in any or all Events. This being the
   * case, sensitive details must never be present in payloads. The common
   * workaround for this constraint (which is also a sensible practice to begin
   * with) is that event payloads may contain REFERENCES to sensitive details
   * that are useful only to properly configured Workers.
   */
  payload?: string
  /**
   * Contains details of the Worker assigned to handle the Event
   */
  worker?: Worker
}

/**
 * Useful filter criteria when selecting multiple Events for API group
 * operations like list, cancel, or delete.
 */
export interface EventsSelector {
  /**
   * Specifies that Events belonging to the indicated Project should be selected
   */
  projectID?: string
  /**
   * Specifies that Events with their Workers in any of the indicated phases
   * should be selected
   */
  workerPhases?: WorkerPhase[]
}

/**
 * Represents git-specific Event details. These may override Project-level
 * GitConfig.
 */
export interface GitDetails {
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
}

/**
 * A summary of a mass Event cancellation operation.
 */
export interface CancelManyEventsResult {
  // The number of Events canceled
  count: number
}

/**
 * A summary of a mass Event deletion operation.
 */
export interface DeleteManyEventsResult {
  // The number of Events deleted
  count: number
}

/**
 * A specialized client for managing Events with the Brigade API.
 */
export class EventsClient {
  private rmClient: rm.Client
  private workersClient: WorkersClient
  private logsClient: LogsClient

  /**
   * Creates an instance of EventsClient.
   *
   * @param apiAddress The base address (protocol + host name or IP) of the API
   * server
   * @param apiToken A bearer token for authenticating to the API server
   * @param [opts] Optional client configuration
   *
   * @example
   * new EventsClient("https://brigade.example.com", apiToken, {allowInsecureConnections: true})
   */
  constructor(apiAddress: string, apiToken: string, opts?: rm.APIClientOptions) {
    this.rmClient = new rm.Client(apiAddress, apiToken, opts)
    this.workersClient = new WorkersClient(apiAddress, apiToken, opts)
    this.logsClient = new LogsClient(apiAddress, apiToken, opts)
  }

  /**
   * Creates one new Event if the Event provided references a Project by ID.
   * Otherwise, the Event provided is treated as a template and zero or more
   * discrete Events may be created-- one for each subscribed Project.
   * 
   * @param event A new Event
   * @returns A list of all Events that were created
   * @throws An error if a Project is specified and no such Project exists
   */
  public async create(event: Event): Promise<meta.List<Event>> {
    const req = new rm.Request("POST", "v2/events")
    req.bodyObjKind = "Event"
    req.bodyObj = event
    req.successCode = 201
    return this.rmClient.executeRequest(req) as Promise<meta.List<Event>>
  }

  /**
   * Returns a (possibly paginated) list of Events ordered by age, newest first.
   * If, due to pagination, a list contains only a subset of all selected
   * Events, list metadata will contain values to be passed as options to
   * subsequent calls to retrieve subsequent pages.
   * 
   * @param [selector] Optional selection criteria
   * @param [opts] Options used to retrieve a specific page from a paginated
   * @returns A list of Events
   */
  public async list(selector?: EventsSelector, opts?: meta.ListOptions): Promise<meta.List<Event>> { // eslint-disable-line @typescript-eslint/no-unused-vars
    const req = new rm.Request("GET", "v2/events")
    req.listOpts = opts
    req.queryParams = new Map<string, string>()
    if (selector) {
      if (selector.projectID) {
        req.queryParams.set("projectID", selector.projectID)
      }
      if (selector.workerPhases) {
        req.queryParams.set("workerPhases", selector.workerPhases.join(","))
      }
    }
    return this.rmClient.executeRequest(req) as Promise<meta.List<Event>> 
  }

  /**
   * Returns an Event by ID.
   * 
   * @param id Identifier of the requested Event
   * @returns The requested Event
   * @throws An error if the requested Event is not found
   */
  public async get(id: string): Promise<Event> {
    const req = new rm.Request("GET", `v2/events/${id}`)
    return this.rmClient.executeRequest(req) as Promise<Event>
  }

  /**
   * Cancels a single Event specified by ID.
   * 
   * @param id The Event to cancel
   * @throws An error if the specified Event is not found
   */
  public async cancel(id: string): Promise<void> {
    const req = new rm.Request("PUT", `v2/events/${id}/cancellation`)
    return this.rmClient.executeRequest(req) as Promise<void>
  }

  /**
   * Cancels multiple Events specified by a selector.
   * 
   * @param selector Event selection criteria
   * @returns A summary of the operation's results
   */
  public async cancelMany(selector: EventsSelector): Promise<CancelManyEventsResult> {
    const req = new rm.Request("POST", "v2/events/cancellations")
    req.queryParams = new Map<string, string>()
    if (selector.projectID) {
      req.queryParams.set("projectID", selector.projectID)
    }
    if (selector.workerPhases) {
      req.queryParams.set("workerPhases", selector.workerPhases.join(","))
    }
    return this.rmClient.executeRequest(req) as Promise<CancelManyEventsResult>
  }

  /**
   * Deletes a single Event specified by ID.
   * 
   * @param id The Event to cancel
   * @throws An error if the specified Event is not found
   */
  public async delete(id: string): Promise<void> {
    const req = new rm.Request("DELETE", `v2/events/${id}`)
    return this.rmClient.executeRequest(req) as Promise<void>
  }

  /**
   * Deletes multiple Events specified by a selector.
   * 
   * @param selector Event selection criteria
   * @returns A summary of the operation's results
   */
  public async deleteMany(selector: EventsSelector): Promise<DeleteManyEventsResult> {
    const req = new rm.Request("DELETE", "v2/events")
    req.queryParams = new Map<string, string>()
    if (selector.projectID) {
      req.queryParams.set("projectID", selector.projectID)
    }
    if (selector.workerPhases) {
      req.queryParams.set("workerPhases", selector.workerPhases.join(","))
    }
    return this.rmClient.executeRequest(req) as Promise<DeleteManyEventsResult>
  }

  /**
   * Returns a specialized client for managing Workers.
   * 
   * @returns A specialized client for managing Workers
   */
  public workers(): WorkersClient {
    return this.workersClient
  }

  /**
   * Returns a specialized client for retrieving logs.
   * 
   * @returns A specialized client for retrieving logs
   */
  public logs(): LogsClient {
    return this.logsClient
  }  
}
