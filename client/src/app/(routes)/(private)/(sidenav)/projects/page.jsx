"use client";

import styles from "@/styles/pages/projects.module.css";
import { getProjects } from "@/api/project";
import Image from "next/image";
import { isNotEmpty } from "@/utils/utils";
import { ListTodo, Users, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef, useCallback } from "react";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const elementsRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [rowPositions, setRowPositions] = useState([]);
  const [rowHeight, setRowHeight] = useState(0);

  // Charger les projets en tant que composant client
  useEffect(() => {
    const fetchProjects = async () => {
      const projectData = await getProjects();
      setProjects(projectData);
    };

    fetchProjects();
  }, []);

  // Ajustement dans le calcul des positions de rangée pour tenir compte du pseudo-élément :before
  useEffect(() => {
    if (elementsRef.current && projects.length > 0) {
      // Attendre que le rendu soit complet
      setTimeout(() => {
        const container = elementsRef.current;
        const elements = Array.from(container.querySelectorAll(`.${styles.element}`));

        // Ajouter l'élément de création de projet s'il existe
        const newProjectElement = container.querySelector(`.${styles.newProject}`);
        if (newProjectElement && !elements.includes(newProjectElement)) {
          elements.push(newProjectElement);
        }

        if (elements.length === 0) return;

        // Récupérer toutes les positions Y des éléments
        const positions = elements.map(el => {
          const rect = el.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          // Soustraire 24px (hauteur du :before) pour que le scroll s'aligne au-dessus de l'élément
          return Math.round(rect.top - containerRect.top + container.scrollTop) - 24;
        });

        // Regrouper les éléments par rangée (même position Y à 20px près)
        const rows = [];
        let currentRowPositions = [positions[0]];

        for (let i = 1; i < positions.length; i++) {
          // Si la position est proche de la dernière rangée, ajoutez-la à cette rangée
          if (Math.abs(positions[i] - currentRowPositions[0]) < 20) {
            currentRowPositions.push(positions[i]);
          } else {
            // Sinon, c'est une nouvelle rangée
            rows.push(Math.min(...currentRowPositions)); // Utiliser la position minimale de la rangée
            currentRowPositions = [positions[i]];
          }
        }

        // Ajouter la dernière rangée
        if (currentRowPositions.length > 0) {
          rows.push(Math.min(...currentRowPositions));
        }

        // Calculer la hauteur moyenne d'une rangée
        if (rows.length > 1) {
          const avgRowHeight = Math.round((rows[rows.length - 1] - rows[0]) / (rows.length - 1));
          setRowHeight(avgRowHeight);
          console.log("Hauteur moyenne d'une rangée:", avgRowHeight);
        }

        setRowPositions(rows);
        console.log("Positions des rangées ajustées:", rows);
      }, 500);
    }
  }, [projects]);

  // Gérer le défilement avec la molette de la souris
  const handleWheel = (e) => {
    if (isScrolling || rowPositions.length === 0) return;

    e.preventDefault();
    setIsScrolling(true);

    const container = elementsRef.current;
    const direction = e.deltaY > 0 ? 1 : -1;

    // Trouver la rangée actuelle
    const currentScroll = container.scrollTop;
    let currentRowIndex = 0;

    for (let i = 0; i < rowPositions.length; i++) {
      if (rowPositions[i] > currentScroll) {
        break;
      }
      currentRowIndex = i;
    }

    // Calculer la rangée cible
    const targetRowIndex = Math.max(0, Math.min(rowPositions.length - 1, currentRowIndex + direction));
    const targetPosition = rowPositions[targetRowIndex];

    // Vérifier si nous sommes à la dernière rangée
    const isLastRow = targetRowIndex === rowPositions.length - 1;
    const maxScroll = container.scrollHeight - container.clientHeight;

    // Défiler vers la rangée cible, mais limiter à maxScroll pour la dernière rangée
    console.log(`Défilement: de la rangée ${currentRowIndex} vers ${targetRowIndex}, position: ${targetPosition}`);

    container.scrollTo({
      top: isLastRow ? Math.min(targetPosition, maxScroll) : targetPosition,
      behavior: 'smooth'
    });

    // Réinitialiser l'état de défilement après l'animation
    setTimeout(() => {
      setIsScrolling(false);
    }, 300);
  };

  // Attacher le gestionnaire d'événements wheel
  useEffect(() => {
    const container = elementsRef.current;
    if (container && rowPositions.length > 0) {
      const wheelListener = (e) => handleWheel(e);
      container.addEventListener('wheel', wheelListener, { passive: false });

      return () => {
        container.removeEventListener('wheel', wheelListener);
      };
    }
  }, [rowPositions, isScrolling]);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Vos projets</h1>
          <div className={styles.projectCount}>
            <span>{projects?.length} projets</span>
          </div>
        </div>

        {isNotEmpty(projects) ? (
          <div
            className={styles.elements}
            ref={elementsRef}
          >
            {/* Projets existants */}
            {projects?.map((project) => (
              <div
                key={project?._id}
                className={styles.element}
              >
                <Link href={`/projects/${project?._id}`}>
                  <Image
                    className={styles.logo}
                    src={project?.logo || "/default-project-logo.webp"}
                    alt="project"
                    width={45}
                    height={45}
                    style={{ borderRadius: "50%", cursor: "pointer" }}
                  />
                  <div className={styles.infos}>
                    <div className={styles.name}>
                      <span>{project?.name}</span>
                    </div>
                    <div className={styles.stats}>
                      <span>
                        <ListTodo size={16} />
                        {project?.tasksCount}
                      </span>
                      <span>
                        <Users size={16} />
                        {project?.guests?.length + 1}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}

            {/* Élément pour créer un nouveau projet */}
            <div className={`${styles.element} ${styles.newProject}`}>
              <Link href="/new-project">
                <div className={styles.newProjectContent}>
                  <div className={styles.plusIconWrapper}>
                    <Plus size={30} />
                  </div>
                  <div className={styles.newProjectText}>
                    <span>Créer un nouveau projet</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.empty}>Créez ou sélectionnez un projet.</div>
        )}
      </div>
    </main>
  );
}