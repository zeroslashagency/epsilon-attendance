import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectPopover,
    SelectListBox,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Task, TaskPriority, TaskStatus } from "@/types/task";
import { createTask, updateTask } from "@/services/task.service";
import { toast } from "sonner";

const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    priority: z.enum(["low", "medium", "high"]),
    status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
    due_date: z.date().optional(),
});

interface TaskModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task?: Task | null; // If provided, edit mode
    onSuccess: () => void;
}

export function TaskModal({ open, onOpenChange, task, onSuccess }: TaskModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            priority: "medium",
            status: "pending",
        },
    });

    useEffect(() => {
        if (task) {
            form.reset({
                title: task.title,
                description: task.description || "",
                priority: task.priority as TaskPriority,
                status: task.status as TaskStatus,
                due_date: task.due_date ? new Date(task.due_date) : undefined,
            });
        } else {
            form.reset({
                title: "",
                description: "",
                priority: "medium",
                status: "pending",
            });
        }
    }, [task, form, open]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            if (task) {
                await updateTask(task.id, {
                    title: values.title,
                    description: values.description,
                    priority: values.priority,
                    status: values.status,
                    due_date: values.due_date?.toISOString(),
                });
                toast.success("Task updated");
            } else {
                await createTask({
                    title: values.title,
                    description: values.description,
                    priority: values.priority,
                    status: values.status,
                    due_date: values.due_date?.toISOString(),
                });
                toast.success("Task created");
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <DialogOverlay isOpen={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{task ? "Edit Task" : "Create Task"}</DialogTitle>
                    <DialogDescription>
                        {task ? "Update task details." : "Add a new task to your list."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Task title" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Task details..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-4">
                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Priority</FormLabel>
                                        <Select
                                            selectedKey={field.value}
                                            onSelectionChange={(key) => field.onChange(key)}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectPopover>
                                                <SelectListBox>
                                                    <SelectItem id="low" textValue="Low">Low</SelectItem>
                                                    <SelectItem id="medium" textValue="Medium">Medium</SelectItem>
                                                    <SelectItem id="high" textValue="High">High</SelectItem>
                                                </SelectListBox>
                                            </SelectPopover>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Status</FormLabel>
                                        <Select
                                            selectedKey={field.value}
                                            onSelectionChange={(key) => field.onChange(key)}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectPopover>
                                                <SelectListBox>
                                                    <SelectItem id="pending" textValue="Pending">Pending</SelectItem>
                                                    <SelectItem id="in_progress" textValue="In Progress">In Progress</SelectItem>
                                                    <SelectItem id="completed" textValue="Completed">Completed</SelectItem>
                                                    <SelectItem id="cancelled" textValue="Cancelled">Cancelled</SelectItem>
                                                </SelectListBox>
                                            </SelectPopover>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="due_date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Due Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date < new Date(new Date().setHours(0, 0, 0, 0))
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" isDisabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {task ? "Update" : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </DialogOverlay>
    );
}
