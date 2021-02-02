# Brigade SDK for JavaScript Browser-Based Example

__Note: This example uses TypeScript and [yarn](https://yarnpkg.com/).__

Running this example requires:

* A modern web browser.
* A running (local or remote) Brigade 2 API server. Please refer to Brigade's
  own documentation.
* A valid API token. Again, refer to Brigade's own documentation.

Open the file `src/index.ts`, modify the values of the following constants at
the top of the file and save:

```typescript
const apiAddress = "<address goes here>"
const apiToken = "<token goes here>"
```

To obtain all required dependencies, transpile the example TypeScript, and run
the example, all in one shot, navigate to this directory, then:

```
$ yarn demo
```
