const fs = require("fs");

const username = "thuzada";
const apiUrl = `https://api.github.com/users/${username}/repos`;

async function getGitHubStats() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Erro na API: ${response.statusText}`);

        const repos = await response.json();

        let totalStars = 0;
        let totalForks = 0;
        let languages = {};

        for (const repo of repos) {
            totalStars += repo.stargazers_count || 0;
            totalForks += repo.forks_count || 0;

            const langResponse = await fetch(repo.languages_url);
            if (!langResponse.ok) continue;

            const repoLangs = await langResponse.json();
            for (const lang in repoLangs) {
                languages[lang] = (languages[lang] || 0) + repoLangs[lang];
            }
        }

        const stats = {
            username,
            totalStars,
            totalForks,
            languages: Object.entries(languages).sort((a, b) => b[1] - a[1])
        };

        fs.writeFileSync("stats.json", JSON.stringify(stats, null, 2));
        console.log("✅ Estatísticas atualizadas!");

    } catch (error) {
        console.error("❌ Erro ao buscar dados do GitHub:", error.message);
    }
}

getGitHubStats();
