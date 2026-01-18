import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

webpush.setVapidDetails(
    'mailto:greg.field1992@gmail.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY,
);

async function main() {
    // Find todos with a notificationDateTime in the past and not yet notified
    const now = new Date();

    const { data: todos, error: todosError } = await supabase
        .from('Todos')
        .select('*')
        .lte('notificationDateTime', now.toISOString())
        .neq('notificationSent', true);

    if (todosError) {
        console.error('Error fetching todos:', todosError);
        return;
    }

    for (const todo of todos || []) {
    // Find the user
        const { data: user, error: userError } = await supabase
            .from('Users')
            .select('*')
            .eq('id', todo.userId)
            .single();

        if (userError || !user || !user.pushSubscriptions || user.pushSubscriptions.length === 0) {
            continue;
        }

        // Send notification to all subscriptions
        for (const sub of user.pushSubscriptions) {
            try {
                await webpush.sendNotification(sub, JSON.stringify({
                    title: 'Todo Reminder',
                    message: `Reminder for todo: ${todo.name}`,
                }));
            }
            catch (e) {
                console.error('Failed to send notification', e);
            }
        }

        // Mark todo as notified
        const { error: updateError } = await supabase
            .from('Todos')
            .update({ notificationSent: true })
            .eq('id', todo.id);

        if (updateError) {
            console.error('Error marking todo as notified:', updateError);
        }
    }
}

await main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
