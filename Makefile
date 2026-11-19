# GNU Make is optional; each target has an equivalent "node scripts/protolume.mjs ..." command.
.PHONY: help doctor check preview-local preview build-production release

help:
	@node scripts/protolume.mjs help

doctor:
	@node scripts/protolume.mjs doctor

check:
	@node scripts/protolume.mjs check

preview-local:
	@node scripts/protolume.mjs preview-local

preview:
	@node scripts/protolume.mjs preview

build-production:
	@node scripts/protolume.mjs build-production

release:
	@node scripts/protolume.mjs release
