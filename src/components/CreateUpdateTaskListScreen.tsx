import React, { useEffect, useState } from "react";
import { Button, Input, Textarea, Spacer, Card } from "@nextui-org/react";
import { ArrowLeft } from "lucide-react";
import { useAppContext } from "../AppProvider";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

const CreateUpdateTaskListScreen: React.FC = () => {
  const { state, api } = useAppContext();
  const { listId } = useParams();
  const navigate = useNavigate();

  const [isUpdate, setIsUpdate] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState<string | undefined>("");

  const findTaskList = (taskListId: string) => {
    const filteredTaskLists = state.taskLists.filter(
      (tl) => taskListId === tl.id
    );
    return filteredTaskLists.length === 1 ? filteredTaskLists[0] : null;
  };

  const populateTaskList = (taskListId: string) => {
    const taskList = findTaskList(taskListId);
    if (taskList) {
      setTitle(taskList.title);
      setDescription(taskList.description);
      setIsUpdate(true);
    }
  };

  useEffect(() => {
    if (listId) {
      if (!state.taskLists) {
        api.fetchTaskLists().then(() => populateTaskList(listId));
      } else {
        populateTaskList(listId);
      }
    }
  }, [listId]);

  const createUpdateTaskList = async () => {
    try {
      if (isUpdate && listId) {
        await api.updateTaskList(listId, {
          id: listId,
          title,
          description,
          count: undefined,
          progress: undefined,
          tasks: undefined,
        });
      } else {
        await api.createTaskList({
          title,
          description,
          count: undefined,
          progress: undefined,
          tasks: undefined,
        });
      }
      navigate("/");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

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
          onClick={() => navigate("/")}
          className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 text-transparent bg-clip-text">
          {isUpdate ? "Update Task List" : "Create Task List"}
        </h1>
      </div>

      {/* Error */}
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
            placeholder="Enter task list title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            fullWidth
          />
          <Spacer y={2} />
          <Textarea
            label="Description"
            placeholder="Enter task list description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
          />
          <Spacer y={4} />
          <motion.div whileHover={{ scale: 1.02 }}>
            <Button
              type="submit"
              color="primary"
              onClick={createUpdateTaskList}
              fullWidth
              className="font-semibold shadow-md hover:shadow-lg transition-all"
            >
              {isUpdate ? "Update Task List" : "Create Task List"}
            </Button>
          </motion.div>
        </Card>
      </motion.form>
    </motion.div>
  );
};

export default CreateUpdateTaskListScreen;
