"""Controlled errors raised at the trusted controller boundary."""


class StudioLoopError(Exception):
    """Base error that never exposes untrusted payloads."""


class ContractValidationError(StudioLoopError):
    """A versioned contract or semantic invariant was rejected."""


class InvalidTransitionError(StudioLoopError):
    """A transition is not in the controller transition allowlist."""


class StateCorruptionError(StudioLoopError):
    """Stored JSON cannot be parsed or validated."""


class RevisionConflictError(StudioLoopError):
    """Optimistic locking observed a revision different from the expected one."""


class SecretDetectedError(StudioLoopError):
    """A secret-like field or value was about to enter durable runtime state."""


class TaskGraphError(StudioLoopError):
    """The canonical task dependency graph is invalid."""


class ExitCategory:
    """Stable public CLI exit categories; Git's exit codes never leak through."""

    SUCCESS = "success"
    USAGE = "usage_error"
    PREFLIGHT = "preflight_failed"
    POLICY = "policy_rejected"
    TASK = "task_failed"
    EXTERNAL = "external_failed"
    INTERRUPTED = "interrupted"
    RECONCILIATION = "reconciliation_required"
    LOCK = "lock_unavailable"


EXIT_CODES = {
    ExitCategory.SUCCESS: 0,
    ExitCategory.USAGE: 2,
    ExitCategory.PREFLIGHT: 3,
    ExitCategory.POLICY: 4,
    ExitCategory.TASK: 5,
    ExitCategory.EXTERNAL: 6,
    ExitCategory.INTERRUPTED: 7,
    ExitCategory.RECONCILIATION: 8,
    ExitCategory.LOCK: 9,
}


class CommandError(StudioLoopError):
    """A controlled command failure with a stable public category."""

    def __init__(self, code: str, summary: str, category: str = ExitCategory.POLICY) -> None:
        super().__init__(summary)
        self.code = code
        self.summary = summary
        self.category = category


class GitError(CommandError):
    """Git returned an error while performing an allowlisted operation."""

    def __init__(self, summary: str) -> None:
        super().__init__("GIT_FAILED", summary, ExitCategory.EXTERNAL)
