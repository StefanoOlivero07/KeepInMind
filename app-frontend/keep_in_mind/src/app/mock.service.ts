import { Injectable } from '@angular/core';

declare global {
    function getCompletedTasks(userId: string): any;
    function getNotCompletedTasks(userId: string): any;
}

@Injectable({
    providedIn: 'root'
})
export class MockRequests {
    getCompletedTasks(userId: string): any {
        return getCompletedTasks(userId);
    }

    getNotCompletedTasks(userId: string): any {
        return getNotCompletedTasks(userId);
    }
}