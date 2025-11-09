import fs from 'fs';
import path from 'path';

const log = (...args) => console.log('[splitPages]', ...args);
const root = path.resolve();
log('Project root:', root);

const sourcePath = path.join(root, 'temp_original_index.html');
log('Source path:', sourcePath);

if (!fs.existsSync(sourcePath)) {
  console.error('[splitPages] Source file temp_original_index.html not found. Aborting.');
  process.exit(1);
}

const source = fs.readFileSync(sourcePath, 'utf8');
log('Loaded source file, length:', source.length);

const headMatch = source.match(/[\s\S]*?<\/head>/i);
if (!headMatch) {
  console.error('[splitPages] Unable to extract <head> section from source.');
  process.exit(1);
}
const headSection = headMatch[0];
log('Extracted head section.');

const bodyMatch = source.match(/<body[^>]*>([\s\S]*)<\/body>/i);
if (!bodyMatch) {
  console.error('[splitPages] Unable to extract <body> section from source.');
  process.exit(1);
}
const bodyContent = bodyMatch[1];
log('Extracted body content, length:', bodyContent.length);

const backgroundMatch = bodyContent.match(/[\s\S]*?<!-- Page de connexion -->/i);
if (!backgroundMatch) {
  console.error('[splitPages] Unable to extract background portion before login.');
  process.exit(1);
}
const backgroundSection = backgroundMatch[0].replace(/<!-- Page de connexion -->[\s\S]*$/i, '').trimEnd();
log('Captured background section length:', backgroundSection.length);

const navTemplate = `
        <nav class="fey-nav">
            <button class="fey-tab" data-page="liste" onclick="navigateTo('liste')">📋 Ma Liste</button>
            <button class="fey-tab" data-page="tente" onclick="navigateTo('tente')">⛺ La Tente</button>
            <button class="fey-tab" data-page="infos" onclick="navigateTo('infos')">📱 Infos</button>
            <button class="fey-tab" data-page="equipes" onclick="navigateTo('equipes')">👥 Équipes</button>
            <button class="fey-tab" data-page="calendrier" onclick="navigateTo('calendrier')">📅 Calendrier</button>
            <button class="fey-tab" data-page="covoiturage" onclick="navigateTo('covoiturage')">🚗 Covoiturage</button>
            <button class="fey-tab" data-page="chansons" onclick="navigateTo('chansons')">🎵 Chansons</button>
            <button class="fey-tab" data-page="marin" onclick="navigateTo('marin')">⚓ Marin</button>
            <button class="fey-tab" data-page="loi" onclick="navigateTo('loi')">📜 Loi Scout</button>
            <button class="fey-tab" data-page="admin" data-admin-only="true" onclick="navigateTo('admin')">⚙️ Admin</button>
            <button class="fey-tab" data-page="registre" data-admin-only="true" onclick="navigateTo('registre')">📋 Registre d'Appel</button>
            <button class="fey-tab" data-page="logout" onclick="logout()">🚪 Déconnexion</button>
        </nav>
`.trimEnd();
log('Navigation template prepared.');

const scriptBlockMatch = source.match(/<script src="https:\/\/unpkg.com\/@supabase[\s\S]*$/i);
if (!scriptBlockMatch) {
  console.error('[splitPages] Unable to extract script block from source.');
  process.exit(1);
}
const scriptBlock = scriptBlockMatch[0];
log('Script block length:', scriptBlock.length);

const inlineScriptMatch = scriptBlock.match(/<script>([\s\S]*?)<\/script>\s*$/i);
if (!inlineScriptMatch) {
  console.error('[splitPages] Unable to extract inline application script.');
  process.exit(1);
}
const inlineScript = inlineScriptMatch[1];
log('Captured inline script length:', inlineScript.length);

const scriptImports = scriptBlock
  .replace(inlineScriptMatch[0], '')
  .trim()
  .split('\n')
  .map(line => line.trim())
  .filter(Boolean);
log('Found script imports:', scriptImports.length);

const pageRegex = /<!-- PAGE [^:]+: [^>]+ -->\s*(<div id="([^"]+)"[\s\S]*?<\/div>)/gi;
const pageSections = new Map();

let match;
while ((match = pageRegex.exec(bodyContent)) !== null) {
  const sectionHtml = match[1];
  const sectionId = match[2];
  pageSections.set(sectionId, sectionHtml.trim());
  log(`Captured section "${sectionId}" (length: ${sectionHtml.length})`);
}

log('Total sections captured:', pageSections.size);

const fileMap = {
  liste: 'docs/liste.html',
  tente: 'docs/tente.html',
  infos: 'docs/infos.html',
  equipes: 'docs/equipes.html',
  calendrier: 'docs/calendrier.html',
  covoiturage: 'docs/covoiturage.html',
  chansons: 'docs/chansons.html',
  marin: 'docs/marin.html',
  loi: 'docs/loi.html',
  admin: 'docs/admin.html',
  registre: 'docs/registre.html'
};

const scriptImportsHtml = scriptImports.join('\n');
log('Script imports HTML block length:', scriptImportsHtml.length);

pageSections.forEach((sectionHtml, sectionId) => {
  const targetPath = fileMap[sectionId] || `docs/${sectionId}.html`;
  log(`Generating file for section "${sectionId}" at ${targetPath}`);

  const pageTitleMatch = sectionHtml.match(/<div class="fey-card-header"[^>]*>([^<]+)<\/div>/i);
  const pageTitle = pageTitleMatch ? pageTitleMatch[1].trim() : 'Carnet Scout';
  log(`Page title: "${pageTitle}"`);

  const pageContent = `${headSection}
<body data-page="${sectionId}">
    ${backgroundSection}
    <div class="fey-container">
${navTemplate}
${sectionHtml}
    </div>
${scriptImportsHtml}
    <script src="js/app.js"></script>
</body>
</html>
`;

  fs.writeFileSync(targetPath, pageContent, 'utf8');
  console.log(`[splitPages] Generated ${targetPath} (${pageContent.length} chars)`);
});

const appScriptPath = path.join('docs', 'js', 'app.js');
fs.writeFileSync(appScriptPath, inlineScript.trim() + '\n', 'utf8');
console.log(`[splitPages] Created ${appScriptPath}`);

console.log('[splitPages] Split process complete.');
