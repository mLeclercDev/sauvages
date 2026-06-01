"use client";

import React, { useState, useMemo, useEffect } from "react";
import ProjectsHeader from "./ProjectsHeader";
import ProjectFilters from "./ProjectFilters";
import WorkProjectsGrid from "./WorkProjectsGrid";
import ProjectsTable from "./ProjectsTable";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface ProjetsPageContentProps {
  projects: any[];
}

const ProjetsPageContent: React.FC<ProjetsPageContentProps> = ({
  projects,
}) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeFilterType, setActiveFilterType] = useState<"expertise" | "secteur">("expertise");
  const [activeExpertise, setActiveExpertise] = useState<string>("all");
  const [activeSecteur, setActiveSecteur] = useState<string>("all");

  // Extract unique expertise titles from all projects
  const expertises = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((project) => {
      const attrs = project.attributes || project;
      // Strapi v5: direct array; Strapi v4: wrapped under .data
      const items: any[] = attrs.expertise?.data || attrs.expertise || [];
      items.forEach((item: any) => {
        const titre = item.attributes?.titre || item.attributes?.name || item.titre || item.name;
        if (titre) set.add(titre);
      });
    });
    return Array.from(set).sort();
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
      <ProjectsHeader />
      <ProjectFilters
        currentView={viewMode}
        onViewChange={setViewMode}
        activeFilterType={activeFilterType}
        onFilterTypeChange={setActiveFilterType}
        expertises={expertises}
        secteurs={secteurs}
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
