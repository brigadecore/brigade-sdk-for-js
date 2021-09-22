# Brigade SDK for JavaScript

![build](https://badgr.brigade2.io/v1/github/checks/brigadecore/brigade-sdk-for-js/badge.svg?appID=99005)

This is a JavaScript (and TypeScript) SDK compatible with the _beta_ series of
releases of the Brigade 2 event-driven scripting platform.

## Supported Runtimes

Great care has been taken to ensure this SDK works within recent versions of
Node as well as modern browsers (latest versions of Firefox, Chrome, Edge,
Safari, etc.) _if properly transpiled with [webpack](https://webpack.js.org/) or
similar_.

## Installation

Install into your project using your favorite package manager.

For instance:

```console
$ npm install --save @brigadecore/brigade-sdk
```

Or:

```console
$ yarn add @brigadecore/brigade-sdk
```

## Basic Use

__Note: All examples that follow use TypeScript.__

A Brigade API client can be obtained as follows:

```typescript
import { APIClient } from "@brigadecore/brigade-sdk"

// ...

const client = new APIClient(apiAddress, apiToken, opts)
```

In the example above, it is assumed:

* `apiAddress` points to a Brigade 2 API server. The address must include the
  protocol (i.e. must be prefixed with `http://` or `https://`).
* `apiToken` is:
    * A valid API token. It is probably best to use a non-expiring service
      account token. Refer to Brigade's own documentation on how to obtain such
      a token.
    * The empty string is acceptable, but only API operations _not_ requiring
      authorization will then be supported by the client.
* `opts`, as one might infer, is an optional parameter. If included, it must be
  an object, which may have a single field `allowInsecureConnections` containing
  the value `true` or `false` to indicate whether SSL errors should be tolerated
  by the client. If not specified, SSL errors will _not_ be tolerated. This
  option is only applicable when the value of the `apiAddress` argument uses
  `https://` as the scheme.

The `client` returned from the call to the `new APIClient(...)` constructor is
the root in a tree of more specialized clients.

To obtain a client for working with the "core" components of Brigade (Projects,
Events, etc.):

```typescript
const coreClient = client.core()
```

The `coreClient` permits navigation to even more specialized clients, for
example:

```typescript
const projectsClient = coreClient.projects()
```

If your program needs to interact with only a specific subset of the Brigade
API, it is possible and encouraged to directly instantiate just the specific
subset of the client tree that is needed.

For instance, this example shows instantiation of _only_ the Events client--
something that might be practical for a program such as a Brigade gateway, whose
only interaction with Brigade involves the creation of new Events:

```typescript
import { core } from "@brigadecore/brigade-sdk"

// ...

const eventsClient = new core.EventsClient(apiAddress, apiToken, opts)
```

The arguments passed above are the same as in our initial example.

## Further Examples

Working Node and browser-based examples are available in the
[examples](./examples) directory.

## Contributing

The Brigade project accepts contributions via GitHub pull requests. The
[Contributing](CONTRIBUTING.md) document outlines the process to help get your
contribution accepted.

## Support & Feedback

We have a slack channel!
[Kubernetes/#brigade](https://kubernetes.slack.com/messages/C87MF1RFD) Feel free
to join for any support questions or feedback, we are happy to help. To report
an issue or to request a feature open an issue
[here](https://github.com/brigadecore/brigade/issues)

## Code of Conduct

Participation in the Brigade project is governed by the
[CNCF Code of Conduct](https://github.com/cncf/foundation/blob/master/code-of-conduct.md).
