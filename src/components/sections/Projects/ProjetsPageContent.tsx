"use client";

import React, { useState, useMemo, useEffect } from "react";
import ProjectsHeader from "./ProjectsHeader";
import ProjectFilters from "./ProjectFilters";
import WorkProjectsGrid from "./WorkProjectsGrid";
import ProjectsTable from "./ProjectsTable";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./ProjetsPageContent.module.scss";

const BATCH = 12;

export type Section = "work" | "archives" | "vus_pas_pris";

interface ProjetsPageContentProps {
  projects: any[];
  title?: string | null;
}

const ProjetsPageContent: React.FC<ProjetsPageContentProps> = ({
  projects,
  title,
}) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeSection, setActiveSection] = useState<Section>("work");
  const [activeFilterType, setActiveFilterType] = useState<"expertise" | "secteur">("expertise");
  const [activeExpertise, setActiveExpertise] = useState<string>("all");
  const [activeSecteur, setActiveSecteur] = useState<string>("all");
  const [displayCount, setDisplayCount] = useState(BATCH);

  const handleSectionChange = (section: Section) => {
    setActiveSection(section);
    setViewMode(section === "archives" ? "list" : "grid");
    setActiveExpertise("all");
    setActiveSecteur("all");
  };

  // Projects filtered by Statut (section)
  const sectionProjects = useMemo(() => {
    return projects.filter((project) => {
      const attrs = project.attributes || project;
      const statut = (attrs.Statut || "actif").toLowerCase();
      if (activeSection === "work") return statut === "actif";
      if (activeSection === "archives") return statut === "archive";
      if (activeSection === "vus_pas_pris") return statut === "vus_pas_pris";
      return false;
    });
  }, [projects, activeSection]);

  // Extract unique expertise titles with project counts (from section projects)
  const expertises = useMemo(() => {
    const countMap = new Map<string, number>();
    sectionProjects.forEach((project) => {
      const attrs = project.attributes || project;
      const items: any[] = attrs.expertise?.data || attrs.expertise || [];
      items.forEach((item: any) => {
        const titre = item.attributes?.titre || item.attributes?.name || item.titre || item.name;
        if (titre) countMap.set(titre, (countMap.get(titre) || 0) + 1);
      });
    });
    const ORDER = ["Conseil", "Design", "Activation"];
    return Array.from(countMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => {
        const ia = ORDER.indexOf(a.name);
        const ib = ORDER.indexOf(b.name);
        if (ia !== -1 && ib !== -1) return ia - ib;
        if (ia !== -1) return -1;
        if (ib !== -1) return 1;
        return a.name.localeCompare(b.name);
      });
  }, [sectionProjects]);

  // Extract unique secteurs (from section projects)
  const secteurs = useMemo(() => {
    const set = new Set<string>();
    sectionProjects.forEach((project) => {
      const attrs = project.attributes || project;
      const sector = attrs.sector || attrs.secteur;
      if (sector && typeof sector === "string") set.add(sector);
    });
    return Array.from(set).sort();
  }, [sectionProjects]);

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(BATCH);
  }, [activeSection, activeExpertise, activeSecteur]);

  // Filtering by expertise + secteur within the current section
  const filteredProjects = useMemo(() => {
    return sectionProjects.filter((project) => {
      const attrs = project.attributes || project;

      const expertiseTitres: string[] = (attrs.expertise?.data || attrs.expertise || []).map(
        (item: any) => (item.attributes?.titre || item.attributes?.name || item.titre || item.name || "").toLowerCase()
      );

      const sectorValue = (attrs.sector || attrs.secteur || "").toLowerCase();

      const matchesExpertise =
        activeExpertise === "all" ||
        expertiseTitres.includes(activeExpertise.toLowerCase());

      const matchesSecteur =
        activeSecteur === "all" ||
        sectorValue === activeSecteur.toLowerCase();

      return matchesExpertise && matchesSecteur;
    });
  }, [sectionProjects, activeExpertise, activeSecteur]);

  const visibleProjects = useMemo(
    () => filteredProjects.slice(0, displayCount),
    [filteredProjects, displayCount]
  );
  const hasMore = filteredProjects.length > displayCount;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
      ScrollTrigger.refresh();
    }, 80);

    return () => window.clearTimeout(timer);
  }, [viewMode, visibleProjects.length]);

  return (
    <>
      <ProjectsHeader title={title} />
      <ProjectFilters
        currentView={viewMode}
        onViewChange={setViewMode}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        activeFilterType={activeFilterType}
        onFilterTypeChange={setActiveFilterType}
        expertises={expertises}
        secteurs={secteurs}
        totalCount={sectionProjects.length}
        activeExpertise={activeExpertise}
        activeSecteur={activeSecteur}
        onExpertiseChange={setActiveExpertise}
        onSecteurChange={setActiveSecteur}
      />

      <div className="pb-bottom">
        {viewMode === "grid" ? (
          <div className="container">
            <WorkProjectsGrid projects={visibleProjects} />
          </div>
        ) : (
          <ProjectsTable projects={visibleProjects} />
        )}
        {hasMore && (
          <div className={styles.loadMore}>
            <button
              className={styles.loadMoreBtn}
              onClick={() => setDisplayCount((c) => c + BATCH)}
            >
              Voir plus
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default ProjetsPageContent;
