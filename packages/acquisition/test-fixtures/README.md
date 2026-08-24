# Test fixtures

Byte-for-byte copies of the `artifacts/` entries that the materializer
tests read. `artifacts/` is content-addressed and deliberately kept out
of Git (see `REFACTOR_SPEC_V2.md` §2), so a clean clone has no copy of it
and `pnpm test` — a baseline validation command in `CLAUDE.md` — could not
run without these.

Each file keeps its original SHA-256 name, so a fixture can always be
traced back to the artifact it came from.

They are copied verbatim rather than trimmed on purpose. The Artificial
Analysis payloads are RSC streams whose parsing depends on their exact
structure; a hand-trimmed copy would test a format that never existed.

Do not edit these files. To refresh one, copy the artifact again from
`artifacts/sha256/<first two chars>/<hash>` and keep the same filename.
