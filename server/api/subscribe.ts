import webpush from 'web-push';
import { readBody } from 'h3';
// import { UserSchema } from '../models/users.schema'
// import { TodoSchema } from '../models/todo.schema'

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const subscription = body.subscription;
    const username = body.username;
    const notificationDateTime = body.notificationDateTime;
    const todoId = body.todoId;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

    if (!vapidPrivateKey) {
        throw new Error('VAPID private key is not defined in environment variables.');
    }

    if (username && subscription) {
    // Note: User subscription management would need to be implemented in Supabase
    // This requires creating a Users table and handling push subscriptions
        console.log('User subscription update needed for:', username);
    }

    if (todoId && notificationDateTime) {
    // Note: Todo notification scheduling would need to be implemented in Supabase
    // This requires updating the Todos table
        console.log('Todo notification scheduling needed for:', todoId);
    }

    webpush.setVapidDetails(
        'mailto:greg.field1992@gmail.com',
        process.env.VAPID_PUBLIC_KEY || '',
        vapidPrivateKey,
    );

    try {
        if (!notificationDateTime) {
            let testTitle = 'Tickup Push Test';
            let testMessage = 'Push notifications are working! You will get reminders for your todos.';
            if (todoId) {
                // Note: Todo lookup would need to be implemented with Supabase
                console.log('Todo lookup needed for test notification:', todoId);
                testTitle = 'Test Todo Notification';
                testMessage = 'Test notification for todo (Supabase migration needed)';
            }
            await webpush.sendNotification(subscription, JSON.stringify({
                title: testTitle,
                body: testMessage,
            }));

            return { success: true };
        }
        // If scheduling, just update the todo and return
        return { scheduled: true };
    }
    catch (error) {
        console.error('Error sending push notification:', error);
        throw error;
    }
});
