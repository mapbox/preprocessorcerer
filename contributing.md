# Contributing

General guidelines for contributing to preprocessorcerer. 

## Releasing

To release a new preprocessorcerer version:

 - Make sure that all tests as passing (including travis tests).
 - Update the CHANGELOG.md
 - Make a "bump commit" by updating the version in `package.json` and adding a commit like `-m "bump to v0.8.5"`
 - Create a github tag like `git tag -a v0.8.5 -m "v0.8.5" && git push --tags`
 - Ensure travis tests are passing
 - Then publish the module to npm repositories by running `npm publish`