import React from 'react';
import TasksHeader from './TasksHeader';
import Task from './Task';
import styles from '@/styles/components/tasks/task-group.module.css';

export default function TaskGroup({ title, tasks }) {
    // Si pas de tâches, ne pas afficher la section
    if (!tasks || tasks.length === 0) {
        return null;
    }

    return (
        <div className={styles.group}>
            <h3 className={styles.groupTitle}>{title}</h3>
            {/* Afficher TasksHeader seulement s'il y a des tâches */}
            <TasksHeader />
            <div className={styles.tasksList}>
                {tasks.map(task => (
                    <Task key={task._id} task={task} />
                ))}
            </div>
        </div>
    );
}