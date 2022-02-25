import { toast } from 'react-toastify';

class Notification {
    success(message: string) {
        toast.success(message);
    }

    error(error: any) {
        if (typeof error === 'string') {
            toast.error(error);
        } else if (Object.keys(error).includes('message')) {
            toast.error(error.message);
        }
    }
}

const notification = new Notification();
export default notification;
