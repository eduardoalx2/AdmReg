const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'scratch_data');
const igrejasRaw = JSON.parse(fs.readFileSync(path.join(dataDir, 'igrejas.json'), 'utf8'));
const eventosRaw = JSON.parse(fs.readFileSync(path.join(dataDir, 'eventos.json'), 'utf8'));
const presencasRaw = JSON.parse(fs.readFileSync(path.join(dataDir, 'presencas.json'), 'utf8'));

// Helper to extract clean field values from Firestore document format
function cleanDoc(doc) {
    const fields = doc.fields || {};
    const result = { id: doc.name.split('/').pop() };
    for (const key in fields) {
        if (fields[key].stringValue !== undefined) {
            result[key] = fields[key].stringValue;
        } else if (fields[key].integerValue !== undefined) {
            result[key] = parseInt(fields[key].integerValue, 10);
        } else if (fields[key].doubleValue !== undefined) {
            result[key] = parseFloat(fields[key].doubleValue);
        } else if (fields[key].booleanValue !== undefined) {
            result[key] = fields[key].booleanValue;
        } else if (fields[key].timestampValue !== undefined) {
            result[key] = fields[key].timestampValue;
        } else if (fields[key].mapValue !== undefined) {
            // Simplify map value
            const mapFields = fields[key].mapValue.fields || {};
            const mapObj = {};
            for (const mk in mapFields) {
                if (mapFields[mk].stringValue !== undefined) mapObj[mk] = mapFields[mk].stringValue;
                else if (mapFields[mk].integerValue !== undefined) mapObj[mk] = parseInt(mapFields[mk].integerValue, 10);
            }
            result[key] = mapObj;
        }
    }
    return result;
}

const igrejas = igrejasRaw.map(cleanDoc);
const eventos = eventosRaw.map(cleanDoc);
const presencas = presencasRaw.map(cleanDoc);

// Filter out Region 655 from churches list
const activeIgrejas = igrejas.filter(ig => {
    const nome = (ig.nome || '').trim();
    if (nome.toLowerCase().includes('655') || ig.codigo === '655') return false;
    return true;
});

// Sort churches by code
activeIgrejas.sort((a, b) => parseInt(a.codigo || 0) - parseInt(b.codigo || 0));

// Find open events
const openEventos = eventos.filter(ev => ev.publico === 'EventoAberto');

console.log('Active Churches:', activeIgrejas.map(i => `${i.codigo} - ${i.nome}`));
console.log('Open Events:', openEventos.map(e => `${e.id} - ${e.nome} (${e.data})`));

// Create report contents
let fullReport = `# Relatório de Presenças - Eventos Abertos\n\n`;
fullReport += `Este relatório foi gerado automaticamente a partir dos dados do sistema da Região 655.\n`;
fullReport += `Total de Igrejas Ativas consideradas: **${activeIgrejas.length}**.\n\n`;

openEventos.forEach(evento => {
    const eventoPresencas = presencas.filter(p => p.eventoId === evento.id);
    const totalPessoas = eventoPresencas.reduce((sum, p) => sum + (p.qtdPessoas || 0), 0);
    
    // Map of presence by church name (lowercase for safety)
    const presenceMap = new Map();
    eventoPresencas.forEach(p => {
        const key = (p.igrejaNome || '').trim().toLowerCase();
        presenceMap.set(key, (presenceMap.get(key) || 0) + (p.qtdPessoas || 0));
    });

    const numPresentes = activeIgrejas.filter(ig => {
        const key = (ig.nome || '').trim().toLowerCase();
        return presenceMap.has(key);
    }).length;

    const numAusentes = activeIgrejas.length - numPresentes;
    const churchPresenceRate = ((numPresentes / activeIgrejas.length) * 100).toFixed(1);

    fullReport += `## Evento: ${evento.nome}\n`;
    fullReport += `- **Data**: ${evento.data ? evento.data.split('-').reverse().join('/') : 'N/A'}\n`;
    fullReport += `- **Local**: ${evento.local || 'Não informado'}\n`;
    fullReport += `- **Coordenador**: ${evento.coordenadorInfo ? evento.coordenadorInfo.nome : 'Não informado'} (${evento.coordenadorInfo ? evento.coordenadorInfo.coordNome : 'N/A'})\n`;
    fullReport += `- **Total de Pessoas Presentes**: **${totalPessoas}**\n`;
    fullReport += `- **Participação das Igrejas**: **${numPresentes} de ${activeIgrejas.length}** (${churchPresenceRate}% de igrejas presentes)\n\n`;

    // Presence table
    fullReport += `### Detalhamento por Igreja\n\n`;
    fullReport += `| Código | Igreja | Status | Presenças (Pessoas) | % do Total do Evento | % de Participação |\n`;
    fullReport += `| :---: | :--- | :---: | :---: | :---: | :---: |\n`;

    activeIgrejas.forEach(ig => {
        const key = (ig.nome || '').trim().toLowerCase();
        const pCount = presenceMap.get(key) || 0;
        const isPresent = pCount > 0;
        const status = isPresent ? '🟢 PRESENTE' : '🔴 AUSENTE';
        
        // % of total attendees
        const pctTotal = totalPessoas > 0 ? ((pCount / totalPessoas) * 100).toFixed(1) + '%' : '0.0%';
        
        // % of participation (100% if present, 0% if absent)
        const pctPart = isPresent ? '100%' : '0%';

        fullReport += `| ${String(ig.codigo).padStart(4, '0')} | ${ig.nome} | ${status} | ${pCount} | ${pctTotal} | ${pctPart} |\n`;
    });

    fullReport += `\n`;
    
    // Summary of ausentes
    const ausentes = activeIgrejas.filter(ig => {
        const key = (ig.nome || '').trim().toLowerCase();
        return !presenceMap.has(key);
    });

    if (ausentes.length > 0) {
        fullReport += `> **Igrejas Ausentes (${ausentes.length}):** ` + ausentes.map(ig => `${ig.nome} (${String(ig.codigo).padStart(4, '0')})`).join(', ') + `\n\n`;
    } else {
        fullReport += `> ✅ **Parabéns! Todas as igrejas registraram presença neste evento.**\n\n`;
    }

    fullReport += `---\n\n`;
});

// Save report to markdown file
fs.writeFileSync(path.join(__dirname, 'relatorio_analise_eventos.md'), fullReport, 'utf8');
console.log('Report generated: relatorio_analise_eventos.md');
