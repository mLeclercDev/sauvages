
const STRAPI_URL = "https://api.agence-sauvages.com";
const TOKEN = "d616588264b0bafe565ee36bd0f9e398611ce551503226b00a611355a061e0be047977b9335e1678ff535ff1fb2ac8841ddf2a0214a6d2d09c7a46db92945d3d21f2fecf74ffe3f189d10550bf60bead0944a18a5ed597831596c58c2dfb01b0a763df36845a3dbddffb4fc41698738e6767269fa16309944f00fa5320764345";

async function testConnection() {
  console.log("Testing connection to Strapi Prod...");
  
  const endpoints = ["/api/homepage", "/api/footer", "/api/articles", "/api/projets"];
  
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(`${STRAPI_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`
        }
      });
      const data = await res.json();
      console.log(`\nEndpoint: ${endpoint}`);
      console.log(`Status: ${res.status} ${res.statusText}`);
      if (!res.ok) {
        console.log(`Error Detail:`, JSON.stringify(data.error));
      } else {
        console.log(`Success! Data keys:`, Object.keys(data.data || {}));
      }
    } catch (err) {
      console.log(`Failed to fetch ${endpoint}:`, err.message);
    }
  }
}

testConnection();
