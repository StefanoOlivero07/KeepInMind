import Swal from 'sweetalert2';

export class Message {
    static showError(status: number, message: string): void {
        Swal.fire({
            "icon": 'error',
            "title": `Error ${status}`,
            "text": message,
            "color": "#fff",
            "background": "#1b4977ff",
            "confirmButtonColor": "#f27474"
        });
    }
}