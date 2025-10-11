import { parseDate } from "@internationalized/date";
import {
  Button,
  Checkbox,
  DateInput,
  Progress,
  Spacer,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Spinner,
} from "@nextui-org/react";
import { ArrowLeft, Edit, Minus, Plus, Trash } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../AppProvider";
import Task from "../domain/Task";
import { TaskStatus } from "../domain/TaskStatus";
import { motion, AnimatePresence } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const TaskListScreen: React.FC = () => {
  const { state, api } = useAppContext();
  const { listId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const taskList = state.taskLists.find((tl) => listId === tl.id);

  useEffect(() => {
    const loadInitialData = async () => {
      if (!listId) return;
      setIsLoading(true);
      try {
        if (!taskList) await api.getTaskList(listId);
        try {
          await api.fetchTasks(listId);
        } catch {
          console.log("Tasks not available yet");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, [listId]);

  const completionPercentage = React.useMemo(() => {
    if (listId && state.tasks[listId]) {
      const tasks = state.tasks[listId];
      const closedCount = tasks.filter((t) => t.status === TaskStatus.CLOSED)
        .length;
      return tasks.length > 0 ? (closedCount / tasks.length) * 100 : 0;
    }
    return 0;
  }, [state.tasks, listId]);

  const toggleStatus = (task: Task) => {
    if (!listId) return;
    const updatedTask = { ...task };
    updatedTask.status =
      task.status === TaskStatus.CLOSED ? TaskStatus.OPEN : TaskStatus.CLOSED;
    api.updateTask(listId, task.id as string, updatedTask).then(() =>
      api.fetchTasks(listId)
    );
  };

  const deleteTaskList = async () => {
    if (!listId) return;
    await api.deleteTaskList(listId);
    navigate("/");
  };

  const tableRows = () => {
    if (!listId || !state.tasks[listId]) return [];
    return state.tasks[listId].map((task) => (
      <TableRow key={task.id}>
        <TableCell>
          <Checkbox
            isSelected={task.status === TaskStatus.CLOSED}
            onValueChange={() => toggleStatus(task)}
          />
        </TableCell>
        <TableCell>
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeInUp}
          >
            {task.title}
          </motion.div>
        </TableCell>
        <TableCell>
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeInUp}
          >
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                task.priority === "HIGH"
                  ? "bg-red-100 text-red-600"
                  : task.priority === "MEDIUM"
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-green-100 text-green-600"
              }`}
            >
              {task.priority}
            </span>
          </motion.div>
        </TableCell>
        <TableCell>
          {task.dueDate && (
            <DateInput
              isDisabled
              defaultValue={parseDate(
                new Date(task.dueDate).toISOString().split("T")[0]
              )}
            />
          )}
        </TableCell>
        <TableCell>
          <div className="flex space-x-2 justify-center">
            <Button
              variant="ghost"
              onClick={() =>
                navigate(`/task-lists/${listId}/edit-task/${task.id}`)
              }
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => api.deleteTask(listId, task.id as string)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ));
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded-2xl shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">{taskList?.title || "Task List"}</h1>
        <Button
          variant="ghost"
          onClick={() => navigate(`/edit-task-list/${listId}`)}
        >
          <Edit className="h-5 w-5" />
        </Button>
      </div>

      {/* Progress */}
      <Progress value={completionPercentage} className="mb-4" color="primary" />

      {/* Add Task */}
      <Button
        onClick={() => navigate(`/task-lists/${listId}/new-task`)}
        className="mb-6 w-full"
      >
        <Plus className="h-4 w-4 mr-2" /> Add Task
      </Button>

      {/* Table */}
      <Table aria-label="Tasks list">
        <TableHeader>
          <TableColumn>Completed</TableColumn>
          <TableColumn>Title</TableColumn>
          <TableColumn>Priority</TableColumn>
          <TableColumn>Due Date</TableColumn>
          <TableColumn>Actions</TableColumn>
        </TableHeader>
        <TableBody>{tableRows()}</TableBody>
      </Table>

      <Spacer y={4} />

      {/* Delete TaskList */}
      <Button color="danger" startContent={<Minus />} onClick={deleteTaskList}>
        Delete TaskList
      </Button>
    </div>
  );
};

export default TaskListScreen;
