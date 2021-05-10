import { CancelManyEventsResult, DeleteManyEventsResult, Event, EventsClient } from "../../src/core/events" 
import { WorkerPhase } from "../../src/core/workers" 
import * as meta from "../../src/meta"

import * as common from "../common"

import "mocha"
import { assert } from "chai"

describe("events", () => {

  describe("EventsClient", () => {

    const client = new EventsClient(common.testAPIAddress, common.testAPIToken)

    describe("#create", () => {
      it("should send/receive properly over HTTP", async () => {
        const testEvent: Event = {
          metadata: {
            id: ""
          },
          source: "foo",
          type: "bar",
          payload: "a Tesla roadster"
        }
        const testEvents: meta.List<Event> = {
          metadata: {},
          items: [
            {
              metadata: {
                id: "12345"
              },
              source: "foo",
              type: "bar",
              payload: "a Tesla roadster"
            },
            {
              metadata: {
                id: "abcde"
              },
              source: "foo",
              type: "bar",
              payload: "a Tesla roadster"
            }
          ]
        }
        await common.testClient({
          expectedRequestMethod: "POST",
          expectedRequestPath: "/v2/events",
          expectedRequestBody: testEvent,
          mockResponseCode: 201,
          mockResponseBody: testEvents,
          clientInvocationLogic: () => {
            return client.create(testEvent)
          }
        })
      })
    })

    describe("#list", () => {
      it("should send/receive properly over HTTP", async () => { 
        const testProjectID = "bluebook"
        const testWorkerPhase = WorkerPhase.Running
        const testEvents: meta.List<Event> = {
          metadata: {},
          items: [
            {
              metadata: {
                id: "12345"
              },
              projectID: testProjectID,
              source: "foo",
              type: "bar",
            },
            {
              metadata: {
                id: "abcde"
              },
              projectID: testProjectID,
              source: "foo",
              type: "bar",
            }
          ]
        }
        await common.testClient({
          expectedRequestMethod: "GET",
          expectedRequestPath: "/v2/events",
          expectedRequestParams: new Map<string, string>([
            ["projectID", testProjectID],
            ["source", "github"],
            ["type", "push"],
            ["qualifiers", "foo=bar"],
            ["labels", "bat=baz"],
            ["sourceState", "do-rei-me=fa-sol-la-te-doh"],
            ["workerPhases", testWorkerPhase]
          ]),
          mockResponseBody: testEvents,
          clientInvocationLogic: () => {
            return client.list({
              projectID: testProjectID,
              source: "github",
              type: "push",
              qualifiers: {
                foo: "bar"
              },
              labels: {
                bat: "baz"
              },
              sourceState: {
                "do-rei-me": "fa-sol-la-te-doh"
              },
              workerPhases: [ testWorkerPhase ] ,
            })
          }
        })
      })
    })

    describe("#get", () => {
      it("should send/receive properly over HTTP", async () => { 
        const testEvent: Event = {
          metadata: {
            id: "12345"
          },
          source: "foo",
          type: "bar"
        }
        await common.testClient({
          expectedRequestMethod: "GET",
          expectedRequestPath: `/v2/events/${testEvent.metadata?.id}`,
          mockResponseBody: testEvent,
          clientInvocationLogic: () => {
            return client.get(testEvent.metadata?.id || "")
          }
        })
      })
    })

    describe("#clone", () => {
      it("should send/receive properly over HTTP", async () => { 
        const testOriginalEventID = "tunguska"
        const testNewEvent: Event = {
          metadata: {
            id: "12345"
          },
          source: "foo",
          type: "bar"
        }
        await common.testClient({
          expectedRequestMethod: "POST",
          expectedRequestPath: `/v2/events/${testOriginalEventID}/clones`,
          mockResponseCode: 201,
          mockResponseBody: testNewEvent,
          clientInvocationLogic: () => {
            return client.clone(testOriginalEventID)
          }
        })
      })
    })

    describe("#retry", () => {
      it("should send/receive properly over HTTP", async () => { 
        const testOriginalEventID = "tunguska"
        const testNewEvent: Event = {
          metadata: {
            id: "12345"
          },
          source: "foo",
          type: "bar"
        }
        await common.testClient({
          expectedRequestMethod: "POST",
          expectedRequestPath: `/v2/events/${testOriginalEventID}/retries`,
          mockResponseCode: 201,
          mockResponseBody: testNewEvent,
          clientInvocationLogic: () => {
            return client.retry(testOriginalEventID)
          }
        })
      })
    })

    describe("#cancel", () => {
      it("should send/receive properly over HTTP", async () => { 
        const testEventID = "12345"
        await common.testClient({
          expectedRequestMethod: "PUT",
          expectedRequestPath: `/v2/events/${testEventID}/cancellation`,
          clientInvocationLogic: () => {
            return client.cancel(testEventID)
          }
        })
      })
    })

    describe("#cancelMany", () => {
      it("should send/receive properly over HTTP", async () => { 
        const testProjectID = "bluebook"
        const testWorkerPhase = WorkerPhase.Running
        const testResult: CancelManyEventsResult = {
          count: 42
        }
        await common.testClient({
          expectedRequestMethod: "POST",
          expectedRequestPath: "/v2/events/cancellations",
          expectedRequestParams: new Map<string, string>([
            ["projectID", testProjectID],
            ["source", "github"],
            ["type", "push"],
            ["qualifiers", "foo=bar"],
            ["labels", "bat=baz"],
            ["sourceState", "do-rei-me=fa-sol-la-te-doh"],
            ["workerPhases", testWorkerPhase]
          ]),
          mockResponseBody: testResult,
          clientInvocationLogic: () => {
            return client.cancelMany({
              projectID: testProjectID,
              source: "github",
              type: "push",
              qualifiers: {
                foo: "bar"
              },
              labels: {
                bat: "baz"
              },
              sourceState: {
                "do-rei-me": "fa-sol-la-te-doh"
              },
              workerPhases: [ testWorkerPhase ] ,
            })
          }
        })
      })
    })

    describe("#delete", () => {
      it("should send/receive properly over HTTP", async () => { 
        const testEventID = "12345"
        await common.testClient({
          expectedRequestMethod: "DELETE",
          expectedRequestPath: `/v2/events/${testEventID}`,
          clientInvocationLogic: () => {
            return client.delete(testEventID)
          }
        })
      })
    })

    describe("#deleteMany", () => {
      it("should send/receive properly over HTTP", async () => { 
        const testProjectID = "bluebook"
        const testWorkerPhase = WorkerPhase.Running
        const testResult: DeleteManyEventsResult = {
          count: 42
        }
        await common.testClient({
          expectedRequestMethod: "DELETE",
          expectedRequestPath: "/v2/events",
          expectedRequestParams: new Map<string, string>([
            ["projectID", testProjectID],
            ["source", "github"],
            ["type", "push"],
            ["qualifiers", "foo=bar"],
            ["labels", "bat=baz"],
            ["sourceState", "do-rei-me=fa-sol-la-te-doh"],
            ["workerPhases", testWorkerPhase]
          ]),
          mockResponseBody: testResult,
          clientInvocationLogic: () => {
            return client.deleteMany({
              projectID: testProjectID,
              source: "github",
              type: "push",
              qualifiers: {
                foo: "bar"
              },
              labels: {
                bat: "baz"
              },
              sourceState: {
                "do-rei-me": "fa-sol-la-te-doh"
              },
              workerPhases: [ testWorkerPhase ] ,
            })
          }
        })
      })
    })

    describe("#workers", () => {
      it("should return a workers client", () => {
        assert.isDefined(client.workers())
      })
    })

    // describe("#logs", () => {
    //   it("should return a logs client", () => {
    //     assert.isDefined(client.logs())
    //   })
    // })

  })

})
