# Brigade SDK for JavaScript Node-Based Example

This example utilizes a "kitchen sink" approach to demonstrate use of Brigade 2
APIs via this SDK.

It will log in to the Brigade 2 API server as the root user and create a service
account that will be used by all subsequent steps. If root access is disabled on
your API server, the example can be modified (an exercise for the user) to use
the token for an established service account.

__Note: The example will create garbage in your API server and will _not_ clean
it up. It is not recommended to run this against a shared / production API
server.__

Running this example requires:

* [Node](https://nodejs.org/en/)
* [Yarn](https://yarnpkg.com/)
* A running (local or remote) Brigade 2 API server, with root access enabled
* The Brigade 2 API server root password

Define environment variables to hold the API server address and root password:

```shell
$ export API_SERVER_ADDRESS=<Brigade 2 API server address>
$ export ROOT_PASSWORD=<Brigade 2 API server root password>
```

To obtain all required dependencies, transpile the example TypeScript, and run
the example in Node, all in one shot, navigate to this directory, then type:

```shell
$ yarn demo
```
