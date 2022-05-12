# Contributing Guide

Brigade SDK for JavaScript is an official library of the Brigade project and as
such follows all of the policies laid out in the main
[Brigade Contributor Guide](https://docs.brigade.sh/topics/contributor-guide/).
Anyone interested in contributing to this library should familiarize themselves
with that guide _first_.

The remainder of _this_ document only supplements the above with things specific
to this project.

## Testing

In contrast to most Brigade projects, Brigade SDK for JavaScript does not
utilize `make` to drive our various tests. Instead, we rely on `yarn`, which
is more endemic to the to the JS ecosystem.

Before running any tests, it is good to make sure all dependencies have been
resolved and are up-to-date:

```shell
$ yarn install
```

To execute unit tests:

```shell
$ yarn test
```

To execute style checks:

```shell
$ yarn style:check
```

To automatically remediate any style violations:

```shell
$ yarn style:fix
```

> ⚠️&nbsp;&nbsp;Note that we utilize the style checks above to enforce this
> project's preferred stylistic conventions, but utilize lint checks to detect
> _additional_ problems that are not necessarily style-related.

To execute lint checks:

```shell
$ yarn lint
```
