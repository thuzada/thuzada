const fs = require("fs");

const stats = JSON.parse(fs.readFileSync("stats.json", "utf8"));
let readme = fs.readFileSync("README.md", "utf8");

const topLang = stats.languages[0]?.[0] ?? "N/A";
const updatedAt = new Date().toISOString().split("T")[0];

function replace(key, value) {
    const regex = new RegExp(`<!-- ${key} -->[\\s\\S]*?<!-- /${key} -->`, "g");
    readme = readme.replace(regex, `<!-- ${key} -->${value}<!-- /${key} -->`);
}

replace("STARS", stats.totalStars);
replace("FORKS", stats.totalForks);
replace("TOP_LANG", topLang);
replace("UPDATED_AT", updatedAt);

fs.writeFileSync("README.md", readme);
console.log("✅ README atualizado com stats reais!");
