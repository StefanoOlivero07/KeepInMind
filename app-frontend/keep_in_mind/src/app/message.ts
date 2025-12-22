import Swal from 'sweetalert2';

export class Message {
    static showError(status: number, message: string): void {
        Swal.fire({
            icon: 'error',
            title: `Error ${status}`,
            text: message
        });
    }
}