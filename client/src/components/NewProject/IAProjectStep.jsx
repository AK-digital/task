"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Smartphone,
  ShoppingCart,
  Globe,
  TrendingUp,
  Zap,
  Palette,
  Calendar,
  Share2,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function IAProjectStep({ onComplete }) {
  const [prompt, setPrompt] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  const PREDEFINED_PROMPTS = [
    {
      id: "communication-plan",
      title: t("createProject.prompts.communication.title"),
      icon: MessageSquare,
      prompt: t("createProject.prompts.communication.prompt"),
    },
    {
      id: "mobile-app",
      title: t("createProject.prompts.mobile.title"),
      icon: Smartphone,
      prompt: t("createProject.prompts.mobile.prompt"),
    },
    {
      id: "woocommerce-site",
      title: t("createProject.prompts.woocommerce.title"),
      icon: ShoppingCart,
      prompt: t("createProject.prompts.woocommerce.prompt"),
    },
    {
      id: "wordpress-showcase",
      title: t("createProject.prompts.wordpress.title"),
      icon: Globe,
      prompt: t("createProject.prompts.wordpress.prompt"),
    },
    {
      id: "marketing-plan",
      title: t("createProject.prompts.marketing.title"),
      icon: TrendingUp,
      prompt: t("createProject.prompts.marketing.prompt"),
    },
    {
      id: "landing-page",
      title: t("createProject.prompts.landing.title"),
      icon: Zap,
      prompt: t("createProject.prompts.landing.prompt"),
    },
    {
      id: "brand-identity",
      title: t("createProject.prompts.brand.title"),
      icon: Palette,
      prompt: t("createProject.prompts.brand.prompt"),
    },
    {
      id: "product-launch-planning",
      title: t("createProject.prompts.product.title"),
      icon: Calendar,
      prompt: t("createProject.prompts.product.prompt"),
    },
    {
      id: "social-media-planning",
      title: t("createProject.prompts.social.title"),
      icon: Share2,
      prompt: t("createProject.prompts.social.prompt"),
    },
  ];

  const handlePromptSelect = (predefinedPrompt) => {
    setSelectedPrompt(predefinedPrompt);
    setPrompt(predefinedPrompt.prompt);
    setResult(null);
    setError(null);
    setShowResults(false);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setShowResults(false);
    try {
      const res = await fetch("/api/ai/generate-board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error(t("createProject.generationError"));
      const data = await res.json();
      setResult(data);
      setShowResults(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleModifyPrompt = () => {
    setShowResults(false);
    setResult(null);
    setError(null);
  };

  const handleTaskEdit = (boardIndex, taskIndex, newValue) => {
    if (!result) return;

    const updatedResult = { ...result };
    updatedResult.boards[boardIndex].tasks[taskIndex] = newValue;
    setResult(updatedResult);
  };

  const handleRemoveTask = (boardIndex, taskIndex) => {
    if (!result) return;

    const updatedResult = { ...result };
    updatedResult.boards[boardIndex].tasks.splice(taskIndex, 1);
    setResult(updatedResult);
  };

  const handleAddTask = (boardIndex) => {
    if (!result) return;

    const updatedResult = { ...result };
    updatedResult.boards[boardIndex].tasks.push("Nouvelle tâche");
    setResult(updatedResult);
  };

  const handleBoardNameEdit = (boardIndex, newName) => {
    if (!result) return;

    const updatedResult = { ...result };
    updatedResult.boards[boardIndex].name = newName;
    setResult(updatedResult);
  };

  const handleProjectTitleEdit = (newTitle) => {
    if (!result) return;

    const updatedResult = { ...result };
    updatedResult.title = newTitle;
    setResult(updatedResult);
  };

  const handleCreateProject = () => {
    if (!result?.title || !Array.isArray(result?.boards)) return;

    // Passer les données à l'étape 3
    onComplete({
      type: "ia",
      title: result.title,
      boards: result.boards,
      skipDefaultBoard: true,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 h-full max-w-6xl mx-auto">
      {/* Colonne de gauche - Prompts prédéfinis */}
      <div className="bg-secondary rounded-xl shadow-sm p-6 flex flex-col overflow-hidden">
        <h3 className="text-xl font-semibold mb-6 text-text-dark-color">
          {t("createProject.suggestionsTitle")}
        </h3>
        <div
          className={`flex flex-col gap-3 overflow-y-auto flex-1 ${
            PREDEFINED_PROMPTS?.length > 5 ? "pr-1" : ""
          }`}
        >
          {PREDEFINED_PROMPTS.map((predefinedPrompt) => {
            const IconComponent = predefinedPrompt.icon;
            return (
              <button
                key={predefinedPrompt.id}
                className={`rounded-lg min-h-[100px] px-4 py-2 cursor-pointer transition-all duration-200 text-left w-full border border-accent-color ${
                  selectedPrompt?.id === predefinedPrompt.id
                    ? "bg-primary shadow-[0_0_0_2px_var(--accent-color)]"
                    : "bg-white hover:bg-primary hover:shadow-md"
                }`}
                onClick={() => handlePromptSelect(predefinedPrompt)}
                type="button"
              >
                <div className="w-full">
                  <div className="flex items-center gap-3">
                    <IconComponent
                      size={20}
                      className="text-accent-color flex-shrink-0"
                    />
                    <h4 className="text-base font-semibold text-text-dark-color leading-tight">
                      {predefinedPrompt.title}
                    </h4>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Colonne de droite - Formulaire et résultats */}
      <div className="bg-secondary rounded-xl shadow-sm p-8 overflow-y-auto flex flex-col gap-8 relative z-[1]">
        <div className="flex flex-col gap-4 flex-1 min-h-0">
          <h3 className="text-xl font-semibold text-text-dark-color">
            {t("createProject.title")}
          </h3>
          <p className="text-sm text-text-color-muted leading-relaxed">
            {t("createProject.description")}
          </p>

          <div className="relative flex-1 flex flex-col">
            <textarea
              className="w-full p-4 rounded-lg bg-primary text-text-dark-color text-sm leading-relaxed resize-none flex-1 min-h-[200px] shadow-sm font-inherit border border-border-color focus:outline-none focus:shadow-[0_0_0_2px_var(--accent-color)] disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t("createProject.placeholder")}
              rows={8}
              disabled={loading}
            />

            {loading && (
              <div className="absolute inset-0 bg-white/90 flex flex-col justify-center items-center gap-4 rounded-lg z-10">
                <div className="w-10 h-10 border-3 border-gray-300 border-t-accent-color rounded-full animate-spin"></div>
                <p className="text-text-dark-color text-sm">
                  {t("createProject.generating")}
                </p>
              </div>
            )}
          </div>

          <button
            className="bg-accent-color text-white border-none rounded-large py-3 px-6 text-medium cursor-pointer transition-all duration-200 font-normal self-end tracking-normal hover:bg-accent-color-hover hover:shadow-[0_5px_20px_rgba(151,112,69,0.15)] disabled:bg-accent-color-hover disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
          >
            {loading
              ? t("createProject.generating")
              : t("createProject.generateButton")}
          </button>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm shadow-sm">
              {error}
            </div>
          )}
        </div>

        {showResults && result && (
          <div className="absolute inset-0 bg-secondary rounded-xl z-10 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-8 pt-8 pb-4 bg-secondary sticky top-0 z-20">
              <h3 className="text-xl font-semibold text-text-dark-color">
                {t("createProject.suggestionsTitle")}
              </h3>
              <div className="flex gap-4 items-center">
                <button
                  className="bg-transparent text-text-color-muted border border-border-color rounded-large py-2 px-4 text-small cursor-pointer transition-all duration-200 font-normal tracking-normal hover:bg-primary hover:text-text-dark-color hover:border-accent-color"
                  onClick={handleModifyPrompt}
                  type="button"
                >
                  {t("general.edit")}
                </button>
                <button
                  className="bg-accent-color text-white border-none rounded-large py-3 px-6 text-medium cursor-pointer transition-all duration-200 font-normal tracking-normal whitespace-nowrap hover:bg-accent-color-hover hover:shadow-[0_5px_20px_rgba(151,112,69,0.15)]"
                  onClick={handleCreateProject}
                >
                  {t("general.continue")}
                </button>
              </div>
            </div>

            <div className="bg-primary rounded-lg mx-8 mb-4 p-6 shadow-sm relative z-[2] flex-1 overflow-y-auto">
              <div className="text-lg mb-6 pb-4 border-b border-border-color text-text-dark-color flex items-center gap-3">
                <strong>{t("createProject.projectName")}:</strong>
                <input
                  type="text"
                  value={result.title}
                  onChange={(e) => handleProjectTitleEdit(e.target.value)}
                  className="flex-1 bg-transparent border-none text-lg text-text-dark-color py-1 px-2 border-radius-sm font-inherit font-medium transition-all duration-200 focus:outline-none focus:bg-secondary focus:shadow-[0_0_0_2px_var(--accent-color)] hover:bg-secondary"
                />
              </div>

              {result.boards?.map((board, i) => (
                <div key={i} className="mb-6">
                  <div className="mb-3">
                    <input
                      type="text"
                      value={board.name}
                      onChange={(e) => handleBoardNameEdit(i, e.target.value)}
                      className="w-full bg-transparent border-none text-base font-semibold text-accent-color py-1 px-2 rounded border-radius-sm font-inherit transition-all duration-200 focus:outline-none focus:bg-secondary focus:shadow-[0_0_0_2px_var(--accent-color)] hover:bg-secondary"
                    />
                  </div>
                  <ul className="list-none p-0 m-0 flex flex-col gap-2">
                    {board.tasks?.map((task, j) => (
                      <li
                        key={`${i}-${j}`}
                        className="bg-secondary p-2 rounded-md shadow-sm flex items-center gap-2"
                      >
                        <input
                          type="text"
                          value={task}
                          onChange={(e) => handleTaskEdit(i, j, e.target.value)}
                          className="flex-1 bg-transparent border-none text-sm text-text-dark-color py-1 px-1 rounded border-radius-sm font-inherit focus:outline-none focus:bg-primary"
                        />
                        <button
                          onClick={() => handleRemoveTask(i, j)}
                          className="bg-transparent border-none text-text-color-muted cursor-pointer py-1 px-1.5 rounded border-radius-sm text-xl leading-none transition-all duration-200 w-6 h-6 flex items-center justify-center flex-shrink-0 hover:bg-red-50 hover:text-red-700"
                          type="button"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                    <li className="bg-transparent p-0 shadow-none">
                      <button
                        onClick={() => handleAddTask(i)}
                        className="bg-transparent border border-dashed border-border-color text-text-color-muted cursor-pointer py-3 px-0 rounded-md text-sm w-full transition-all duration-200 font-inherit hover:bg-primary hover:text-text-dark-color hover:border-accent-color"
                        type="button"
                      >
                        + {t("boards.add_task_button")}
                      </button>
                    </li>
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
