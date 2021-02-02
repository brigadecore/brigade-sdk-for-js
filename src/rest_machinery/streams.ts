import { EventEmitter } from "events"

import { APIClientOptions } from "./client"

// Choose appropriate EventSource polyfill...
let ES: any // eslint-disable-line @typescript-eslint/no-explicit-any
// @ts-ignore
if (typeof window !== "undefined") {
  // If we're executing in a browser, this polyfill is based on xhr, but has
  // important enhancements that the browser's built-in EventSource lacks--
  // namely it allows headers (in our case, the Authentication header) to be
  // set. This polyfill ONLY works in the browser and NOT in Node.
  ES = require("event-source-polyfill").EventSourcePolyfill // eslint-disable-line @typescript-eslint/no-var-requires
} else {
  // If we're executing in Node, this polyfill provides an EventSource
  // implementation-- something Node otherwise lacks. This polyfill ONLY works
  // in Node and NOT in the browser.
  ES = require("eventsource") // eslint-disable-line @typescript-eslint/no-var-requires
}

export class ServerSentEventStream<T> {
  private eventSource: any // eslint-disable-line @typescript-eslint/no-explicit-any
  private eventEmitter: EventEmitter

  constructor(path: string, apiToken: string, opts: APIClientOptions) {
    this.eventSource = new ES(
      path,
      {
        https: {
          // This option might not work in the browser
          rejectUnauthorized: !opts.allowInsecureConnections
        },
        headers: {
          "Authorization": `Bearer ${apiToken}`
        }
      }
    )
    this.eventEmitter = new EventEmitter()
    this.eventSource.addEventListener("message", (event: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      const data = JSON.parse(event.data)
      this.eventEmitter.emit("data", data)
    })
    this.eventSource.addEventListener("error", (e: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      if (e.status) {
        this.eventSource.close()
        this.eventEmitter.emit("error", new Error(`received ${e.status} from the API server`))
      } else if (this.eventSource.readyState == ES.CONNECTING) {
        this.eventEmitter.emit("connecting")
      } else if (this.eventSource.readyState == ES.CLOSED) {
        this.eventEmitter.emit("closed")
      } else {
        this.eventEmitter.emit("error", new Error("encountered unknown error receiving log stream"))
      }
    })
    this.eventSource.addEventListener("done", () => {
      this.eventSource.close()
      this.eventEmitter.emit("done")
    })
  }

  public onData(func: (data: T) => void): void {
    this.eventEmitter.on("data", func)
  }

  public onReconnecting(func: () => void): void {
    this.eventEmitter.on("connecting", func)
  }

  public onClosed(func: () => void): void {
    this.eventEmitter.on("closed", func)
  }

  public onError(func: (e: Error) => void): void {
    this.eventEmitter.on("error", func)
  }

  public onDone(func: () => void): void {
    this.eventEmitter.on("done", func)
  }

  public close(): void {
    this.eventSource.close()
  }
}
