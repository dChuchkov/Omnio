const fs = require('fs');
const path = require('path');

const IN = path.resolve(process.cwd(), 'files_export.json');
const OUT = path.resolve(process.cwd(), 'media_map.json');

function normalize(name) {
    return (name || '').toString().toLowerCase().replace(/\s+/g, '-').replace(/\.(png|jpg|jpeg)$/i, '');
}

try {
    const raw = fs.readFileSync(IN, 'utf8').trim();
    const arr = raw.startsWith('[') ? JSON.parse(raw) : raw.split(/\r?\n/).filter(Boolean).map(l => JSON.parse(l));
    const map = {};
    for (const f of arr) {
        const filename = f.name || f.filename || (f.url && f.url.split('/').pop()) || '';
        const key = normalize(filename);
        map[key] = { id: f.id, url: f.url || (f.formats && (f.formats.thumbnail?.url || f.formats.small?.url)) || f.url, provider: f.provider || 'local', name: filename };
    }
    fs.writeFileSync(OUT, JSON.stringify(map, null, 2), 'utf8');
    console.log('Wrote', OUT, Object.keys(map).length, 'entries');
} catch (err) {
    console.error('Failed to convert export:', err.message);
    process.exit(1);
}
