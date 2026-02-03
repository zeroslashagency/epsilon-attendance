import { format } from "date-fns";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Task } from "@/types/task";
import { toast } from "sonner";
import { deleteTask } from "@/services/task.service";

interface TaskListProps {
    tasks: Task[];
    onEdit: (task: Task) => void;
    onRefresh: () => void;
}

export function TaskList({ tasks, onEdit, onRefresh }: TaskListProps) {
    const handleDelete = async (id: string) => {
        try {
            if (confirm("Are you sure you want to delete this task?")) {
                await deleteTask(id);
                toast.success("Task deleted");
                onRefresh();
            }
        } catch (error) {
            toast.error("Failed to delete task");
        }
    };

    const getPriorityColor = (priority: string): BadgeProps["variant"] => {
        switch (priority) {
            case "high": return "destructive";
            case "medium": return "default"; // or secondary
            case "low": return "outline";
            default: return "default";
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
            in_progress: "bg-blue-100 text-blue-800 hover:bg-blue-100",
            completed: "bg-green-100 text-green-800 hover:bg-green-100",
            cancelled: "bg-muted text-muted-foreground hover:bg-muted",
        };
        return (
            <Badge className={styles[status] || "bg-muted text-muted-foreground"} variant="outline">
                {status.replace("_", " ")}
            </Badge>
        );
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tasks.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                No tasks found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        tasks.map((task) => (
                            <TableRow key={task.id}>
                                <TableCell className="font-medium">
                                    <div>
                                        {task.title}
                                        {task.description && (
                                            <p className="text-muted-foreground text-xs truncate max-w-[300px]">
                                                {task.description}
                                            </p>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>{getStatusBadge(task.status)}</TableCell>
                                <TableCell>
                                    <Badge variant={getPriorityColor(task.priority)}>
                                        {task.priority}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {task.due_date ? format(new Date(task.due_date), "MMM d, yyyy") : "-"}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => onEdit(task)}>
                                                <Pencil className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => handleDelete(task.id)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
