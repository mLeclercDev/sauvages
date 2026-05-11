import qs from "qs";

export type StrapiSource = "primary" | "local";

/**
 * Get full Strapi URL from path based on source
 * @param {string} path Path of the URL
 * @param {StrapiSource} source Source of the Strapi instance
 * @returns {string} Full Strapi URL
 */
export function getStrapiURL(path = "", source?: StrapiSource) {
  const activeSource = source || (process.env.NEXT_PUBLIC_STRAPI_SOURCE as StrapiSource) || "primary";
  const baseUrl =
    activeSource === "local"
      ? process.env.NEXT_PUBLIC_LOCAL_CMS_URL || "http://localhost:1337"
      : process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";
  
  // Remove trailing slash if present in baseUrl and path starts with holiday
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBaseUrl}${normalizedPath === "/" ? "" : normalizedPath}`;
}

/**
 * Helper to make GET requests to Strapi API endpoints
 * @param {string} path Endpoint path for the request
 * @param {Object} urlParamsObject URL query params, merged with the default ones
 * @param {Object} options Options object passed to fetch
 * @param {StrapiSource} source Source of the Strapi instance
 * @returns {Promise<any>} Response from the API
 */
export async function fetchAPI(
  path: string,
  urlParamsObject = {},
  options = {},
  source?: StrapiSource
) {
  const activeSource = source || (process.env.NEXT_PUBLIC_STRAPI_SOURCE as StrapiSource) || "primary";
  try {
    const token =
      activeSource === "local"
        ? process.env.LOCAL_CMS_TOKEN
        : process.env.STRAPI_API_TOKEN;

    const queryString = qs.stringify(urlParamsObject, {
      encodeValuesOnly: true,
    });

    const requestUrl = getStrapiURL(
      `/api${path.startsWith("/") ? path : `/${path}`}${
        queryString ? `?${queryString}` : ""
      }`,
      activeSource
    );

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options as any).headers || {}),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(requestUrl, {
      ...options,
      headers,
    });

    if (!response.ok) {
      console.warn(
        `[Strapi Warning - ${activeSource}] ${response.status} on ${requestUrl}`
      );
      return null;
    }
    
    return await response.json();
  } catch (error: any) {
    console.error(`[Strapi Fetch Failure - ${activeSource}]`, error);
    throw new Error(`Failed to fetch API (${activeSource}): ${error.message}`);
  }
}

/**
 * Helper to get an image URL from a Strapi image object with optional format selection
 * @param {any} image Strapi image object (v4 or v5)
 * @param {string} format Optional format to pick (large, medium, small, thumbnail)
 * @param {StrapiSource} source Source of the Strapi instance
 * @returns {string | null} Full image URL
 */
export function getStrapiMedia(
  image: any,
  format?: "large" | "medium" | "small" | "thumbnail",
  source?: StrapiSource
) {
  const activeSource = source || (process.env.NEXT_PUBLIC_STRAPI_SOURCE as StrapiSource) || "primary";
  if (!image) return null;

  // Handle Strapi v4/v5 structure
  const attributes = image.data?.attributes || image.attributes || image;

  // Prefer requested format if it exists, otherwise use the original URL
  let url = attributes?.url;

  if (format && attributes?.formats?.[format]) {
    url = attributes.formats[format].url;
  }

  if (!url) return null;

  if (url.startsWith("http") || url.startsWith("//")) {
    return url;
  }

  return `${getStrapiURL("", activeSource)}${url}`;
}
