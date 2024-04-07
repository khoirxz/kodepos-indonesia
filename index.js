import express from "express";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path"; // Import join from path module
import fs from "fs/promises";
import { readFile as readFileAsync } from "fs/promises";

import swaggerUI from "swagger-ui-express";

dotenv.config();

const app = express();

app.use(express.json());

app.use(
  "/api-docs",
  swaggerUI.serve,
  swaggerUI.setup(
    JSON.parse(
      await readFileAsync(new URL("swagger.json", import.meta.url), {
        encoding: "utf-8",
      })
    )
  )
);

app.get("/", async (req, res) => {
  const searchCriteria = req.query.search;

  if (!searchCriteria) {
    res.status(200).send("API KODEPOS INDONESIA.");
    return;
  }

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const filePath = join(__dirname, "kodepos.json"); // Use join from path module

  try {
    const rawData = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(rawData);

    const filteredData = data.filter((item) => {
      const lowercasedSearch = searchCriteria.toLowerCase();
      return (
        item.province.toLowerCase().includes(lowercasedSearch) ||
        item.city.toLowerCase().includes(lowercasedSearch) ||
        item.district.toLowerCase().includes(lowercasedSearch) ||
        item.subdistrict.toLowerCase().includes(lowercasedSearch) ||
        item.postal_code.toLowerCase().includes(lowercasedSearch)
      );
    });

    res.send(filteredData);
  } catch (err) {
    console.error("Error reading or parsing JSON file:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on http://localhost:${process.env.PORT || 5000}`);
});
