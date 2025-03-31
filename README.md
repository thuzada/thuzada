# 👋 Olá, eu sou Arthur  
Bem-vindo ao meu perfil no GitHub! Apaixonado por tecnologia e desenvolvimento, sempre buscando criar soluções inovadoras. 🚀

## 🚀 Sobre mim  
- 💻 Desenvolvedor focado em **JavaScript** e **tecnologias web**  
- 📚 Sempre aprendendo e explorando novas stacks  
- 🔗 Conecte-se comigo no [LinkedIn](https://www.linkedin.com/in/thuzada)  

## 📊 Minhas Estatísticas  
![GitHub Stats](https://github-readme-stats.vercel.app/api?username=thuzada&show_icons=true&theme=radical)  
![Top Langs](https://github-readme-stats.vercel.app/api/top-langs/?username=thuzada&layout=compact&theme=radical)  

## 🚀 Projetos em Destaque  
🔹 [Projeto 1](https://github.com/thuzada/projeto1) - Descrição breve do projeto  
🔹 [Projeto 2](https://github.com/thuzada/projeto2) - Descrição breve do projeto  

## 📬 Contato  
📧 Email: [seuemail@example.com](mailto:seuemail@example.com)  
🌐 Portfólio: [seusite.com](https://seusite.com)  

---

## 📡 Estatísticas do GitHub  

```javascript
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
```

