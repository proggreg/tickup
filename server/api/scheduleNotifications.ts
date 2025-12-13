import webpush from 'web-push';
import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
    console.log('🔔 ScheduleNotifications endpoint called');

    // Security: require a secret token in the header
    const token = getHeader(event, 'x-cron-secret');
    console.log('token', token);

    console.log('process.env.SCHEDULER_SECRET', process.env.SCHEDULER_SECRET);
    if (token !== process.env.SCHEDULER_SECRET) {
        console.log('❌ Unauthorized access attempt - invalid token');
        return { error: 'Unauthorized' };
    }
    console.log('✅ Authorization successful here');

    const config = useRuntimeConfig();
    const VAPID_PUBLIC_KEY = config.public.VAPID_KEY;
    const VAPID_PRIVATE_KEY = config.private.vapidPrivateKey;

    console.log('🔑 VAPID keys configured:', {
        publicKey: VAPID_PUBLIC_KEY ? '✅ Set' : '❌ Missing',
        privateKey: VAPID_PRIVATE_KEY ? '✅ Set' : '❌ Missing',
    });

    webpush.setVapidDetails(
        'mailto:greg.field1992@gmail.com',
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY,
    );

    const supabase = await serverSupabaseClient(event);

    // Find todos with a notificationDateTime in the past and not yet notified
    const now = new Date();
    console.log('⏰ Current time:', now.toISOString());

    const { data: todos, error: todosError } = await supabase
        .from('Todos')
        .select('*')
        .lte('notification_date_time', now.toISOString())
        .neq('notification_sent', true);

    if (todosError) {
        console.error('Error fetching todos:', todosError);
        return { error: 'Failed to fetch todos' };
    }

    console.log(`📋 Found ${todos?.length || 0} todos that need notifications`);

    if (todos && todos.length > 0) {
        console.log('📝 Todos requiring notifications:', todos.map(t => ({
            id: t.id,
            name: t.name,
            userId: t.user_id,
            notificationDateTime: t.notification_date_time,
            notificationSent: t.notification_sent,
        })));
    }

    let sent = 0;
    const userSubscriptions = [];

    for (const todo of todos || []) {
        console.log(`\n🔄 Processing todo: ${todo.name} (ID: ${todo.id})`);

        // Find the user from Users table
        const { data: user, error: userError } = await supabase
            .from('Users')
            .select('*')
            .eq('id', todo.user_id)
            .single();

        console.log(`👤 User lookup for ${todo.user_id}:`, user ? '✅ Found' : '❌ Not found');

        if (userError || !user) {
            console.log(`❌ User not found for todo ${todo.id}`);
            continue;
        }

        if (!user.push_subscriptions || user.push_subscriptions.length === 0) {
            console.log(`❌ No push subscriptions found for user ${user.username}`);
            continue;
        }
        userSubscriptions.push(user);

        console.log(`📱 User ${user.username} has ${user.push_subscriptions.length} push subscriptions`);

        // Send notification to all subscriptions
        for (let i = 0; i < user.push_subscriptions.length; i++) {
            const sub = user.push_subscriptions[i];
            console.log(`📤 Attempting to send notification ${i + 1}/${user.push_subscriptions.length}`);

            try {
                const payload = JSON.stringify({
                    title: 'Todo Reminder',
                    message: `Reminder for todo: ${todo.name}`,
                });

                console.log('📦 Notification payload:', payload);
                console.log('🔗 Subscription endpoint:', sub.endpoint ? '✅ Present' : '❌ Missing');

                await webpush.sendNotification(sub, payload);
                console.log(`✅ Notification sent successfully to subscription ${i + 1}`);
                sent++;
            }
            catch (e: any) {
                console.error(`❌ Failed to send notification to subscription ${i + 1}:`, e);
                console.error('🔍 Error details:', {
                    message: e?.message || 'Unknown error',
                    statusCode: e?.statusCode,
                    headers: e?.headers,
                    body: e?.body,
                });
            }
        }

        // Mark todo as notified
        console.log(`💾 Marking todo ${todo.id} as notified`);
        const { error: updateError } = await supabase
            .from('Todos')
            .update({ notification_sent: true })
            .eq('id', todo.id);

        if (updateError) {
            console.error(`❌ Failed to mark todo ${todo.id} as notified:`, updateError);
        }
        else {
            console.log(`✅ Todo ${todo.id} marked as notified`);
        }
    }
    console.log(`userSubscriptions ${userSubscriptions}`);
    console.log(`\n📊 Summary: ${sent} notifications sent out of ${todos?.length || 0} todos processed`);
    return { sent, checked: todos?.length || 0, todos };
});
