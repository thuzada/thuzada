const fetch = require("node-fetch");
const fs = require("fs");

const username = "thuzada";
const apiUrl = `https://api.github.com/users/${username}/repos`;

async function getGitHubStats() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Erro na API: ${response.statusText}`);

        const repos = await response.json();

        let totalStars = repos.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0);
        let totalForks = repos.reduce((acc, repo) => acc + (repo.forks_count || 0), 0);
        let languages = {};

        await Promise.all(repos.map(async (repo) => {
            const langResponse = await fetch(repo.languages_url);
            if (langResponse.ok) {
                const repoLangs = await langResponse.json();
                for (const lang in repoLangs) {
                    languages[lang] = (languages[lang] || 0) + repoLangs[lang];
                }
            }
        }));

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
