"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveProject } from "@/actions/project";
import { createBoard } from "@/actions/board";
import { saveTask } from "@/actions/task";
import { MessageSquare, Smartphone, ShoppingCart, Globe, TrendingUp, Zap, Palette, Calendar, Share2 } from "lucide-react";

const PREDEFINED_PROMPTS = [
  {
    id: "communication-plan",
    title: "Création d'un plan de communication",
    icon: MessageSquare,
    prompt: `Je souhaite créer un plan de communication complet pour mon entreprise. J'ai besoin d'organiser mes actions de communication sur plusieurs canaux (réseaux sociaux, email marketing, relations presse, événements).

Propose-moi une structure de projet complète et détaillée qui couvre TOUS les aspects d'un plan de communication professionnel. N'hésite pas à inclure des éléments auxquels je n'aurais pas pensé : stratégie, création, production, diffusion, mesure, optimisation, gestion d'équipe, budget, outils, formation, veille, etc.

Sois créatif et pense à toutes les bonnes pratiques et étapes essentielles pour un plan de communication réussi.`
  },
  {
    id: "mobile-app",
    title: "Création d'une application mobile",
    icon: Smartphone,
    prompt: `Je veux développer une application mobile native pour iOS et Android. Le projet nécessite une approche structurée depuis la conception jusqu'au déploiement.

Crée-moi une structure de projet COMPLÈTE qui couvre absolument TOUS les aspects du développement d'une app mobile professionnelle. Pense à tout : recherche utilisateur, architecture technique, design system, développement, tests, sécurité, performance, déploiement, marketing, analytics, maintenance, évolutions, gestion d'équipe, documentation, formation, support utilisateur, etc.

Sois exhaustif et propose des tâches détaillées que même un développeur expérimenté pourrait oublier. Inclus les bonnes pratiques, les outils modernes, et tous les aspects business et techniques.`
  },
  {
    id: "woocommerce-site",
    title: "Création d'un site WordPress WooCommerce",
    icon: ShoppingCart,
    prompt: `Je veux créer un site e-commerce complet avec WordPress et WooCommerce. Le projet doit couvrir tous les aspects techniques et business d'une boutique en ligne professionnelle.

Propose-moi une structure de projet EXHAUSTIVE qui couvre ABSOLUMENT TOUS les aspects d'un e-commerce professionnel. Pense à tout : stratégie business, UX/UI, développement, sécurité, paiements, logistique, SEO, marketing, analytics, juridique, RGPD, performance, maintenance, support client, formation, évolutions, etc.

Sois très détaillé et inclus des tâches auxquelles on ne pense pas toujours : tests utilisateurs, optimisation conversion, gestion des retours, emails automatiques, cross-selling, fidélisation, etc. Pense comme un expert e-commerce qui ne laisse rien au hasard.`
  },
  {
    id: "wordpress-showcase",
    title: "Création d'un site WordPress vitrine",
    icon: Globe,
    prompt: `Je souhaite créer un site vitrine professionnel avec WordPress pour présenter mon entreprise et ses services. Le site doit être moderne, optimisé et facile à maintenir.

Le projet doit comprendre :
- L'analyse des besoins et définition de l'arborescence
- Le choix et personnalisation du thème WordPress
- La création du contenu (textes, images, vidéos)
- L'optimisation SEO on-page et technique
- L'intégration des réseaux sociaux
- La mise en place d'un formulaire de contact
- La configuration des outils d'analytics
- L'optimisation des performances (vitesse, mobile)
- La sécurisation du site (SSL, sauvegardes, mises à jour)
- Les tests multi-navigateurs et responsive
- La formation à l'administration WordPress
- La stratégie de référencement naturel
- La mise en ligne et configuration de l'hébergement

Peux-tu me créer une structure de projet avec des tableaux organisés par phases et des tâches spécifiques pour chaque étape de création ?`
  },
  {
    id: "marketing-plan",
    title: "Plan marketing",
    icon: TrendingUp,
    prompt: `Je veux élaborer un plan marketing complet pour développer mon activité. J'ai besoin d'une stratégie structurée couvrant tous les aspects du marketing digital et traditionnel.

Le plan doit inclure :
- L'analyse de marché et étude de la concurrence
- La définition des personas et segments cibles
- La stratégie de positionnement et proposition de valeur
- Le marketing digital (SEO, SEA, réseaux sociaux, email)
- Les actions marketing traditionnelles (print, radio, événements)
- La stratégie de contenu et storytelling
- Le plan de communication et relations publiques
- La gestion du budget marketing et ROI
- Les partenariats et collaborations stratégiques
- Le marketing d'influence et ambassadeurs
- L'analyse des performances et KPIs
- L'optimisation continue des campagnes
- La planification des actions sur 12 mois

Peux-tu me proposer une organisation en tableaux thématiques avec des tâches détaillées pour structurer efficacement ce plan marketing ?`
  },
  {
    id: "landing-page",
    title: "Création d'une landing page",
    icon: Zap,
    prompt: `Je veux créer une landing page haute conversion pour promouvoir un produit ou service spécifique. La page doit être optimisée pour transformer les visiteurs en prospects ou clients.

Le projet doit couvrir :
- L'analyse de l'audience cible et leurs besoins
- La définition de l'objectif de conversion (vente, lead, inscription)
- La conception UX/UI orientée conversion
- La rédaction de contenus persuasifs (headlines, CTA, témoignages)
- L'intégration d'éléments de réassurance (garanties, certifications)
- La mise en place du tracking et analytics
- L'optimisation SEO et SEA pour le trafic payant
- Les tests A/B sur les éléments clés
- L'intégration avec les outils CRM et email marketing
- L'optimisation mobile et vitesse de chargement
- La mise en place de formulaires optimisés
- L'analyse des performances et taux de conversion
- L'optimisation continue basée sur les données

Peux-tu me créer une structure de projet avec des tableaux organisés par phases (conception, développement, optimisation) et des tâches spécifiques pour maximiser les conversions ?`
  },
  {
    id: "brand-identity",
    title: "Création d'une identité de marque",
    icon: Palette,
    prompt: `Je souhaite créer une identité de marque complète et cohérente pour mon entreprise. Le projet doit couvrir tous les aspects visuels et conceptuels de la marque.

Le projet doit inclure :
- La définition de la stratégie de marque et positionnement
- La création du logo et ses déclinaisons
- La définition de la charte graphique (couleurs, typographies, styles)
- La création des supports de communication (cartes de visite, papeterie)
- Le développement de l'identité visuelle digitale (réseaux sociaux, site web)
- La définition du ton et de la personnalité de marque
- La création d'un guide de style et brand book
- Les applications sur différents supports (packaging, signalétique)
- La protection juridique de la marque (dépôt de marque, droits d'auteur)
- La stratégie de déploiement de l'identité
- Les tests et validations auprès des cibles
- La formation des équipes à l'utilisation de l'identité
- Le suivi et l'évolution de l'image de marque

Peux-tu me proposer une structure de projet avec des tableaux organisés par phases créatives et des tâches détaillées pour développer une identité de marque forte et mémorable ?`
  },
  {
    id: "product-launch-planning",
    title: "Rétro-planning de lancement de produit",
    icon: Calendar,
    prompt: `Je veux créer un rétro-planning détaillé pour le lancement d'un nouveau produit. Le projet doit organiser toutes les étapes depuis la conception jusqu'au lancement commercial.

Le projet doit couvrir :
- La phase de développement produit et tests
- L'étude de marché et analyse concurrentielle
- La définition de la stratégie de prix et positionnement
- La création des supports marketing et communication
- La préparation des canaux de distribution
- La formation des équipes commerciales
- La mise en place des outils de suivi et analytics
- La planification des campagnes publicitaires
- L'organisation des événements de lancement
- La gestion des relations presse et influenceurs
- La préparation du service client et support
- Les tests utilisateurs et ajustements finaux
- Le suivi post-lancement et optimisations
- La planification des mises à jour et évolutions

Peux-tu me créer une structure de projet avec des tableaux chronologiques et des tâches avec des échéances pour orchestrer efficacement ce lancement de produit ?`
  },
  {
    id: "social-media-planning",
    title: "Planning de publication sociale",
    icon: Share2,
    prompt: `Je veux organiser un planning de publication pour les réseaux sociaux de mon entreprise. Le projet doit structurer la création et la diffusion de contenu sur plusieurs plateformes.

Le projet doit inclure :
- L'audit et analyse des réseaux sociaux existants
- La définition de la stratégie de contenu par plateforme
- La création d'un calendrier éditorial mensuel
- La planification des types de contenus (posts, stories, vidéos, lives)
- La gestion des visuels et créations graphiques
- La rédaction des textes et captions
- La programmation et planification des publications
- L'engagement et gestion de la communauté
- Le suivi des performances et analytics
- La gestion des campagnes publicitaires sociales
- La veille concurrentielle et tendances
- La création de contenus saisonniers et événementiels
- La gestion des collaborations et partenariats
- L'optimisation continue basée sur les résultats

Peux-tu me proposer une organisation en tableaux thématiques avec des tâches récurrentes pour maintenir une présence sociale active et engageante ?`
  }
];

export default function IAProjectStep({ onComplete }) {
  const [prompt, setPrompt] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();

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
      if (!res.ok) throw new Error("Erreur lors de la génération IA");
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
      type: 'ia',
      title: result.title,
      boards: result.boards,
      skipDefaultBoard: true
    });
  };

  return (
    <div className="grid grid-cols-[1fr_2fr] gap-8 h-full max-w-[1200px] mx-auto lg:grid-cols-[1fr_1.5fr] md:grid-cols-1 md:gap-6">
      {/* Colonne de gauche - Prompts prédéfinis */}
      <div className="bg-secondary rounded-xl shadow-small p-6 flex flex-col overflow-hidden">
                 <h3 className="text-xl font-semibold mb-6 text-gray-900 m-0">Prompts suggérés</h3>
        <div className="flex flex-col gap-3 overflow-y-auto flex-1 p-1">
          {PREDEFINED_PROMPTS.map((predefinedPrompt) => {
            const IconComponent = predefinedPrompt.icon;
            return (
              <button
                key={predefinedPrompt.id}
                className={`bg-primary rounded-lg p-4 cursor-pointer transition-all duration-200 text-left w-full shadow-small border-none hover:bg-secondary hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] ${
                  selectedPrompt?.id === predefinedPrompt.id ? "bg-secondary shadow-[0_0_0_2px_var(--accent-color)]" : ""
                }`}
                onClick={() => handlePromptSelect(predefinedPrompt)}
                type="button"
              >
                <div className="w-full">
                  <div className="flex items-center gap-3">
                    <IconComponent size={20} className="text-accent flex-shrink-0" />
                                         <h4 className="text-base font-semibold m-0 text-gray-900 leading-tight">{predefinedPrompt.title}</h4>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Colonne de droite - Formulaire et résultats */}
      <div className="bg-secondary rounded-xl shadow-small p-8 overflow-y-auto flex flex-col gap-8 relative z-1">
        <div className="flex flex-col gap-4 flex-1 min-h-0">
                     <h3 className="text-xl font-semibold m-0 text-gray-900">Décrivez votre projet</h3>
          <p className="text-[0.95rem] text-text-muted m-0 leading-relaxed">L'IA vous proposera une structure de projet complète avec de nombreux tableaux et tâches détaillées. Plus votre description est précise, plus l'IA pourra vous suggérer des éléments pertinents et créatifs auxquels vous n'auriez pas pensé. N'hésitez pas à mentionner vos objectifs, contraintes et attentes.</p>
          
          <div className="relative flex-1 flex flex-col">
            <textarea
              className="w-full p-4 rounded-lg bg-primary text-text-dark text-[0.95rem] leading-relaxed resize-none flex-1 min-h-[200px] shadow-small font-inherit border border-border focus:outline-none focus:shadow-[0_0_0_2px_var(--accent-color)] disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Décrivez votre projet ici ou sélectionnez un prompt suggéré..."
              rows={8}
              disabled={loading}
            />
            
            {loading && (
              <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/90 flex flex-col justify-center items-center gap-4 rounded-lg z-10">
                <div className="w-10 h-10 border-[3px] border-gray-300 border-t-accent rounded-full animate-spin"></div>
                <p className="m-0 text-text-dark text-[0.95rem]">Génération en cours...</p>
              </div>
            )}
          </div>
          
          <button
            className="bg-accent text-white border-none rounded-lg py-3 px-6 text-base cursor-pointer transition-all duration-200 font-normal self-end tracking-normal hover:bg-accent-hover hover:shadow-[0_5px_20px_rgba(151,112,69,0.15)] disabled:bg-accent-hover disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
          >
            {loading ? "Génération..." : "Générer avec l'IA"}
          </button>
          
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mt-4 text-sm shadow-small">{error}</div>}
        </div>

        {showResults && result && (
          <div className="absolute top-0 left-0 right-0 bottom-0 bg-secondary rounded-xl z-[5] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center py-8 px-8 pb-4 bg-secondary sticky top-0 z-10">
              <h3 className="text-xl font-semibold m-0 text-text-dark">Suggestions IA</h3>
              <div className="flex gap-4 items-center">
                <button
                  className="bg-transparent text-text-muted border border-border rounded-lg py-2 px-4 text-sm cursor-pointer transition-all duration-200 font-normal tracking-normal hover:bg-primary hover:text-text-dark hover:border-accent"
                  onClick={handleModifyPrompt}
                  type="button"
                >
                  Modifier le prompt
                </button>
                <button
                  className="bg-accent text-white border-none rounded-lg py-3 px-6 text-base cursor-pointer transition-all duration-200 font-normal tracking-normal whitespace-nowrap hover:bg-accent-hover hover:shadow-[0_5px_20px_rgba(151,112,69,0.15)] disabled:bg-accent-hover disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
                  onClick={handleCreateProject}
                >
                  Continuer
                </button>
              </div>
            </div>
            
            <div className="bg-primary rounded-lg mx-8 mb-8 p-6 shadow-small relative z-2 flex-1 overflow-y-auto">
              <div className="text-lg mb-6 pb-4 border-b border-border text-text-dark flex items-center gap-3">
                <strong>Nom du projet :</strong>
                <input
                  type="text"
                  value={result.title}
                  onChange={(e) => handleProjectTitleEdit(e.target.value)}
                  className="bg-transparent border-none text-lg text-text-dark py-1 px-2 rounded flex-1 font-inherit font-medium transition-all duration-200 focus:outline-none focus:bg-secondary focus:shadow-[0_0_0_2px_var(--accent-color)] hover:bg-secondary"
                />
              </div>
              
              {result.boards?.map((board, i) => (
                <div key={i} className="mb-6">
                  <div className="mb-3">
                    <input
                      type="text"
                      value={board.name}
                      onChange={(e) => handleBoardNameEdit(i, e.target.value)}
                      className="bg-transparent border-none text-base font-semibold text-accent py-1 px-2 rounded w-full font-inherit transition-all duration-200 focus:outline-none focus:bg-secondary focus:shadow-[0_0_0_2px_var(--accent-color)] hover:bg-secondary"
                    />
                  </div>
                  <ul className="list-none p-0 m-0 flex flex-col gap-2">
                    {board.tasks?.map((task, j) => (
                      <li key={`${i}-${j}`} className="bg-secondary p-2 rounded-md shadow-small flex items-center gap-2">
                        <input
                          type="text"
                          value={task}
                          onChange={(e) => handleTaskEdit(i, j, e.target.value)}
                          className="flex-1 bg-transparent border-none text-sm text-text-dark py-1 px-1 rounded font-inherit focus:outline-none focus:bg-primary"
                        />
                        <button
                          onClick={() => handleRemoveTask(i, j)}
                          className="bg-transparent border-none text-text-muted cursor-pointer py-1 px-1 rounded text-xl leading-none transition-all duration-200 w-6 h-6 flex items-center justify-center hover:bg-red-50 hover:text-red-600"
                          type="button"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                    <li className="bg-transparent p-0 shadow-none">
                      <button
                        onClick={() => handleAddTask(i)}
                        className="bg-transparent border border-dashed border-border text-text-muted cursor-pointer py-3 px-3 rounded-md text-sm w-full transition-all duration-200 font-inherit hover:bg-primary hover:text-text-dark hover:border-accent"
                        type="button"
                      >
                        + Ajouter une tâche
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