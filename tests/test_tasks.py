from bot.tasks import TASKS


def test_sixty_tasks():
    assert set(TASKS) == {"easy", "medium", "hard"}
    assert sum(len(tasks) for group in TASKS.values() for tasks in group.values()) == 60
    for group in TASKS.values():
        assert set(group) == {"male", "female"}
        for tasks in group.values():
            assert len(tasks) == 10
            assert len(tasks) == len(set(tasks))
