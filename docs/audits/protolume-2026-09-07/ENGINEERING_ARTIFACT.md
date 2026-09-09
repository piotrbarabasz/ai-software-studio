# UX-016/017 — inspectable own-project source

Development and partner pages share the same source artifact. It comes from the publicly reviewed merge 0d38ef8037ce28a0ae4f8a3f3f3df4af4a8524c5 (PR #56). It is Protolume's own application, not a customer case study, production delivery check or proof of advanced AI.

The original production validator rejects public GitHub hrefs. That gate is preserved: six source previews, the actual hydration patch, an API/test archive and instructions are served from the same origin under `/assets/evidence/`. Every source preview is copied byte for byte from the pinned Git revision. A manifest binds these files, the patch and ZIP to SHA-256 values. The build rejects a missing/tampered file, wrong source revision or unsafe file name.

Regenerate from the repository root after frontend npm ci:

```powershell
backend/.venv/Scripts/python.exe frontend/scripts/build_engineering_artifact.py
```

This uses local Git objects and the installed formatter; it does not fetch source or secrets. Do not replace the revision with an unreviewed moving branch. Public filenames use .txt so source code opens as plain text. The ZIP is a runnable API with 33 selected contract/delivery tests plus selected frontend/CI/documentation context; it is not a complete standalone frontend project or a runnable copy of the whole CI pipeline.

The archive was extracted into an isolated directory and the documented selected tests passed there. The first run identified missing brand/contact-contract source dependencies; those files were added to the package before the passing run. Test delivery uses doubles and sends no real message.

The same record `studio-application` supplies the classification/limitations on home, studio and the shared artifact component. Its source version is explicit; no new fifth record, customer metric or current-CI success claim was added. The browser harness verifies both landing pages at eight widths, no-JS anchors, native disclosure, download bytes/MIME and contact topic.

Development removes duplicated readiness/preparation/process blocks and puts code before scope details. Partner expands MSP, describes repo access → PR/review → handover, and keeps ownership/NDA/deployment as terms to agree. The packet is a concrete example of the output a reviewer can inspect, not an assertion that every proposed engagement has these terms.
