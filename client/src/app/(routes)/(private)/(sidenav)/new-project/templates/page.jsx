"use server";
import { getTemplates } from "@/api/template";
import Templates from "@/components/Templates/Templates";

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return (
    <main className="ml-5 w-full h-[calc(100svh-60px)] overflow-auto">
      <div className="flex justify-center items-center bg-primary rounded-tl-lg h-full w-full p-6">
        <Templates templates={templates} />
      </div>
    </main>
  );
}
