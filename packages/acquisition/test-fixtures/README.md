# Test fixtures

The SHA-256-named files are byte-for-byte copies of the `artifacts/` entries that the materializer
tests read. `artifacts/` is content-addressed and deliberately kept out
of Git (see `SPEC.md` §2), so a clean clone has no copy of it
and `pnpm test` — a baseline validation command in `docs/OPERATIONS.md` — could not
run without these.

Each of those files keeps its original SHA-256 name, so a fixture can always be
traced back to the artifact it came from.

They are copied verbatim rather than trimmed on purpose. The Artificial
Analysis payloads are RSC streams whose parsing depends on their exact
structure; a hand-trimmed copy would test a format that never existed.

Do not edit those files. To refresh one, copy the artifact again from
`artifacts/sha256/<first two chars>/<hash>` and keep the same filename.

## xAI unit-test fixtures

`xai-release-chart.js` is a reduced text fixture derived from the reviewed
`https://x.ai/news/grok-4-7` JavaScript capture
`0dbdfbf6e0ab7f5aef41c60f30a57d50150f53c306892e5998342c781e885691.js`.
It retains all 10 primary chart series and 43 run literals verbatim, plus the
CursorBench title and cost-unit label. Rendering code is omitted. The parser
reads compact literal syntax, so do not reformat this file or execute it.

`xai-release.html` is a hand-built minimal table representing the DeepSWE v1.1
Grok 4.7 score and high-effort footnote from the reviewed HTML capture
`5ce5ddfa12daeea65af0362bcf9c58f354e5b28dbbc38e37730dd7b33d309185.html`.

These reduced fixtures have their own SHA-256 evidence IDs in
`src/vendor-xai.test.ts` and a fixed test timestamp. They provide deterministic,
offline coverage of score/cost pairing, effort handling, and unit/table drift.
When intentionally updating their bytes, update those fixture IDs as well.
