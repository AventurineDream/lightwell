# Contributing

Lightwell is a dependency-free browser app. Clone the repository and serve its root with any static HTTP server.

```sh
python3 -m http.server 4174
```

Run the tests with Node 20 or newer:

```sh
node --test
```

Please keep generation deterministic: the same seed and settings must produce byte-identical SVG. Add a focused test for generator or export changes, and inspect rendered pixels for visual changes.
