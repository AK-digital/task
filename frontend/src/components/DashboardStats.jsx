// src/components/DashboardStats.jsx
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentProject } from '../store/slices/projectSlice';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const DashboardStats = () => {
    const currentProject = useSelector(selectCurrentProject);

    const stats = useMemo(() => {
        if (!currentProject) return null;

        const allTasks = currentProject.boards.flatMap(board => board.tasks);
        const totalTasks = allTasks.length;

        const statusStats = allTasks.reduce((acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
        }, {});

        const priorityStats = allTasks.reduce((acc, task) => {
            acc[task.priority] = (acc[task.priority] || 0) + 1;
            return acc;
        }, {});

        const overdueCount = allTasks.filter(task => {
            if (!task.deadline) return false;
            return new Date(task.deadline) < new Date() && task.status !== 'completed';
        }).length;

        // Calculer les stats par jour pour les 7 derniers jours
        const last7Days = [...Array(7)].map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return date.toISOString().split('T')[0];
        }).reverse();

        const activityStats = last7Days.map(date => {
            const dayTasks = allTasks.filter(task =>
                task.createdAt?.split('T')[0] === date
            ).length;

            const completedTasks = allTasks.filter(task =>
                task.responses?.some(r =>
                    r.date?.split('T')[0] === date
                )
            ).length;

            return {
                date,
                'Nouvelles tâches': dayTasks,
                'Activités': completedTasks
            };
        });

        return {
            total: totalTasks,
            status: statusStats,
            priority: priorityStats,
            overdue: overdueCount,
            activity: activityStats
        };
    }, [currentProject]);

    if (!stats) return null;

    const statusColors = {
        idle: '#3e86aa',
        processing: '#535aaa',
        testing: '#9e9a60',
        completed: '#588967',
        blocked: '#864f35'
    };

    const priorityColors = {
        low: '#5e5887',
        medium: '#50448a',
        high: '#4b3486',
        urgent: '#5e34a6'
    };

    const statusData = Object.entries(stats.status).map(([name, value]) => ({
        name,
        value
    }));

    const priorityData = Object.entries(stats.priority).map(([name, value]) => ({
        name,
        value
    }));

    return (
        <div className="dashboard-stats">
            <h2 className="text-2xl font-bold mb-6">Statistiques du projet</h2>

            <div className="stats-grid grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="stat-card p-4 bg-white rounded-lg shadow">
                    <h3 className="text-lg font-semibold">Total des tâches</h3>
                    <p className="stat-number text-3xl font-bold text-blue-600">{stats.total}</p>
                </div>

                <div className="stat-card p-4 bg-white rounded-lg shadow">
                    <h3 className="text-lg font-semibold">Tâches en retard</h3>
                    <p className="stat-number text-3xl font-bold text-red-500">{stats.overdue}</p>
                </div>

                <div className="stat-card p-4 bg-white rounded-lg shadow">
                    <h3 className="text-lg font-semibold">Taux de complétion</h3>
                    <p className="stat-number text-3xl font-bold text-green-600">
                        {Math.round((stats.status.completed || 0) / stats.total * 100)}%
                    </p>
                </div>
            </div>

            <div className="charts-grid grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="chart-container bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Distribution par statut</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={statusData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                label
                            >
                                {statusData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={statusColors[entry.name]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-container bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Distribution par priorité</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={priorityData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                label
                            >
                                {priorityData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={priorityColors[entry.name]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-container col-span-2 bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Activité des 7 derniers jours</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={stats.activity}>
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="Nouvelles tâches"
                                stroke="#3e86aa"
                                strokeWidth={2}
                            />
                            <Line
                                type="monotone"
                                dataKey="Activités"
                                stroke="#588967"
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default DashboardStats;