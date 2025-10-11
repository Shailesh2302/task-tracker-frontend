import { Button, Card, CardBody, Progress } from "@nextui-org/react";
import { List, Plus } from "lucide-react";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../AppProvider";
import { motion } from "framer-motion";

const TaskListScreen: React.FC = () => {
  const { state, api } = useAppContext();

  // Fetch task lists when the component mounts
  useEffect(() => {
    if (null == state.taskLists) {
      api.fetchTaskLists();
    }
  }, [state]);

  const navigate = useNavigate();

  const handleCreateTaskList = () => {
    navigate("/new-task-list");
  };

  const handleSelectTaskList = (taskListId: string | undefined) => {
    navigate(`/task-lists/${taskListId}`);
    console.log(`Navigating to task list ${taskListId}`);
  };

  return (
    <div className="p-6 max-w-lg w-full mx-auto">
      <motion.h1
        className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        My Task Lists
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Button
          onPress={handleCreateTaskList}
          color="primary"
          startContent={<Plus size={20} aria-hidden="true" />}
          className="w-full mb-6 font-semibold shadow-md hover:shadow-lg transition-all"
          aria-label="Create New Task List"
        >
          Create New Task List
        </Button>
      </motion.div>

      <div className="space-y-5">
        {state.taskLists.map((list, index) => (
          <motion.div
            key={list.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              isPressable
              onPress={() => handleSelectTaskList(list.id)}
              className="backdrop-blur-lg bg-white/70 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 hover:scale-[1.02] hover:shadow-xl transition-transform duration-300"
              role="button"
              aria-label={`Select task list: ${list.title}`}
            >
              <CardBody>
                <div className="flex items-center mb-2">
                  <List
                    size={22}
                    className="mr-3 opacity-60 text-blue-500"
                    aria-hidden="true"
                  />
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {list.title}
                  </h2>
                </div>
                <p className="text-sm text-gray-500 mb-2">{list.count} tasks</p>
                <Progress
                  value={list.progress ? list.progress * 100 : 0}
                  className="h-2 rounded-full"
                  color="primary"
                  aria-label={`Progress for ${list.title}: ${list.progress}%`}
                />
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TaskListScreen;
