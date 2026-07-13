from __future__ import annotations

import pytest

from studio_loop.errors import InvalidTransitionError
from studio_loop.state_machine import TRANSITIONS, LoopState, transition


def test_every_allowlisted_transition_succeeds() -> None:
    for source, targets in TRANSITIONS.items():
        for target in targets:
            assert transition(source, target) is target


def test_illegal_transition_is_controlled_and_does_not_change_state() -> None:
    current = LoopState.CREATED
    with pytest.raises(InvalidTransitionError):
        transition(current, LoopState.PUSHING)
    assert current is LoopState.CREATED
