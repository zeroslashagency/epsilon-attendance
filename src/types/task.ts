export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    due_date?: string; // ISO Status
    created_at: string;
    updated_at: string;
    created_by: string; // User ID
    metadata?: Record<string, unknown>;

    // Joined fields (optional)
    creator_name?: string;
    assignees?: TaskAssignment[];
}

export interface TaskAssignment {
    id: string;
    task_id: string;
    user_id: string;
    assigned_at: string;
    assigned_by?: string;

    // Joined fields
    user?: {
        full_name: string;
        email: string;
        avatar_url?: string;
    };
}

export interface CreateTaskDTO {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    due_date?: string;
    assignee_ids?: string[]; // List of user IDs to assign
}

export interface UpdateTaskDTO {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    due_date?: string;
    assignee_ids?: string[]; // Replaces existing assignees
}
