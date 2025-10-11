import React, { useEffect, useState } from "react";
import {
  Button,
  Input,
  Textarea,
  Spacer,
  Card,
  Chip,
  Spinner,
} from "@nextui-org/react";
import { ArrowLeft } from "lucide-react";
import { useAppContext } from "../AppProvider";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { TaskPriority } from "../domain/TaskPriority";
import { DatePicker } from "@nextui-org/date-picker";
import { TaskStatus } from "../domain/TaskStatus";
import { parseDate } from "@internationalized/date";
import { motion } from "framer-motion";

const CreateUpdateTaskScreen: React.FC = () => {
  const { state, api } = useAppContext();
  const { listId, taskId } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdate, setIsUpdate] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState(TaskPriority.MEDIUM);
  const [status, setStatus] = useState<TaskStatus | undefined>(undefined);

  useEffect(() => {
    const loadInitialData = async () => {
      if (!listId || !taskId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        if (!state.taskLists.find((tl) => tl.id === listId)) {
          await api.getTaskList(listId);
        }

        const taskResponse = await api.getTask(listId, taskId);
        const task = state.tasks[listId]?.find((t) => t.id === taskId);

        if (task) {
          setTitle(task.title);
          setDescription(task.description || "");
          setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
          setPriority(task.priority || TaskPriority.MEDIUM);
          setStatus(task.status);
        }

        setIsUpdate(true);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.message || error.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [listId, taskId]);

  const createUpdateTask = async () => {
    try {
      if (!listId) return;

      if (isUpdate && taskId) {
        await api.updateTask(listId, taskId, {
          id: taskId,
          title,
          description,
          dueDate,
          priority,
          status,
        });
      } else {
        await api.createTask(listId, {
          title,
          description,
          dueDate,
          priority,
          status: undefined,
        });
      }

      navigate(`/task-lists/${listId}`);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  const handleDateChange = (date: Date | null) => {
    setDueDate(date || undefined);
  };

  const formatDateForPicker = (date: Date | undefined) => {
    if (!date) return undefined;
    return date.toISOString().split("T")[0];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <motion.div
      className="p-6 max-w-md mx-auto"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button
          variant="ghost"
          aria-label="Go back"
          onClick={() => navigate(`/task-lists/${listId}`)}
          className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 text-transparent bg-clip-text">
          {isUpdate ? "Update Task" : "Create Task"}
        </h1>
      </div>

      {/* Error Card */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4"
        >
          <Card className="p-4 bg-red-100/60 border border-red-400 text-red-700 shadow-sm">
            {error}
          </Card>
        </motion.div>
      )}

      {/* Form */}
      <motion.form
        onSubmit={(e) => e.preventDefault()}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6 backdrop-blur-xl bg-white/70 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all">
          <Input
            label="Title"
            placeholder="Enter task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            fullWidth
          />
          <Spacer y={2} />
          <Textarea
            label="Description"
            placeholder="Enter task description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
          />
          <Spacer y={2} />
          <DatePicker
            label="Due date (optional)"
            defaultValue={
              dueDate ? parseDate(formatDateForPicker(dueDate)!) : undefined
            }
            onChange={(newDate) =>
              handleDateChange(newDate ? new Date(newDate.toString()) : null)
            }
          />
          <Spacer y={4} />
          <div className="flex justify-between flex-wrap gap-2">
            {Object.values(TaskPriority).map((p) => (
              <Chip
                key={p}
                color={priority === p ? "primary" : "default"}
                variant={priority === p ? "solid" : "faded"}
                onClick={() => setPriority(p)}
                className="cursor-pointer transition-all hover:scale-105"
              >
                {p} Priority
              </Chip>
            ))}
          </div>
          <Spacer y={6} />
          <motion.div whileHover={{ scale: 1.02 }}>
            <Button
              type="submit"
              color="primary"
              onClick={createUpdateTask}
              fullWidth
              className="font-semibold shadow-md hover:shadow-lg transition-all"
            >
              {isUpdate ? "Update Task" : "Create Task"}
            </Button>
          </motion.div>
        </Card>
      </motion.form>
    </motion.div>
  );
};

export default CreateUpdateTaskScreen;
