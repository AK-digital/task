"use client";
import AdminFilter from "./AdminFilter";
import ProjectFilter from "./ProjectFilter";
import StartDateFilter from "./StartDateFilter";
import EndDateFilter from "./EndDateFilter";

export default function Filters({ projects, queries, setQueries }) {
  return (
    <div className="flex items-center gap-3">
      <ProjectFilter
        projects={projects}
        queries={queries}
        setQueries={setQueries}
      />
      <AdminFilter
        projects={projects}
        queries={queries}
        setQueries={setQueries}
      />
      <StartDateFilter queries={queries} setQueries={setQueries} />
      <EndDateFilter queries={queries} setQueries={setQueries} />
    </div>
  );
}
