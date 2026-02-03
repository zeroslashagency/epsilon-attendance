import { supabase } from "@/lib/supabase";
import { CreateTaskDTO, Task, TaskAssignment, UpdateTaskDTO } from "@/types/task";

/**
 * Fetch tasks with optional filtering
 */
export async function getTasks(filters?: {
    userId?: string; // If provided, shows assigned + created by
    status?: string;
    projectId?: string; // Future proofing
}): Promise<Task[]> {
    try {
        let query = supabase
            .from('tasks')
            .select(`
        *,
        assignees:task_assignments(
          user_id,
          user:user_id(
            full_name,
            email,
            avatar_url
          )
        ),
        creator:created_by(
          full_name,
          avatar_url
        )
      `)
            .order('due_date', { ascending: true });

        if (filters?.status && filters.status !== 'all') {
            query = query.eq('status', filters.status);
        }

        // Filter by user (Assigned OR Created)
        // Note: This complex OR logic is harder with simple RLS & Client queries without RPC
        // depending on how we want to filter. 
        // For now, let's just fetch all (RLS limits what we see) or filter by status.

        // If we want to filter "My Tasks" explicitly client-side:
        // We can rely on RLS to return only what we are allowed to see.
        // But if we specifically want "Assigned To Me":
        if (filters?.userId) {
            // This is tricky with simple query. 
            // We might need an RPC or fetch all visible and filter in memory if list is small.
            // Alternatively: using an OR filter:
            // query = query.or(`created_by.eq.${filters.userId},task_assignments.user_id.eq.${filters.userId}`);
            // But `task_assignments` is a joined table, so simple OR won't work easily on correct level.
        }

        const { data, error } = await query;
        if (error) throw error;

        // Transform to Task type (normalizing joined data if needed)
        return (data || []) as Task[];
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return [];
    }
}

export async function getTask(id: string): Promise<Task | null> {
    try {
        const { data, error } = await supabase
            .from('tasks')
            .select(`
        *,
        assignees:task_assignments(
          user_id,
          assigned_at,
          user:user_id(
            full_name,
            email,
            avatar_url
          )
        )
      `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Task;
    } catch (error) {
        console.error('Error fetching task:', error);
        return null;
    }
}

export async function createTask(taskData: CreateTaskDTO): Promise<Task | null> {
    try {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) throw new Error("Not authenticated");

        // 1. Create Task
        const { data: task, error: taskError } = await supabase
            .from('tasks')
            .insert({
                title: taskData.title,
                description: taskData.description,
                status: taskData.status || 'pending',
                priority: taskData.priority || 'medium',
                due_date: taskData.due_date,
                created_by: user.id
            })
            .select()
            .single();

        if (taskError) throw taskError;
        if (!task) throw new Error("Failed to create task");

        // 2. Create Assignments
        if (taskData.assignee_ids && taskData.assignee_ids.length > 0) {
            const assignments = taskData.assignee_ids.map(userId => ({
                task_id: task.id,
                user_id: userId,
                assigned_by: user.id
            }));

            const { error: assignError } = await supabase
                .from('task_assignments')
                .insert(assignments);

            if (assignError) {
                console.error("Created task but failed to assign users:", assignError);
                // We generally don't rollback here for simple client usage, but we should warn.
            }
        }

        return getTask(task.id);
    } catch (error) {
        console.error('Error creating task:', error);
        return null;
    }
}

export async function updateTask(id: string, updates: UpdateTaskDTO): Promise<Task | null> {
    try {
        // 1. Update Task Fields
        const { error: taskError } = await supabase
            .from('tasks')
            .update({
                title: updates.title,
                description: updates.description,
                status: updates.status,
                priority: updates.priority,
                due_date: updates.due_date,
            })
            .eq('id', id);

        if (taskError) throw taskError;

        // 2. Update Assignments (if provided)
        if (updates.assignee_ids !== undefined) {
            const user = (await supabase.auth.getUser()).data.user;

            // Delete existing
            await supabase
                .from('task_assignments')
                .delete()
                .eq('task_id', id);

            // Insert new
            if (updates.assignee_ids.length > 0 && user) {
                const assignments = updates.assignee_ids.map(userId => ({
                    task_id: id,
                    user_id: userId,
                    assigned_by: user.id
                }));

                await supabase
                    .from('task_assignments')
                    .insert(assignments);
            }
        }

        return getTask(id);
    } catch (error) {
        console.error('Error updating task:', error);
        return null;
    }
}

export async function deleteTask(id: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting task:', error);
        return false;
    }
}
