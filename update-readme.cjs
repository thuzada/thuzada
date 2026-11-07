const fs = require("fs");

const stats = JSON.parse(fs.readFileSync("stats.json", "utf8"));
let readme = fs.readFileSync("README.md", "utf8");

function replace(key, value) {
    const regex = new RegExp(`<!-- ${key} -->[\\s\\S]*?<!-- /${key} -->`, "g");
    readme = readme.replace(regex, () => `<!-- ${key} -->${value}<!-- /${key} -->`);
}

// Barra de linguagens em texto: não depende de nenhum serviço externo.
function languageBars(languages, top = 6, width = 24) {
    const total = languages.reduce((sum, [, bytes]) => sum + bytes, 0);
    const rows = languages.slice(0, top).map(([lang, bytes]) => {
        const pct = (bytes / total) * 100;
        const filled = Math.max(1, Math.round((pct / 100) * width));
        return `${lang.padEnd(11)} ${"█".repeat(filled)}${"░".repeat(width - filled)} ${pct.toFixed(1).padStart(5)}%`;
    });
    return "\n```text\n" + rows.join("\n") + "\n```\n";
}

const updatedAt = new Date().toISOString().split("T")[0];

replace("LANG_BARS", languageBars(stats.languages));
replace("UPDATED_AT", updatedAt);

fs.writeFileSync("README.md", readme);
console.log("✅ README atualizado com stats reais!");
