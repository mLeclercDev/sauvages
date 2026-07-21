"use client";

import React, { useState, useMemo, useEffect } from "react";
import ProjectsHeader from "./ProjectsHeader";
import ProjectFilters from "./ProjectFilters";
import WorkProjectsGrid from "./WorkProjectsGrid";
import ProjectsTable from "./ProjectsTable";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface ProjetsPageContentProps {
  projects: any[];
  title?: string | null;
}

const ProjetsPageContent: React.FC<ProjetsPageContentProps> = ({
  projects,
  title,
}) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeFilterType, setActiveFilterType] = useState<"expertise" | "secteur">("expertise");
  const [activeExpertise, setActiveExpertise] = useState<string>("all");
  const [activeSecteur, setActiveSecteur] = useState<string>("all");

  // Extract unique expertise titles with project counts
  const expertises = useMemo(() => {
    const countMap = new Map<string, number>();
    projects.forEach((project) => {
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
  }, [projects]);

  // Extract unique secteurs from all projects
  // sector is a plain string field on the project: attrs.sector
  const secteurs = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((project) => {
      const attrs = project.attributes || project;
      const sector = attrs.sector || attrs.secteur;
      if (sector && typeof sector === "string") set.add(sector);
    });
    return Array.from(set).sort();
  }, [projects]);

  // Filtering logic
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const attrs = project.attributes || project;

      // expertise = relation array (v5: direct array, v4: wrapped under .data)
      const expertiseTitres: string[] = (attrs.expertise?.data || attrs.expertise || []).map(
        (item: any) => (item.attributes?.titre || item.attributes?.name || item.titre || item.name || "").toLowerCase()
      );

      // sector = plain string
      const sectorValue = (attrs.sector || attrs.secteur || "").toLowerCase();

      const matchesExpertise =
        activeExpertise === "all" ||
        expertiseTitres.includes(activeExpertise.toLowerCase());

      const matchesSecteur =
        activeSecteur === "all" ||
        sectorValue === activeSecteur.toLowerCase();

      return matchesExpertise && matchesSecteur;
    });
  }, [projects, activeExpertise, activeSecteur]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
      ScrollTrigger.refresh();
    }, 80);

    return () => window.clearTimeout(timer);
  }, [viewMode, filteredProjects.length]);

  return (
    <>
      <ProjectsHeader title={title} />
      <ProjectFilters
        currentView={viewMode}
        onViewChange={setViewMode}
        activeFilterType={activeFilterType}
        onFilterTypeChange={setActiveFilterType}
        expertises={expertises}
        secteurs={secteurs}
        totalCount={projects.length}
        activeExpertise={activeExpertise}
        activeSecteur={activeSecteur}
        onExpertiseChange={setActiveExpertise}
        onSecteurChange={setActiveSecteur}
      />

      <div className="pb-bottom">
        {viewMode === "grid" ? (
          <div className="container">
            <WorkProjectsGrid projects={filteredProjects} />
          </div>
        ) : (
          <ProjectsTable projects={filteredProjects} />
        )}
      </div>
    </>
  );
};

export default ProjetsPageContent;
