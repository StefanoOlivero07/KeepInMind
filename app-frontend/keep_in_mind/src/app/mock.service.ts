import { Injectable } from '@angular/core';

declare global {
    function login(email: string, password: string): any;
    function getCompletedTasks(userId: string): any;
    function getNotCompletedTasks(userId: string): any;
    function getExpiredTasks(userId: string): any;
    function getTaskById(taskId: string): any;
}

@Injectable({
    providedIn: 'root'
})
export class MockRequests {
    login(email: string, password: string): any {
        return login(email, password);
    }

    getCompletedTasks(userId: string): any {
        return getCompletedTasks(userId);
    }

    getNotCompletedTasks(userId: string): any {
        return getNotCompletedTasks(userId);
    }

    getExpiredTasks(userId: string): any {
        return getExpiredTasks(userId);
    }

    getTaskById(taskId: string): any {
        return getTaskById(taskId);
    }
}