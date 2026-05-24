const fs = require("fs");

const stats = JSON.parse(fs.readFileSync("stats.json", "utf8"));
let readme = fs.readFileSync("README.md", "utf8");

const topLangs = stats.languages.slice(0, 3).map(([lang]) => lang).join(" · ");
const updatedAt = new Date().toISOString().split("T")[0];

function replace(key, value) {
    const regex = new RegExp(`<!-- ${key} -->[\\s\\S]*?<!-- /${key} -->`, "g");
    readme = readme.replace(regex, `<!-- ${key} -->${value}<!-- /${key} -->`);
}

replace("STARS", stats.totalStars);
replace("FORKS", stats.totalForks);
replace("TOP_LANGS", topLangs);
replace("UPDATED_AT", updatedAt);

fs.writeFileSync("README.md", readme);
console.log("✅ README atualizado com stats reais!");
