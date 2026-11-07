const fs = require("fs");

const username = "thuzada";
const API = "https://api.github.com";

// Código de terceiros (bibliotecas copiadas para dentro do repo) que não deve
// entrar na conta de linguagens. Prefixos de caminho, por repositório.
const VENDORED_PATHS = {
    SQLiteBank: ["lib/"],
};

// Padrões de caminho ignorados em qualquer repositório.
const GLOBAL_IGNORE = [/(^|\/)node_modules\//, /(^|\/)vendor\//, /\.min\.(js|css)$/];

// Extensão -> linguagem (só o necessário para descontar arquivos ignorados).
const EXT_LANG = {
    c: "C", h: "C", java: "Java", html: "HTML", css: "CSS",
    js: "JavaScript", ts: "TypeScript", py: "Python",
};

const headers = {
    Accept: "application/vnd.github+json",
    ...(process.env.GITHUB_TOKEN && {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    }),
};

async function get(url) {
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} em ${url}`);
    return res.json();
}

async function getAllRepos() {
    const repos = [];
    for (let page = 1; ; page++) {
        const batch = await get(
            `${API}/users/${username}/repos?type=owner&per_page=100&page=${page}`
        );
        repos.push(...batch);
        if (batch.length < 100) return repos;
    }
}

function langOf(path) {
    const ext = path.split(".").pop().toLowerCase();
    return EXT_LANG[ext];
}

// Bytes de arquivos ignorados, agrupados por linguagem.
async function ignoredBytes(repo) {
    const prefixes = VENDORED_PATHS[repo.name] || [];
    let tree;
    try {
        tree = await get(
            `${API}/repos/${username}/${repo.name}/git/trees/${repo.default_branch}?recursive=1`
        );
    } catch (e) {
        if (String(e.message).startsWith("409")) return {}; // repositório vazio
        throw e;
    }
    const out = {};
    for (const f of tree.tree || []) {
        if (f.type !== "blob") continue;
        const ignored =
            prefixes.some((p) => f.path.startsWith(p)) ||
            GLOBAL_IGNORE.some((re) => re.test(f.path));
        const lang = ignored && langOf(f.path);
        if (lang) out[lang] = (out[lang] || 0) + (f.size || 0);
    }
    return out;
}

async function getGitHubStats() {
    // Forks não contam: estrelas, forks e linguagens deles não são trabalho seu.
    const repos = (await getAllRepos()).filter((r) => !r.fork);

    let totalStars = 0;
    let totalForks = 0;
    const languages = {};

    for (const repo of repos) {
        totalStars += repo.stargazers_count || 0;
        totalForks += repo.forks_count || 0;

        const repoLangs = await get(repo.languages_url);
        const ignored = await ignoredBytes(repo);

        for (const [lang, bytes] of Object.entries(repoLangs)) {
            const net = bytes - (ignored[lang] || 0);
            if (net > 0) languages[lang] = (languages[lang] || 0) + net;
        }
    }

    const stats = {
        username,
        totalStars,
        totalForks,
        languages: Object.entries(languages).sort((a, b) => b[1] - a[1]),
    };

    fs.writeFileSync("stats.json", JSON.stringify(stats, null, 2));
    console.log(`✅ ${repos.length} repositórios próprios analisados.`);
}

// Falha de verdade (exit 1) em vez de engolir o erro e commitar dado velho.
getGitHubStats().catch((error) => {
    console.error("❌ Erro ao buscar dados do GitHub:", error.message);
    process.exit(1);
});
