import { addDoc, collection, deleteDoc, doc, onSnapshot, query, setDoc, where, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
const TaskContext = createContext();

export function TaskProvider({ children }) {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load user-specific tasks from Firestore with real-time listener & localStorage fallback
  useEffect(() => {
    if (!currentUser) {
      setTasks([]);
      setLoading(false);
      return;
    }

    // 1. Instantly load from localStorage cache as fallback/quick-load
    const localCacheKey = `acadesk_tasks_${currentUser.uid}`;
    const cachedTasks = localStorage.getItem(localCacheKey);
    if (cachedTasks) {
      try {
        setTasks(JSON.parse(cachedTasks));
      } catch (e) {
        console.error("Error parsing cached tasks:", e);
      }
    }

    // 2. Set up real-time listener from Firestore Cloud Database
    const q = query(collection(db, 'tasks'), where('ownerId', '==', currentUser.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasksArray = [];
      querySnapshot.forEach((docSnap) => {
        tasksArray.push({ id: docSnap.id, ...docSnap.data() });
      });
      
      // Update state and refresh localStorage backup
      setTasks(tasksArray);
      localStorage.setItem(localCacheKey, JSON.stringify(tasksArray));
      setLoading(false);
    }, (error) => {
      console.error('Error fetching tasks from Firestore, falling back to local storage cache:', error);
      // Fallback is already loaded, just turn off loader
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Add Task (updates Firestore and LocalStorage simultaneously)
  const addTask = async (title, course, date, type, group = 'Personal') => {
    if (!currentUser) return null;
    const newTask = {
      title,
      course,
      date: new Date(date).toISOString(),
      type,
      group,
      ownerId: currentUser.uid
    };
    
    // Add to Firestore in background
    const docRef = await addDoc(collection(db, 'tasks'), newTask);
    const addedTask = { id: docRef.id, ...newTask };
    
    // Update local React state and localStorage instantly
    setTasks((prev) => {
      const updated = [...prev, addedTask];
      localStorage.setItem(`acadesk_tasks_${currentUser.uid}`, JSON.stringify(updated));
      return updated;
    });
    
    return addedTask;
  };

  // Delete Task (updates Firestore and LocalStorage simultaneously)
  const deleteTask = async (id) => {
    if (!currentUser) return;
    
    // Trigger Firestore deletion
    await deleteDoc(doc(db, 'tasks', id));
    
    // Update local React state and localStorage instantly
    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      localStorage.setItem(`acadesk_tasks_${currentUser.uid}`, JSON.stringify(updated));
      return updated;
    });
  };

  // Update Task
  const updateTask = async (id, updatedFields) => {
    if (!currentUser) return;
    const taskRef = doc(db, 'tasks', id);
    await updateDoc(taskRef, { ...updatedFields });
    
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, ...updatedFields } : t));
      localStorage.setItem(`acadesk_tasks_${currentUser.uid}`, JSON.stringify(updated));
      return updated;
    });
  };

  // Rearrange / Bulk update all tasks (e.g., after AI rescheduling)
  const rearrangeTasks = async (rearrangedTasksList) => {
    if (!currentUser) return;
    
    // Find tasks that were in the original list but are missing in the new list (to be deleted)
    const originalIds = tasks.map(t => t.id);
    const newIds = new Set(rearrangedTasksList.map(t => t.id));
    const idsToDelete = originalIds.filter(id => !newIds.has(id));

    // Trigger updates/creates in new list in the background
    rearrangedTasksList.forEach((t) => {
      const taskRef = doc(db, 'tasks', t.id);
      setDoc(taskRef, { ...t, ownerId: currentUser.uid }, { merge: true })
        .catch(err => console.error("Error syncing task to Firestore:", err));
    });

    // Trigger deletions in the background
    idsToDelete.forEach((id) => {
      deleteDoc(doc(db, 'tasks', id))
        .catch(err => console.error("Error deleting task in Firestore:", err));
    });

    // Update local React state and localStorage instantly for snappy premium feel
    setTasks(rearrangedTasksList);
    localStorage.setItem(`acadesk_tasks_${currentUser.uid}`, JSON.stringify(rearrangedTasksList));
  };

  const value = {
    tasks,
    loading,
    addTask,
    deleteTask,
    updateTask,
    rearrangeTasks
  };

  return (
    <TaskContext.Provider value={value}>
      {!loading && children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  return useContext(TaskContext);
}
