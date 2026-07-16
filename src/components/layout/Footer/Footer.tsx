"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Footer.module.scss";
import Button from "@/components/ui/Button/Button";
import Image from "next/image";
import { getStrapiMedia } from "@/utils/strapi";
import TransitionLink from "@/components/ui/TransitionLink/TransitionLink";

interface FooterProps {
  data?: any;
}

const normalizeInternalHref = (href: string) => {
  if (!href) return "#";
  if (href.startsWith("#") || href.startsWith("/")) return href;
  return `/${href}`;
};

const isExternalHref = (href: string) =>
  /^https?:\/\//i.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");

const Footer: React.FC<FooterProps> = ({ data }) => {
  const footerContent = data?.attributes || data || {};

  const [time, setTime] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [temperature, setTemperature] = useState<number | null>(null);
  const pathname = usePathname();
  const footerRef = useRef<HTMLElement>(null);
  const footerInnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("fr-FR", {
          second: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );

      // Check if open (French time: Mon-Fri, 9:30-18:00)
      try {
        const parisNow = new Intl.DateTimeFormat("en-US", {
          timeZone: "Europe/Paris",
          hour: "numeric",
          minute: "numeric",
          weekday: "short",
          hour12: false,
        })
          .formatToParts(now)
          .reduce((acc, part) => {
            acc[part.type] = part.value;
            return acc;
          }, {} as any);

        const hours = parseInt(parisNow.hour);
        const minutes = parseInt(parisNow.minute);
        const day = parisNow.weekday; // Mon, Tue, Wed, Thu, Fri, Sat, Sun

        const currentTimeInMinutes = hours * 60 + minutes;
        const openTimeInMinutes = 9 * 60 + 30; // 09:30
        const closeTimeInMinutes = 18 * 60; // 18:00

        const isWorkingDay = ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(day);
        const isWorkingHours =
          currentTimeInMinutes >= openTimeInMinutes &&
          currentTimeInMinutes < closeTimeInMinutes;

        setIsOpen(isWorkingDay && isWorkingHours);
      } catch (e) {
        console.error("Error calculating Paris time:", e);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Météo de Rennes (Open-Meteo, sans clé API), rafraîchie toutes les 3 heures
    const updateTemperature = async () => {
      try {
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=48.1173&longitude=-1.6778&current=temperature_2m&timezone=Europe%2FParis"
        );
        const json = await res.json();
        const temp = json?.current?.temperature_2m;
        if (typeof temp === "number") {
          setTemperature(Math.round(temp));
        }
      } catch (e) {
        console.error("Error fetching Rennes weather:", e);
      }
    };

    updateTemperature();
    const weatherInterval = setInterval(updateTemperature, 1000 * 60 * 60 * 3);

    // Parallax Footer Reveal
    gsap.registerPlugin(ScrollTrigger);

    // We use a matchMedia to avoid weird behaviors on very small screens if desired,
    // but a smooth parallax footer is usually fine everywhere.
    const mm = gsap.matchMedia();

    const initScrollTrigger = () => {
      mm.add("(min-width: 768px)", () => {
        if (!footerInnerRef.current || !footerRef.current) return;

        // Reset state and clear props to avoid stuck transforms
        gsap.set(footerInnerRef.current, { yPercent: 0, clearProps: "all" });

        gsap.fromTo(
          footerInnerRef.current,
          { yPercent: -40 },
          {
            yPercent: 0,
            ease: "none",
            scrollTrigger: {
              trigger: footerRef.current,
              start: "top bottom",
              end: "bottom bottom",
              scrub: true,
            },
          }
        );
      });

      mm.add("all", () => {
        if (!footerRef.current || !footerInnerRef.current) return;

        const desktopPaths = footerInnerRef.current.querySelectorAll(
          `.${styles.headlineDesktop} path`
        );
        const responsivePaths = footerInnerRef.current.querySelectorAll(
          `.${styles.headlineResponsive} path`
        );

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top bottom",
            end: "bottom bottom",
            scrub: true,
          },
        });

        if (desktopPaths.length > 0) {
          tl.fromTo(
            desktopPaths,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              stagger: 0.1,
              duration: 1,
              ease: "power2.out",
            },
            0
          );
        }

        if (responsivePaths.length > 0) {
          tl.fromTo(
            responsivePaths,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              stagger: 0.1,
              duration: 1,
              ease: "power2.out",
            },
            0
          );
        }
      });

      // Force a refresh after creation
      ScrollTrigger.refresh();
    };

    // Small delay to wait for Next.js DOM swap and SmoothScroll top reset
    const timeout = setTimeout(initScrollTrigger, 150);

    return () => {
      clearInterval(interval);
      clearInterval(weatherInterval);
      clearTimeout(timeout);
      mm.revert();
    };
  }, [pathname]); // Refresh on route change

  const renderFooterLink = (
    href: string | undefined,
    label: React.ReactNode,
    target?: string,
    rel?: string
  ) => {
    const finalHref = href || "#";

    if (target === "_blank" || isExternalHref(finalHref) || finalHref.startsWith("#")) {
      return (
        <Link href={finalHref} target={target} rel={rel}>
          {label}
        </Link>
      );
    }

    return <TransitionLink href={normalizeInternalHref(finalHref)}>{label}</TransitionLink>;
  };

  return (
    <footer ref={footerRef} className={styles.footer}>
      <div ref={footerInnerRef} className={styles.footerInner}>
        <div className="container">
          <div className={styles.footerCta}>
            <div className={styles.ctaLeft}>
              <div className="label">{footerContent.Label || "contact"}</div>
              <h3
                className={styles.ctaTitle}
                dangerouslySetInnerHTML={{
                  __html:
                    footerContent.Titre?.Texte?.replace(/\n/g, "<br />") ||
                    "On prend un <br /> café ensemble ?",
                }}
              />
            </div>
            <Button
              label={footerContent.Bouton?.Texte || "nous contacter"}
              href={footerContent.Bouton?.Url || "/contact"}
              variant="outline"
              color="white"
              target={footerContent.Bouton?.Blank ? "_blank" : undefined}
              icon={
                footerContent.Bouton?.Icone ? (
                  <div className={styles.buttonIcon}>
                    <Image
                      src={
                        getStrapiMedia(footerContent.Bouton.Icone, undefined) ||
                        ""
                      }
                      alt={footerContent.Bouton.Texte || "icon"}
                      width={18}
                      height={15}
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="15"
                    viewBox="0 0 18 15"
                    fill="none"
                  >
                    <path
                      d="M6.92191 4.06698V1.75C6.92191 1.19772 7.36962 0.75 7.92191 0.75H15.75C16.3023 0.75 16.75 1.19771 16.75 1.75V8.24395C16.75 8.5832 16.475 8.85823 16.1357 8.85823H16.0374C15.7524 8.85823 15.5214 9.08924 15.5214 9.3742C15.5214 9.84481 14.943 10.0698 14.6251 9.7228L14.2102 9.27009C14.0672 9.11409 13.8654 9.02526 13.6537 9.02526H11.0857M10.2711 5.80411V11.5437C10.2711 12.0959 9.82334 12.5437 9.27105 12.5437H4.03304C3.8003 12.5437 3.57824 12.6413 3.42097 12.8129L2.87503 13.4084C2.557 13.7554 1.97856 13.5304 1.97856 13.0597C1.97856 12.7747 1.74751 12.5437 1.4625 12.5437H1.36428C1.02502 12.5437 0.75 12.2686 0.75 11.9294V5.80411C0.75 5.25183 1.19771 4.80411 1.75 4.80411H9.27105C9.82334 4.80411 10.2711 5.25183 10.2711 5.80411Z"
                      stroke="#F6F6F6"
                      strokeWidth="1.5"
                      strokeMiterlimit="10"
                    />
                  </svg>
                )
              }
            />
          </div>
          <div className={styles.wrapperContainer}>
            <div className={styles.top}>
              <div className={styles.navGroup}>
                <span className={styles.label}>
                  {footerContent.Label2 || "L'agence"}
                </span>
                <p
                  dangerouslySetInnerHTML={{
                    __html:
                      footerContent.Adresse?.replace(/\n/g, "<br />") ||
                      "2 rue de la Mabilais <br></br>35000 Rennes",
                  }}
                />
              </div>

              {footerContent.Item?.map((group: any) => (
                <div key={group.id} className={styles.navGroup}>
                  <span className={styles.label}>{group.Label}</span>
                  <ul>
                    {group.Item?.map((item: any) => (
                      <li key={item.id}>
                        {renderFooterLink(
                          item.URL,
                          item.Texte,
                          item.Blank ? "_blank" : undefined,
                          item.Blank ? "noopener noreferrer" : undefined
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {!footerContent.Item && (
                <>
                  <div className={styles.navGroup}>
                    <span className={styles.label}>Connecter</span>
                    <ul>
                      <li>
                        <a
                          href="https://instagram.com"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Instagram
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://tiktok.com"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Tiktok
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://linkedin.com"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          LinkedIn
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div className={styles.navGroup}>
                    <span className={styles.label}>Navigation</span>
                    <ul>
                      <li>{renderFooterLink("/agence", "Agence")}</li>
                      <li>{renderFooterLink("/expertises", "Expertises")}</li>
                      <li>{renderFooterLink("/work", "Work")}</li>
                      <li>{renderFooterLink("/manifeste", "Manifeste")}</li>
                      <li>{renderFooterLink("/blog", "Blog")}</li>
                      <li>
                        {renderFooterLink("/les-vus-pas-pris", "Vu pas pris")}
                      </li>
                    </ul>
                  </div>
                </>
              )}
              <div className={styles.meta}>
                <div className={styles.metaItem}>©Sauvages</div>
                <div className={styles.metaItem}>{time}</div>
                <div className={styles.metaItem}>
                  Rennes {temperature !== null ? `${temperature}°C` : "—"}
                </div>
                <div
                  className={`${styles.metaItem} ${styles.schedules} ${!isOpen ? styles.closed : ""}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <circle
                      cx="6"
                      cy="6"
                      r="6"
                      fill={isOpen ? "#96E91E" : "#f22d19"}
                    />
                  </svg>
                  <span>{isOpen ? "Ouvert" : "Fermé"}</span>
                </div>
              </div>
            </div>

            <div className={styles.headline}>
              <svg
                className={styles.headlineDesktop}
                width="1769"
                height="203"
                viewBox="0 0 1769 203"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1291.8 140.008V127.871L1233.01 127.983L1232.97 87.5628L1346.12 87.5323L1346.16 166.362C1337.41 174.893 1327.52 181.088 1316.69 186.319C1286.08 200.516 1247.5 205.513 1214.36 200.659C1195.29 197.866 1177.3 191.691 1161.39 180.987C1155.38 176.945 1150.51 172.517 1145.52 167.266C1131.32 152.296 1123.05 132.919 1121.53 112.252C1120.48 97.9929 1121.46 83.541 1125.61 69.8814C1132.64 46.7768 1148.1 27.7853 1169.16 15.9435C1185.73 6.6306 1204.06 1.84718 1223.03 0.364427C1229.32 -0.123055 1245.43 -0.133211 1251.59 0.40505C1275.98 2.52763 1299.05 9.11879 1318.51 24.4339C1333.91 36.5498 1345.16 55.1147 1345.76 75.2843H1278.93C1277.74 74.5937 1277.98 72.5321 1277.4 71.5063C1274.06 65.5956 1268.8 61.2184 1262.19 58.6185C1247.31 52.7687 1230.2 52.2406 1215.23 57.8162C1200.26 63.3918 1189.72 77.285 1187.77 93.504C1185.54 111.988 1190.34 129.72 1207.02 139.876C1229.29 153.424 1267.92 150.052 1291.81 139.998L1291.8 140.008Z"
                  fill="#F6F6F6"
                />
                <path
                  d="M1651.64 202.03C1628.26 200.841 1598.54 196.424 1580.61 180.164C1574.03 174.152 1568.76 167.439 1565.64 159.06C1562.52 150.702 1560.55 142.252 1560.46 133.173L1625.92 133.203C1627.03 149.25 1643.96 152.794 1656.82 153.759C1667.14 154.856 1677.28 154.46 1687.59 153.21C1693.65 152.479 1701.58 150.509 1702.38 143.745C1702.87 139.673 1701.26 135.884 1697.49 133.762C1689.04 129.009 1676.47 127.882 1666.64 126.541L1636.71 122.458C1624.72 120.823 1605.24 115.42 1594.41 109.885C1587.37 106.29 1580.48 101.09 1575.16 95.1289C1567.09 86.08 1563.56 74.4516 1563.31 62.3661C1562.82 39.2615 1575.35 22.6058 1595.42 12.6734C1598.43 11.1805 1601.07 9.8399 1604.26 8.69228C1628.17 0.059788 1649.42 -0.701903 1674.55 0.384775C1677.88 0.526957 1680.96 0.96366 1684.27 1.31912C1699.76 2.96437 1714.71 6.72204 1728.46 13.953C1735.09 17.924 1741.21 21.8949 1746.41 27.5213C1756.55 38.4998 1762.08 52.1797 1762.45 67.2003H1697.14C1697.13 60.7919 1693.72 55.9882 1688.42 52.8805C1682.83 50.2197 1676.86 49.3056 1670.57 48.4221C1658.79 48.4627 1648.45 47.0713 1637.22 50.8392C1634.1 51.8852 1630.77 54.0789 1630.19 57.3186C1629.61 60.5583 1630.62 63.6863 1633.34 65.4433C1638.17 68.5815 1643.64 69.7697 1649.42 70.7244L1692.45 77.8436C1706.16 80.1084 1719.29 83.0536 1732.19 88.03C1747.22 93.829 1762.08 105.021 1766.54 121.158C1770.62 135.915 1769.91 154.307 1762.22 167.896C1754.88 180.875 1741.96 189.629 1727.85 194.352C1704.4 202.182 1676.33 203.269 1651.65 202.02L1651.64 202.03Z"
                  fill="#F6F6F6"
                />
                <path
                  d="M1535.64 124.194L1434.15 124.225L1434.1 147.482L1540.16 147.451L1540.23 198.058L1369.66 198.038L1369.62 3.94883L1540.21 3.9082L1540.22 54.0071L1434.08 54.0985L1434.12 77.3657L1535.57 77.3555L1535.64 124.194Z"
                  fill="#F6F6F6"
                />
                <path
                  d="M1054.91 193.568L1044.3 163.009H963.486L951.471 198.057L882.137 198.017L927.371 85.9974L952.395 24.2598L960.713 3.82617L1047.05 3.8668L1062.4 41.7787L1072.94 67.8387L1122.41 190.278C1123.5 192.969 1124.71 195.061 1125.21 198.027L1056.85 198.078C1055.61 196.798 1056.09 195.122 1054.91 193.558V193.568ZM1027.55 114.637L1004.03 46.5418C1002.14 50.137 1001.27 53.59 1000.03 57.1242L993.313 76.3188L980.222 114.789L1027.55 114.637Z"
                  fill="#F6F6F6"
                />
                <path
                  d="M593.7 3.93008L658.261 3.86914L658.038 111.521C657.388 125.679 655.052 138.922 649.994 151.982C642.936 170.222 629.175 184.4 611.3 192.423C590.582 201.716 565.122 203.544 542.626 202.051C517.836 200.406 493.391 193.825 475.933 175.31C469.656 168.648 465.218 161.275 461.928 152.856C457.805 142.294 453.844 126.319 453.803 115.167L453.438 3.86914L517.998 3.94023C517.724 7.20027 517.42 9.48534 517.917 12.4001L518.141 108.119C518.151 113.674 519.532 118.6 520.944 123.759C522.538 129.558 525.656 134.921 529.942 139.024C539.671 148.336 556.946 149.027 569.113 145.808C580.559 142.771 588.399 133.001 591.243 121.748C592.928 115.066 592.847 112.994 593.71 106.19L593.69 3.9707L593.7 3.93008Z"
                  fill="#F6F6F6"
                />
                <path
                  d="M203.816 163.822C197.742 178.05 183.616 188.602 169.204 193.7C145.115 202.221 116.16 203.359 90.6792 202.028C76.8469 201.307 63.4919 199.56 50.1776 195.833C27.5198 189.486 8.87365 175.389 2.72934 151.889C1.1044 145.683 -0.246326 139.702 0.0380382 133.161L65.2286 133.192C66.8332 145.165 75.5774 150.528 86.9418 152.508C101.444 155.037 116.14 155.006 130.643 152.559C133.943 152 137.163 150.903 139.529 148.679C141.895 146.455 142.515 143.114 141.855 140.077C140.006 131.699 125.747 129.302 118.131 128.256L76.6438 122.528C64.3958 120.842 52.8689 117.805 41.4435 113.225C16.6023 103.262 1.50048 85.7332 2.88168 57.8757C3.38948 47.7096 6.55811 38.2342 12.9563 30.1501C29.3073 9.51338 58.0078 2.5566 83.1435 0.444182C88.7293 -0.0229879 93.99 0.0481033 99.657 0.00747979C114.312 -0.094079 128.53 1.19572 142.779 4.56747C157.028 7.93922 171.997 14.378 182.316 24.0769C183.9 25.5597 185.738 26.7073 186.774 28.7588C196.503 38.6201 201.531 53.7828 202.13 67.1988H136.553C137.173 46.0542 101.343 47.6182 87.6527 48.6135C81.0616 49.0908 69.555 51.1626 69.3925 59.1655C69.23 67.1683 82.1686 69.6463 88.4855 70.6924L131.932 77.8624C144.891 80.0053 165.823 84.8395 177.36 90.5065C187.942 95.7063 198.342 103.638 203.48 114.576C210.072 128.632 209.909 149.553 203.805 163.822H203.816Z"
                  fill="#F6F6F6"
                />
                <path
                  d="M324.853 162.932L291.745 163.044L287.398 175.789L279.669 198.051H210.427L237.35 131.246L248.4 104.16L281.883 21.0138L288.952 3.88086L375.419 3.90117L387.312 33.3227L399.448 63.4958L453.792 197.939L384.925 198.122L372.616 163.003L324.853 162.932ZM354.63 114.834C355.859 114.834 355.534 113.148 355.371 112.691L349.115 94.7962L333.018 48.6073C332.775 47.8964 332.094 47.1855 331.403 47.4496C331.007 49.9885 329.951 52.3955 329.068 54.9446L312.006 104.221C310.777 107.786 309.538 110.924 308.786 114.824H354.63V114.834Z"
                  fill="#F6F6F6"
                />
                <path
                  d="M843.687 3.99996C849.455 3.51248 854.615 3.88825 860.353 3.88825L913.011 3.93903L839.3 196.19C838.832 197.419 838.122 198.079 836.862 198.079H747.206C745.632 196.758 745.47 195.255 744.718 193.285L672.571 4.35542C673.261 3.807 673.982 3.75622 675.018 3.75622H741.651L776.587 104.604L790.521 144.953C791.496 146.731 791.272 148.894 793.161 149.899L825.813 55.5512L834.841 29.4201L843.687 3.99996Z"
                  fill="#F6F6F6"
                />
              </svg>
              <svg
                className={styles.headlineResponsive}
                width="271"
                height="63"
                viewBox="0 0 271 63"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M35.7078 23.6164L33.9897 23.3454C24.6632 21.8828 20.408 21.2178 20.408 18.1387C20.408 16.3867 21.5195 14.373 30.1778 14.373C38.8361 14.373 42.3801 16.3498 42.3801 20.9776V21.5934H61.3286L61.2978 20.9468C60.9622 14.176 58.0925 8.92926 52.7596 5.35448C47.4575 1.80125 39.8337 0 30.0947 0C21.5195 0 14.3392 1.64114 9.3357 4.7479C4.09822 7.99939 1.32707 12.7996 1.32707 18.6252C1.32707 24.4508 3.66716 29.1402 8.47664 32.3516C12.8705 35.286 19.5489 37.2319 28.8846 38.3035C39.4242 39.5905 44.0828 40.3048 44.0828 43.778C44.0828 46.2813 42.1584 47.9501 32.7735 47.9501C23.3885 47.9501 19.1117 45.5362 19.1117 40.779V40.1632H0L0.0307906 40.8098C0.742052 55.6355 10.8875 62.2462 32.9367 62.2462C52.9936 62.2462 63.1637 55.8171 63.1637 43.1314C63.1637 28.9093 51.2632 25.978 35.7078 23.6194V23.6164Z"
                  fill="white"
                />
                <path
                  d="M115.759 1.2207L99.4771 46.0394L83.115 1.2207H63.1196L86.5635 60.8651H112.227L135.755 1.2207H115.759Z"
                  fill="white"
                />
                <path
                  d="M167.35 39.5258H186.009V43.4763C182.025 45.4191 176.846 46.4876 171.372 46.4876C159.954 46.4876 153.408 40.9453 153.408 31.2832C153.408 21.6211 159.6 15.8356 169.179 15.8356C177.437 15.8356 181.917 19.5428 182.693 23.2161L182.798 23.7056H202.131L202.085 23.0467C201.629 16.5622 198.23 10.712 192.512 6.57686C186.564 2.27542 178.524 0 169.262 0C147.992 0 134.247 12.3439 134.247 31.4464C134.247 40.7051 137.696 48.5074 144.223 54.0035C150.619 59.3919 159.557 62.24 170.075 62.24C182.903 62.24 194.831 58.1726 201.977 51.3617L202.168 51.18V27.0156H167.35V39.5228V39.5258Z"
                  fill="white"
                />
                <path
                  d="M243.541 23.6194L241.823 23.3485C232.497 21.8859 228.241 21.2208 228.241 18.1418C228.241 16.3898 229.353 14.3761 238.011 14.3761C246.669 14.3761 250.213 16.3529 250.213 20.9807V21.5965H269.162L269.131 20.9499C268.796 14.1791 265.923 8.93234 260.593 5.35756C255.291 1.80125 247.667 0 237.928 0C229.353 0 222.172 1.64114 217.169 4.7479C211.928 7.99939 209.16 12.7996 209.16 18.6283C209.16 24.4569 211.501 29.1433 216.31 32.3547C220.704 35.2891 227.382 37.235 236.718 38.3065C247.258 39.5936 251.916 40.3079 251.916 43.7811C251.916 46.2844 249.992 47.9532 240.607 47.9532C231.222 47.9532 226.945 45.5392 226.945 40.7821V40.1663H207.836L207.867 40.8129C208.575 55.6385 218.724 62.2493 240.773 62.2493C260.83 62.2493 271 55.8202 271 43.1345C271 28.9123 259.1 25.9811 243.544 23.6225L243.541 23.6194Z"
                  fill="white"
                />
              </svg>
            </div>

            <div className={styles.bottomLinks}>
              {footerContent.Lien?.map((link: any) => (
                <React.Fragment key={link.id}>
                  {renderFooterLink(link.URL, link.Texte)}
                </React.Fragment>
              ))}
              {!footerContent.Lien && (
                <>
                  {renderFooterLink("/mentions-legales", "MENTIONS LÉGALES")}
                  {renderFooterLink("/cookies", "COOKIES")}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
