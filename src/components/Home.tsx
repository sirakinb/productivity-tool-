import React, { useState, useEffect } from "react";
import { collection, query, where, orderBy, onSnapshot, addDoc, Timestamp, deleteDoc, updateDoc, writeBatch, doc } from "firebase/firestore";
import { User } from "firebase/auth"; // Added this import
import { db, auth, Task } from "../firebase";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, parseISO, startOfDay } from "date-fns";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import TaskCard from "./TaskCard";
import NewTaskInput from "./NewTaskInput";
import TaskDetails from "./TaskDetails";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { onAuthStateChanged } from "firebase/auth";

const Home: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        const tasksQuery = query(
          collection(db, "tasks"),
          where("userId", "==", currentUser.uid),
          orderBy("date", "asc"),
          orderBy("order", "asc")
        );

        const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
          const newTasks = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Task[];
          console.log("Fetched tasks:", newTasks);
          setTasks(newTasks);
        }, (error) => {
          console.error("Error fetching tasks:", error);
        });

        return () => unsubscribeTasks();
      } else {
        setTasks([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleNewTaskSubmit = async (text: string, day: Date) => {
    if (!user || !text.trim()) {
      console.log("No user or empty text, aborting task creation");
      return;
    }

    try {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayTasks = tasks.filter(task => 
        format(task.date.toDate(), 'yyyy-MM-dd') === dayStr
      );
      const maxOrder = dayTasks.length > 0 ? Math.max(...dayTasks.map(t => t.order)) : -1;
      
      const newTask: Omit<Task, 'id'> = {
        text: text.trim(),
        date: Timestamp.fromDate(startOfDay(day)),
        completed: false,
        userId: user.uid,
        subtasks: [],
        notes: "",
        order: maxOrder + 1,
      };

      console.log("Attempting to add new task:", newTask);
      await addDoc(collection(db, "tasks"), newTask);
      console.log("New task added successfully");
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleEditTask = async (updatedTask: Task) => {
    try {
      const taskRef = doc(db, "tasks", updatedTask.id);
      await updateDoc(taskRef, {
        text: updatedTask.text,
      });
      console.log("Task updated successfully");
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
      console.log("Task deleted successfully from Firestore");
      setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    // If dropped in the same position, do nothing
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    try {
      const draggedTask = tasks.find(task => task.id === draggableId);
      if (!draggedTask) return;

      const updatedTasks = Array.from(tasks);
      updatedTasks.splice(source.index, 1);
      updatedTasks.splice(destination.index, 0, draggedTask);

      const dayTasks = updatedTasks.filter(task => 
        format(task.date.toDate(), 'yyyy-MM-dd') === source.droppableId
      );

      const batch = writeBatch(db);
      dayTasks.forEach((task, index) => {
        batch.update(doc(db, "tasks", task.id), { order: index });
      });

      await batch.commit();

      // Update local state
      setTasks(updatedTasks.map((task, index) => ({
        ...task,
        order: dayTasks.findIndex(t => t.id === task.id)
      })));

      console.log("Task moved successfully");
    } catch (error) {
      console.error("Error moving task:", error);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    const taskToToggle = tasks.find((task) => task.id === taskId);
    if (taskToToggle) {
      const updatedTask = { ...taskToToggle, completed: !taskToToggle.completed };
      try {
        const taskRef = doc(db, "tasks", taskId);
        await updateDoc(taskRef, { completed: updatedTask.completed });
        console.log("Task completion toggled successfully in Firestore");
        setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? updatedTask : t));
      } catch (error) {
        console.error("Error toggling task completion:", error);
      }
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCloseDetails = () => {
    setSelectedTask(null);
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    try {
      const taskRef = doc(db, "tasks", updatedTask.id);
      await updateDoc(taskRef, {
        text: updatedTask.text,
        completed: updatedTask.completed,
        subtasks: updatedTask.subtasks,
        notes: updatedTask.notes,
      });
      setTasks(prevTasks => prevTasks.map(t => t.id === updatedTask.id ? updatedTask : t));
      setSelectedTask(null);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const calculateDayProgress = (dayTasks: Task[]) => {
    const totalTasks = dayTasks.length;
    const completedTasks = dayTasks.filter(task => task.completed).length;
    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Group days into weeks
    const weeks = [];
    for (let i = 0; i < daysInMonth.length; i += 7) {
      weeks.push(daysInMonth.slice(i, i + 7));
    }

    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="hidden md:block space-y-4 overflow-x-auto">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-4 min-w-max">
              {week.map((day, dayIndex) => renderDayColumn(day, dayIndex))}
            </div>
          ))}
        </div>
        <div className="md:hidden flex flex-col pb-16">
          {daysInMonth.map((day, dayIndex) => renderDayColumn(day, dayIndex))}
        </div>
      </DragDropContext>
    );
  };

  const renderDayColumn = (day: Date, dayIndex: number) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayTasks = tasks
      .filter(task => format(task.date.toDate(), 'yyyy-MM-dd') === dayStr)
      .sort((a, b) => a.order - b.order);
    const dayProgress = calculateDayProgress(dayTasks);

    return (
      <div key={dayStr} className="day-column bg-gray-800 p-2 rounded-lg mb-4 md:mb-0 md:min-w-[350px] md:h-[calc(100vh-300px)] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-2 text-white sticky top-0 bg-gray-800 py-2">
          {format(day, "EEE, MMM d")}
        </h3>
        {/* Day progress bar */}
        <div className="mb-2 bg-gray-700 rounded-lg p-1">
          <div className="flex justify-between items-center mb-1">
            <span className="text-white text-xs">Progress</span>
            <span className="text-white text-xs">{Math.round(dayProgress)}%</span>
          </div>
          <div className="bg-gray-600 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-300 ease-out"
              style={{ width: `${dayProgress}%` }}
            ></div>
          </div>
        </div>
        <Droppable droppableId={dayStr} type="TASK">
          {(provided, snapshot) => (
            <div 
              {...provided.droppableProps} 
              ref={provided.innerRef}
              className={`min-h-[50px] ${snapshot.isDraggingOver ? 'bg-gray-700' : ''}`}
            >
              {dayTasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <TaskCard
                        task={task}
                        index={index}
                        onEdit={handleEditTask}
                        onDelete={() => handleDeleteTask(task.id)}
                        onToggle={() => handleToggleTask(task.id)}
                        onClick={() => handleTaskClick(task)}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        <NewTaskInput onSubmit={(text) => handleNewTaskSubmit(text, day)} day={day} />
      </div>
    );
  };

  const handleSaveAll = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("No user logged in");
        return;
      }

      const batch = writeBatch(db);

      tasks.forEach((task) => {
        const taskRef = doc(db, "tasks", task.id);
        batch.set(taskRef, {
          text: task.text,
          completed: task.completed,
          date: task.date,
          userId: user.uid,
          subtasks: task.subtasks || [],
          notes: task.notes || "",
        }, { merge: true });
      });

      await batch.commit();
      console.log("All tasks saved successfully");
    } catch (error) {
      console.error("Error saving all tasks:", error);
    }
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };

  const renderMonthTabs = () => {
    const months = Array.from({ length: 12 }, (_, i) => addMonths(new Date(currentMonth.getFullYear(), 0), i));
    
    return (
      <div className="flex overflow-x-auto mb-2 md:mb-4">
        {months.map((month) => (
          <button
            key={month.getTime()}
            onClick={() => setCurrentMonth(month)}
            className={`px-2 py-1 md:px-4 md:py-2 mr-1 md:mr-2 text-xs md:text-sm rounded ${
              month.getMonth() === currentMonth.getMonth() ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            {format(month, 'MMM')}
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please sign in to view your tasks.</div>;
  }

  return (
    <div className="home p-2 md:p-4 bg-gray-900 min-h-screen flex flex-col">
      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 md:mb-4 text-center text-white">Monthly Tasks</h1>
      
      {/* Month tabs */}
      {renderMonthTabs()}

      {/* Month navigation */}
      <div className="flex justify-between items-center mb-2 md:mb-4">
        <button onClick={handlePreviousMonth} className="bg-blue-500 text-white px-2 py-1 md:px-4 md:py-2 text-sm md:text-base rounded">Prev</button>
        <h2 className="text-lg md:text-xl font-semibold text-white">{format(currentMonth, 'MMMM yyyy')}</h2>
        <button onClick={handleNextMonth} className="bg-blue-500 text-white px-2 py-1 md:px-4 md:py-2 text-sm md:text-base rounded">Next</button>
      </div>

      {/* Month view */}
      <div className="month-view md:overflow-x-auto overflow-y-auto pb-16 md:pb-4 flex-grow">
        {renderMonthView()}
      </div>

      {selectedTask && (
        <TaskDetails
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdateTask}
        />
      )}
      <ToastContainer />
    </div>
  );
};

export default Home;
