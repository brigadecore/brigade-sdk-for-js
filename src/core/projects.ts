import * as meta from "../meta"
import * as rm from "../rest_machinery"
import { AuthzClient } from "./authz"

import { SecretsClient } from "./secrets"
import { WorkerSpec } from "./workers"

/**
 * Project is Brigade's fundamental configuration, management, and isolation
 * construct.
 * - Configuration: Users define Projects to pair EventSubscriptions with
 *   template WorkerSpecs.
 * - Management: Project administrators govern Project access by granting and
 *   revoking project-level Roles to/from principals (such as Users or
 *   ServiceAccounts)
 * - Isolation: All workloads (Workers and Jobs) spawned to handle a given
 *   Project's Events are isolated from other Projects' workloads in the
 *   underlying workload execution substrate.
 */
export interface Project {
  /**
   * Contains Project metadata
   */
  metadata: meta.ObjectMeta
  /**
   * A natural language description of the Project
   */
  description?: string
  /**
   * Pairs EventSubscriptions with a WorkerTemplate
   */
  spec: ProjectSpec
  /**
   * Contains Kubernetes-specific details of the Project's environment. These
   * details are populated by Brigade so that sufficiently authorized Kubernetes
   * users may obtain the information needed to directly modify a Project's
   * environment to facilitate certain advanced use cases. Clients MUST leave
   * the value of this field nil when using the API to create or update a
   * Project.
   */
  kubernetes?: KubernetesDetails
}
/**
 * Useful filter criteria when selecting multiple Projects for API group
 * operations like list. It currently has no fields, but exists to preserve the
 * possibility of future expansion without having to change client function
 * signatures.
 */
export interface ProjectsSelector{} // eslint-disable-line @typescript-eslint/no-empty-interface

/**
 * The technical component of a Project. It pairs EventSubscriptions with a
 * prototypical WorkerSpec that is used as a template for creating new Workers.
 */
export interface ProjectSpec{
  /**
   * Defines a set of trigger conditions under which a new Worker should be
   * created
   */
  eventSubscriptions?: EventSubscription[]
  /**
   * A prototypical WorkerSpec
   */
  workerTemplate: WorkerSpec
}

/**
 * Defines a set of Events of interest. ProjectSpecs utilize these in defining
 * the Events that should trigger the execution of a new Worker. An Event
 * matches a subscription if it meets ALL of the specified criteria.
 */
export interface EventSubscription {
  /**
   * Specifies the origin of an Event (e.g. a gateway).
   */
  source: string
  /**
   * Enumerates specific Events of interest from the specified source. This is
   * useful in narrowing a subscription when a Source also emits many Event
   * types that are NOT of interest. This is a required field. The value "*" may
   * be utilized to denote that ALL events originating from the specified source
   * are of interest.
   */
  types: string[]
  /**
   * Defines an EXACT set of key/value pairs with which Events of interest must
   * be labeled. An Event having additional labels not included in the
   * subscription does NOT match that subscription. Likewise a subscription
   * having additional labels not included in the Event does NOT match that
   * Event. This strict requirement prevents accidental subscriptions. For
   * instance, consider an Event gateway brokering events from GitHub. If Events
   * (per that gateway's own documentation) were labeled
   * `repo=<repository name>`, no would-be subscriber to Events from that
   * gateway will succeed unless their subscription includes that matching
   * label. This effectively PREVENTS a scenario where a subscriber who has
   * forgotten to apply applicable labels accidentally subscribes to ALL events
   * from the GitHub gateway, regardless of the repository of origin.
   */
  labels: { [key: string]: string }
}

/**
 * Represents Kubernetes-specific configuration.
 */
export interface KubernetesDetails {
  /**
   * The dedicated Kubernetes namespace for the Project. This is NOT specified
   * by clients when creating a new Project. The namespace is created by /
   * assigned by the system. This detail is a necessity to prevent clients from
   * naming existing namespaces in an attempt to hijack them.
   */
  Namespace: string
}

/**
 * A specialized client for managing Projects with the Brigade API.
 */
export class ProjectsClient {
  private rmClient: rm.Client
  private authzClient: AuthzClient
  private secretsClient: SecretsClient

  /**
   * Creates an instance of ProjectsClient.
   *
   * @param apiAddress The base address (protocol + host name or IP) of the API
   * server
   * @param apiToken A bearer token for authenticating to the API server
   * @param [opts] Optional client configuration
   *
   * @example
   * new ProjectsClient("https://brigade.example.com", apiToken, {allowInsecureConnections: true})
   */
  constructor(apiAddress: string, apiToken: string, opts?: rm.APIClientOptions) {
    this.rmClient = new rm.Client(apiAddress, apiToken, opts)
    this.authzClient = new AuthzClient(apiAddress, apiToken, opts)
    this.secretsClient = new SecretsClient(apiAddress, apiToken, opts)
  }

  /**
   * Creates a new Project.
   * 
   * @param project A new Project
   * @returns The new Project (including any changes applied by the system)
   * @throws An error if a Project with the specified ID already exists
   */
  public async create(project: Project): Promise<Project> {
    const req = new rm.Request("POST", "v2/projects")
    req.bodyObjKind = "Project"
    req.bodyObj = project
    req.successCode = 201
    return this.rmClient.executeRequest(req) as Promise<Project>
  }

  /**
   * Returns a (possibly paginated) list of Projects ordered lexically by ID.
   * If, due to pagination, a list contains only a subset of all selected
   * Projects, list metadata will contain values to be passed as options to
   * subsequent calls to retrieve subsequent pages.
   *
   * @param [selector] Optional selection criteria
   * @param [opts] Options used to retrieve a specific page from a paginated
   * list 
   * @returns A list of Projects
   */
  public async list(selector?: ProjectsSelector, opts?: meta.ListOptions): Promise<meta.List<Project>> { // eslint-disable-line @typescript-eslint/no-unused-vars
    const req = new rm.Request("GET", "v2/projects")
    req.listOpts = opts
    return this.rmClient.executeRequest(req) as Promise<meta.List<Project>>
  }

  /**
   * Returns a Project by ID.
   * 
   * @param id Identifier of the requested Project
   * @returns The requested Project
   * @throws An error if the requested Project is not found
   */
  public async get(id: string): Promise<Project> {
    const req = new rm.Request("GET", `v2/projects/${id}`)
    return this.rmClient.executeRequest(req) as Promise<Project>
  }

  /**
   * Updates an existing Project.
   * 
   * @param project The updated Project
   * @returns The updated Project (including any changes applied by the system)
   * @throws An error if the requested Project is not found
   */
  public async update(project: Project): Promise<Project> {
    const req = new rm.Request("PUT", `v2/projects/${project.metadata.id}`)
    req.bodyObjKind = "Project"
    req.bodyObj = project
    return this.rmClient.executeRequest(req) as Promise<Project>
  }

  /**
   * Deletes a Project.
   * 
   * @param id The identifier of the Project to delete
   */
  public async delete(id: string): Promise<void> {
    const req = new rm.Request("DELETE", `v2/projects/${id}`)
    return this.rmClient.executeRequest(req) as Promise<void>
  }

  /**
   * Returns a specialized client for managing project-level authorization
   * concerns.
   * 
   * @returns a specialized client for managing project-level authorization
   * concerns
   */
  public authz(): AuthzClient {
    return this.authzClient
  }

  /**
   * Returns a specialized client for managing Project Secrets.
   * 
   * @returns a specialized client for managing Project Secrets
   */
  public secrets(): SecretsClient {
    return this.secretsClient
  }
}
