// Fichier combiné pour tous les composants de sélection
import React, { useMemo } from "react";
import Select from "react-select";
import { useSelector } from "react-redux";
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '../../config/constants';

// Styles communs pour tous les selects
const getCommonStyles = (theme = 'light') => ({
    control: (baseStyles, state) => ({
        ...baseStyles,
        backgroundColor: "var(--third-background-color)",
        borderColor: state.isFocused
            ? "var(--accent-color)"
            : "var(--border-color)",
        boxShadow: state.isFocused
            ? "0 0 0 1px var(--accent-color)"
            : "none",
    }),
    menu: (baseStyles) => ({
        ...baseStyles,
        backgroundColor: "var(--third-background-color)",
    }),
    option: (baseStyles, state) => ({
        ...baseStyles,
        backgroundColor: state.isSelected
            ? "var(--accent-color)"
            : state.isFocused
                ? "var(--secondary-background-color)"
                : "var(--third-background-color)",
        color: "var(--text-color)",
    }),
    singleValue: (baseStyles) => ({
        ...baseStyles,
        color: "var(--text-color)",
    }),
});

export const StatusSelect = React.memo(({ value = "idle", onChange, className, isMulti = false }) => {
    const theme = useSelector(state => state.ui?.theme) || 'light';
    const commonStyles = useMemo(() => getCommonStyles(theme), [theme]);

    const selectedStatus = isMulti
        ? STATUS_OPTIONS.filter(option => value.includes(option.value))
        : STATUS_OPTIONS.find(option => option.value === value) || STATUS_OPTIONS[0];

    return (
        <Select
            value={selectedStatus}
            onChange={(selected) => {
                const newValue = isMulti
                    ? selected.map(option => option.value)
                    : selected?.value || "idle";
                onChange(newValue);
            }}
            options={STATUS_OPTIONS}
            isMulti={isMulti}
            className={`select-status ${className}`}
            classNamePrefix="select-status"
            styles={{
                ...commonStyles,
                option: (baseStyles, state) => ({
                    ...commonStyles.option(baseStyles, state),
                    backgroundColor: state.data.color,
                }),
            }}
        />
    );
});

export const PrioritySelect = React.memo(({ value = "medium", onChange, className, isMulti = false }) => {
    const theme = useSelector(state => state.ui?.theme) || 'light';
    const commonStyles = useMemo(() => getCommonStyles(theme), [theme]);

    const selectedPriority = isMulti
        ? PRIORITY_OPTIONS.filter(option => value.includes(option.value))
        : PRIORITY_OPTIONS.find(option => option.value === value) || PRIORITY_OPTIONS[1];

    return (
        <Select
            value={selectedPriority}
            onChange={(selected) => {
                const newValue = isMulti
                    ? selected.map(option => option.value)
                    : selected?.value || "medium";
                onChange(newValue);
            }}
            options={PRIORITY_OPTIONS}
            isMulti={isMulti}
            className={`select-priority ${className}`}
            classNamePrefix="select-priority"
            styles={{
                ...commonStyles,
                option: (baseStyles, state) => ({
                    ...commonStyles.option(baseStyles, state),
                    backgroundColor: state.data.color,
                }),
            }}
        />
    );
});

export const UserSelect = React.memo(({ value = "", onChange, className, isMulti = false }) => {
    const theme = useSelector(state => state.ui?.theme) || 'light';
    const users = useSelector(state => state.projects.users);
    const commonStyles = useMemo(() => getCommonStyles(theme), [theme]);

    const userOptions = users.map((user) => ({
        value: user.id,
        label: user.name,
        profilePicture: user.profilePicture || "default-profile-pic.svg",
    }));

    const selectedUser = isMulti
        ? userOptions.filter(option => value.includes(option.value))
        : userOptions.find(option => option.value === value);

    const formatOptionLabel = ({ label, profilePicture }) => (
        <div style={{ display: "flex", alignItems: "center" }}>
            <img
                src={`/assets/img/${profilePicture}`}
                alt={label}
                style={{ width: 20, height: 20, borderRadius: "50%", marginRight: 8 }}
            />
            <span>{label}</span>
        </div>
    );

    return (
        <Select
            value={selectedUser}
            onChange={(selected) => {
                const newValue = isMulti
                    ? selected.map(option => option.value)
                    : selected?.value || "";
                onChange(newValue);
            }}
            options={userOptions}
            isMulti={isMulti}
            className={`select-user ${className}`}
            classNamePrefix="select-user"
            formatOptionLabel={formatOptionLabel}
            placeholder="Responsable"
            styles={commonStyles}
        />
    );
});

StatusSelect.displayName = 'StatusSelect';
PrioritySelect.displayName = 'PrioritySelect';
UserSelect.displayName = 'UserSelect';