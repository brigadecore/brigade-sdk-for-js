import { uniqueNamesGenerator, adjectives, animals } from "unique-names-generator"

import * as brigade from "../../../dist/index.js"

const apiAddress = ""
const rootPassword = ""

document.addEventListener('DOMContentLoaded', async () => {

  try {

    // Get a client without using a token. We'll use this to log in as root and
    // create a service a service account that the remainder of the tests will
    // utilize
    let client = new brigade.APIClient(apiAddress, "")

    document.writeln("Creating a root session...<br/>")
    let token = await client.authn().sessions().createRootSession(rootPassword)

    // Refresh the client using the root token
    document.writeln("Refreshing the client using root session's token...<br/>")
    client = new brigade.APIClient(apiAddress, token.value)

    const serviceAccountID = uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      length: 2,
      separator: '-'
    })

    document.writeln(`Creating a new service account ${serviceAccountID}...<br/>`)
    token = await client.authn().serviceAccounts().create(
      {
        metadata: {
          id: serviceAccountID,
        },
        description: "A service account for the brigade-sdk-for-js demo"
      }
    )

    // Give the service account permissions to do all sorts of stuff
    document.writeln(`Granting system role READER to service account ${serviceAccountID}...<br/>`)
    await client.authz().roleAssignments().grant({
      principal: {
        type: brigade.authz.PrincipalTypeServiceAccount,
        id: serviceAccountID
      },
      role: "READER"
    })
    document.writeln(`Granting system role PROJECT_CREATOR to service account ${serviceAccountID}...<br/>`)
    await client.authz().roleAssignments().grant({
      principal: {
        type: brigade.authz.PrincipalTypeServiceAccount,
        id: serviceAccountID
      },
      role: "PROJECT_CREATOR"
    })

    // Refresh the client using the service account token
    document.writeln(`Refreshing the client using service account ${serviceAccountID} token...<br/>`)
    client = new brigade.APIClient(apiAddress, token.value)

    // Now a full battery of tests...

    document.writeln("Listing all users...<br/>")
    const users = await client.authn().users().list()
    users.items?.forEach(user => {
      document.writeln(user.metadata.id + "<br/>")
    })

    if (users.items?.length > 0) {
      const userID = users.items[0].metadata.id
      document.writeln(`Getting user ${userID}...<br/>`)
      const user = await client.authn().users().get(userID)
      document.writeln(JSON.stringify(user) + "<br/>")
    }

    document.writeln("Listing all service accounts...<br/>")
    const serviceAccounts = await client.authn().serviceAccounts().list()
    serviceAccounts.items?.forEach(serviceAccount => {
      document.writeln(serviceAccount.metadata.id + "<br/>")
    })

    if (serviceAccounts.items?.length > 0) {
      const serviceAccountID = serviceAccounts.items[0].metadata.id
      document.writeln(`Getting service account ${serviceAccountID}...<br/>`)
      const serviceAccount = await client.authn().serviceAccounts().get(serviceAccountID)
      document.writeln(JSON.stringify(serviceAccount) + "<br/>")
    }

    document.writeln("Listing all projects...<br/>")
    const projects = await client.core().projects().list()
    projects.items?.forEach(project => {
      document.writeln(project.metadata.id + "<br/>")  
    })

    if (projects.items?.length > 0) {
      const projectID = projects.items[0].metadata.id
      document.writeln(`Getting project ${projectID}...<br/>`)
      const project = await client.core().projects().get(projectID)
      document.writeln(JSON.stringify(project) + "<br/>")
    }

    document.writeln("Listing all events...<br/>")
    let events = await client.core().events().list()
    events.items?.forEach(event => {
      document.writeln(event.metadata?.id + "<br/>")
    })

    if (events.items?.length > 0) {
      const eventID = events.items[0].metadata?.id || ""
      document.writeln(`Getting event ${eventID}...<br/>`)
      const event = await client.core().events().get(eventID)
      document.writeln(JSON.stringify(event) + "<br/>")
    }

    let projectID: string
    do {
      projectID = uniqueNamesGenerator({
        dictionaries: [adjectives, animals],
        length: 2,
        separator: '-',
      })
    } while (projectID.length > 18)

    document.writeln(`Creating new project ${projectID}...<br/>`)
    await client.core().projects().create(
      {
        metadata: {
          id: projectID,
        },
        spec: {
          workerTemplate: {
            defaultConfigFiles: {
              "brigade.js": `console.log("Hello, World!")`
            }
          }
        }
      }
    )

    document.writeln(`Creating event for project ${projectID}...<br/>`)
    events = await client.core().events().create(
      {
        projectID: projectID,
        source: "foobar",
        type: "batbaz" 
      }
    )
    const eventID = events.items[0].metadata?.id || ""

    document.writeln(`Streaming event ${eventID} worker status...<br/>`)
    await new Promise<void>((resolve, reject) => {
      const statusStream = client.core().events().workers().watchStatus(eventID)
      statusStream.onData((status: brigade.core.WorkerStatus) => {
        document.writeln(status.phase + "<br/>")
      })
      statusStream.onReconnecting(() => {
        document.writeln("status stream connecting<br/>")
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

    document.writeln(`Streaming logs for event ${eventID}...<br/>`)
    await new Promise<void>((resolve, reject) => {
      const logStream = client.core().events().logs().stream(eventID)
      logStream.onData((logEntry: brigade.core.LogEntry) => {
        document.writeln(logEntry.message + "<br/>")
      })
      logStream.onReconnecting(() => {
        document.writeln("log stream connecting" + "<br/>")
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

  } catch(e) {
    document.writeln(e + "<br/>")
  }

})
