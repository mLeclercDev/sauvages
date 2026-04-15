import qs from "qs";

export type StrapiSource = "primary" | "local";

/**
 * Get full Strapi URL from path based on source
 * @param {string} path Path of the URL
 * @param {StrapiSource} source Source of the Strapi instance
 * @returns {string} Full Strapi URL
 */
export function getStrapiURL(path = "", source: StrapiSource = "primary") {
  const baseUrl =
    source === "local"
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
  source: StrapiSource = "primary"
) {
  try {
    // Build request headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const token =
      source === "local"
        ? process.env.LOCAL_CMS_TOKEN
        : process.env.STRAPI_API_TOKEN;

    if (token && token !== "remplace_moi_par_ton_vrai_token_ici") {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Merge default options with user-provided options
    const mergedOptions = {
      headers,
      ...options,
    };

    // Build request URL
    const queryString = qs.stringify(urlParamsObject, {
      encodeValuesOnly: true, // prettify URL
    });

    const requestUrl = `${getStrapiURL(
      `/api${path.startsWith("/") ? path : `/${path}`}${
        queryString ? `?${queryString}` : ""
      }`,
      source
    )}`;

    console.log(`[Strapi Fetch - ${source}] Calling: ${requestUrl}`);

    // Trigger API call
    const response = await fetch(requestUrl, mergedOptions);

    // Handle response
    if (!response.ok) {
      console.error(
        `[Strapi Error - ${source}] ${response.status}: ${response.statusText}`
      );
      const errorText = await response.text();
      console.error(`[Strapi Error Detail] ${errorText}`);
      throw new Error(
        `Strapi (${source}) returned ${response.status}: ${response.statusText}`
      );
    }
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error(`[Strapi Fetch Failure - ${source}]`, error);
    throw new Error(`Failed to fetch API (${source}): ${error.message}`);
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
  source: StrapiSource = "primary"
) {
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

  return `${getStrapiURL("", source)}${url}`;
}
