"use strict";

function getCompletedTasks(userId) {
    const tasks = {
        "data": [],
        "status": 200
    };

    for (const task of window.dbMock) {
        if (task.user._id.$oid == userId && task.completed)
            tasks.data.push(task);
    }

    tasks.data.sort((a, b) => {
        return new Date(b.expiration) - new Date(a.expiration);
    });

    return tasks;
}

function getNotCompletedTasks(userId) {
    const tasks = {
        "data": [],
        "status": 200
    };

    for (const task of window.dbMock) {
        if (task.user._id.$oid == userId && !task.completed)
            tasks.data.push(task);
    }

    tasks.data.sort((a, b) => {
        return new Date(a.expiration) - new Date(b.expiration);
    });

    return tasks;
}

// Espone le funzioni globalmente per TypeScript/Angular
window.getCompletedTasks = getCompletedTasks;
window.getNotCompletedTasks = getNotCompletedTasks;