export async function handleDeploymentReady(
    supabase: any,
    projectId: string,
    deploymentUrl: string,
    state: string,
    userId: string,
) {
    const { error } = await supabase
        .from('Todos')
        .update({
            vercel_deployment_url: deploymentUrl,
            vercel_deployment_status: state,
        })
        .eq('user_id', userId)
        .eq('vercel_project_id', projectId);

    if (error) {
        console.error('Error updating todo deployment for Vercel event:', error);
    }
}
