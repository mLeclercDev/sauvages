import React from "react";
import { fetchAPI } from "@/utils/strapi";
import LogoSliderClient from "./LogoSliderClient";

interface LogoSliderProps {
  pt?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  pb?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
}

const LogoSlider: React.FC<LogoSliderProps> = async ({ 
  pt = "lg", 
  pb = "lg" 
}) => {
  let carouselData = null;

  try {
    const response = await fetchAPI("/carousel-de-logo", {
      populate: "*",
    }, {}, "local");
    
    carouselData = response?.data?.attributes || response?.data || null;
  } catch (error) {
    console.error("Failed to fetch carousel-de-logo data:", error);
  }

  return <LogoSliderClient pt={pt} pb={pb} data={carouselData} />;
};

export default LogoSlider;
