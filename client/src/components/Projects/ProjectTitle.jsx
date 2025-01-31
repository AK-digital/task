"use client";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from "@/styles/layouts/header.module.css";
import { useState, useRef, useEffect } from 'react';
import { updateProjectName } from '@/actions/project';
import { useDebouncedCallback } from 'use-debounce';

export default function ProjectTitle({ projects }) {
    const pathname = usePathname();
    const projectId = pathname.split('/').pop();
    const currentProject = projects?.find(project => project._id === projectId);

    const [isEditing, setIsEditing] = useState(false);
    const [projectName, setProjectName] = useState(currentProject?.name || 'Täsk');
    const inputRef = useRef(null);

    const debouncedUpdate = useDebouncedCallback(async (newName) => {
        if (projectId && newName !== currentProject?.name) {
            const response = await updateProjectName(projectId, newName);
            if (!response.success) {
                setProjectName(currentProject?.name); // Reset en cas d'erreur
            }
        }
    }, 600);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    useEffect(() => {
        setProjectName(currentProject?.name || 'Täsk');
    }, [currentProject]);

    if (pathname === '/') {
        return (
            <div className={styles.title}>
                <Link href="/">Täsk</Link>
            </div>
        );
    }

    const handleClick = () => {
        if (!pathname.startsWith('/project/')) return;
        setIsEditing(true);
    };

    const handleBlur = () => {
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            setIsEditing(false);
            e.target.blur();
        }
        if (e.key === 'Escape') {
            setProjectName(currentProject?.name);
            setIsEditing(false);
        }
    };

    const handleChange = (e) => {
        const newName = e.target.value;
        setProjectName(newName);
        debouncedUpdate(newName);
    };

    return (
        <div className={styles.title}>
            {isEditing ? (
                <input
                    ref={inputRef}
                    type="text"
                    value={projectName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className={styles.titleInput}
                />
            ) : (
                <span onClick={handleClick}>{projectName}</span>
            )}
        </div>
    );
}