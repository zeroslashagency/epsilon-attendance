import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectPopover,
    SelectListBox,
} from "@/components/ui/select";
import { Task } from "@/types/task";
import { getTasks } from "@/services/task.service";
import { TaskList } from "@/components/Tasks/TaskList";
import { TaskModal } from "@/components/Tasks/TaskModal";

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState("all");

    const fetchTasks = async () => {
        setIsLoading(true);
        try {
            const data = await getTasks({
                status: statusFilter === "all" ? undefined : statusFilter,
            });
            setTasks(data);
        } catch (error) {
            console.error("Failed to fetch tasks", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [statusFilter]);

    const handleCreate = () => {
        setEditingTask(null);
        setIsModalOpen(true);
    };

    const handleEdit = (task: Task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
                    <p className="text-muted-foreground">
                        Manage your daily tasks and assignments.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" /> Add Task
                    </Button>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex flex-1 items-center space-x-2">
                    <Input
                        placeholder="Filter tasks..."
                        className="h-8 w-[150px] lg:w-[250px]"
                        disabled // Implementation of client-side text search omitted for brevity
                    />
                    <Select
                        selectedKey={statusFilter}
                        onSelectionChange={(key) => setStatusFilter(key as string)}
                    >
                        <SelectTrigger className="h-8 w-[150px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectPopover>
                            <SelectListBox>
                                <SelectItem id="all" textValue="All Status">All Status</SelectItem>
                                <SelectItem id="pending" textValue="Pending">Pending</SelectItem>
                                <SelectItem id="in_progress" textValue="In Progress">In Progress</SelectItem>
                                <SelectItem id="completed" textValue="Completed">Completed</SelectItem>
                                <SelectItem id="cancelled" textValue="Cancelled">Cancelled</SelectItem>
                            </SelectListBox>
                        </SelectPopover>
                    </Select>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center p-8">Loading...</div>
            ) : (
                <TaskList tasks={tasks} onEdit={handleEdit} onRefresh={fetchTasks} />
            )}

            <TaskModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                task={editingTask}
                onSuccess={fetchTasks}
            />
        </div>
    );
}
