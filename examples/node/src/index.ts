import "process"

import { uniqueNamesGenerator, adjectives, animals } from "unique-names-generator"

import * as brigade from "../../../dist/index.js"

const ignoreSSLErrors = true

// Get a client without using a token. We'll use this to log in as root and
// create a service a service account that the remainder of the tests will
// utilize
let client = new brigade.APIClient(
  process.env.API_SERVER_ADDRESS || "",
  "",
  { allowInsecureConnections: ignoreSSLErrors }
)

console.log("Creating a root session...")
let token = await client.authn().sessions().createRootSession(process.env.ROOT_PASSWORD || "")

// Refresh the client using the root token
console.log("Refreshing the client using root session's token...")
client = new brigade.APIClient(
  process.env.API_SERVER_ADDRESS || "",
  token.value,
  { allowInsecureConnections: ignoreSSLErrors }
)

const serviceAccountID = uniqueNamesGenerator({
  dictionaries: [adjectives, animals],
  length: 2,
  separator: '-'
})

console.log(`Creating a new service account ${serviceAccountID}...`)
token = await client.authn().serviceAccounts().create(
  {
    metadata: {
      id: serviceAccountID,
    },
    description: "A service account for the brigade-sdk-for-js demo"
  }
)

// Give the service account permissions to do all sorts of stuff
console.log(`Granting system role READER to service account ${serviceAccountID}...`)
await client.authz().roleAssignments().grant({
  principal: {
    type: brigade.authz.PrincipalTypeServiceAccount,
    id: serviceAccountID
  },
  role: "READER"
})
console.log(`Granting system role PROJECT_CREATOR to service account ${serviceAccountID}...`)
await client.authz().roleAssignments().grant({
  principal: {
    type: brigade.authz.PrincipalTypeServiceAccount,
    id: serviceAccountID
  },
  role: "PROJECT_CREATOR"
})

// Refresh the client using the service account token
console.log(`Refreshing the client using service account ${serviceAccountID} token...`)
client = new brigade.APIClient(
  process.env.API_SERVER_ADDRESS || "",
  token.value,
  { allowInsecureConnections: ignoreSSLErrors }
)

// Now a full battery of tests...

console.log("Listing all users...")
const users = await client.authn().users().list()
users.items?.forEach(user => {
  console.log(user.metadata.id)  
})

if (users.items?.length > 0) {
  const userID = users.items[0].metadata.id
  console.log(`Getting user ${userID}...`)
  const user = await client.authn().users().get(userID)
  console.log(user)
}

console.log("Listing all service accounts...")
const serviceAccounts = await client.authn().serviceAccounts().list()
serviceAccounts.items?.forEach(serviceAccount => {
  console.log(serviceAccount.metadata.id)
})

if (serviceAccounts.items?.length > 0) {
  const serviceAccountID = serviceAccounts.items[0].metadata.id
  console.log(`Getting service account ${serviceAccountID}...`)
  const serviceAccount = await client.authn().serviceAccounts().get(serviceAccountID)
  console.log(serviceAccount)
}

console.log("Listing all projects...")
const projects = await client.core().projects().list()
projects.items?.forEach(project => {
  console.log(project.metadata.id)  
})

if (projects.items?.length > 0) {
  const projectID = projects.items[0].metadata.id
  console.log(`Getting project ${projectID}...`)
  const project = await client.core().projects().get(projectID)
  console.log(project)
}

console.log("Listing all events...")
let events = await client.core().events().list()
events.items?.forEach(event => {
  console.log(event.metadata?.id)
})

if (events.items?.length > 0) {
  const eventID = events.items[0].metadata?.id || ""
  console.log(`Getting event ${eventID}...`)
  const event = await client.core().events().get(eventID)
  console.log(event)
}

let projectID: string
do {
  projectID = uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    length: 2,
    separator: '-',
  })
} while (projectID.length > 18)

console.log(`Creating new project ${projectID}...`)
await client.core().projects().create(
  {
    metadata: {
      id: projectID,
    },
    spec: {
      eventSubscriptions: [{
        source: "foobar",
        types: ["batbaz"],
        labels: {},
      }],
      workerTemplate: {
        defaultConfigFiles: {
          "brigade.js": `console.log("Hello, World!")`
        }
      }
    }
  }
)

console.log(`Creating event for project ${projectID}...`)
events = await client.core().events().create(
  {
    projectID: projectID,
    source: "foobar",
    type: "batbaz" 
  }
)
const eventID = events.items[0].metadata?.id || ""

console.log(`Streaming event ${eventID} worker status...`)
await new Promise<void>((resolve, reject) => {
  const statusStream = client.core().events().workers().watchStatus(eventID)
  statusStream.onData((status: brigade.core.WorkerStatus) => {
    console.log(status.phase)
  })
  statusStream.onReconnecting(() => {
    console.log("status stream connecting")
  })
  statusStream.onClosed(() => {
    reject("status stream closed")
  })
  statusStream.onError((e: Error) => {
    reject(e)
  })
  statusStream.onDone(() => {
    resolve()
  })
})

console.log(`Streaming logs for event ${eventID}...`)
await new Promise<void>((resolve, reject) => {
  const logStream = client.core().events().logs().stream(eventID)
  logStream.onData((logEntry: brigade.core.LogEntry) => {
    console.log(logEntry.message)
  })
  logStream.onReconnecting(() => {
    console.log("log stream connecting")
  })
  logStream.onClosed(() => {
    reject("log stream closed")
  })
  logStream.onError((e: Error) => {
    reject(e)
  })
  logStream.onDone(() => {
    resolve()
  })  
})
