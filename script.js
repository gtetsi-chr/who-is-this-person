let database = [];

// 1. ΑΥΤΟΜΑΤΗ ΦΟΡΤΩΣΗ ΜΟΛΙΣ ΑΝΟΙΞΕΙ Η ΣΕΛΙΔΑ
window.onload = async () => {
    try {
        // Προσθέτουμε ένα τυχαίο νούμερο στο τέλος για να μην "κολλάει" στο παλιό cache
        const response = await fetch('data.csv?v=' + Math.random());
        const text = await response.text();
        
        // Εντοπισμός διαχωριστικού (; ή ,)
        const delimiter = text.includes(';') ? ';' : ',';
        
        // Χωρισμός γραμμών και αφαίρεση κενών
        const rows = text.split('\n').map(r => r.trim()).filter(r => r !== '');
        
        // Μετατροπή CSV σε Αντικείμενα
        database = rows.slice(1).map(row => {
            const cols = row.split(delimiter);
            return {
                id: cols[0],
                name: cols[1],
                birth: cols[2],
                death: cols[3],
                origin: cols[4],
                category: cols[5],
                era: cols[6],
                school: cols[7],
                rank: cols[8],
                bio: cols[9],
                contribution: cols[10],
                works: cols[11],
                relType: cols[12],
                personB: cols[13],
                quote: cols[14]
            };
        }).filter(item => item.name); // Κρατάμε μόνο όσους έχουν όνομα

        // ΤΑΞΙΝΟΜΗΣΗ (Από το σήμερα προς τα πίσω)
        database.sort((a, b) => {
            return parseYear(b.birth) - parseYear(a.birth);
        });

        renderTimeline();
    } catch (err) {
        console.error("Σφάλμα κατά τη φόρτωση του CSV:", err);
    }
};

// 2. ΣΥΝΑΡΤΗΣΗ ΠΟΥ ΜΕΤΑΤΡΕΠΕΙ ΤΟ "π.Χ." ΣΕ ΑΡΙΘΜΟ ΓΙΑ ΤΗΝ ΤΑΞΙΝΟΜΗΣΗ
function parseYear(yearStr) {
    if (!yearStr) return -99999; // Αν δεν έχει χρονιά, πάει στο τέλος
    let year = yearStr.toString().toLowerCase().trim();
    
    // Αν περιέχει "π" (από το π.Χ. ή πχ), το κάνουμε αρνητικό
    if (year.includes('π')) {
        let num = parseInt(year.replace(/[^0-9]/g, ''));
        return num ? -num : 0;
    }
    
    // Αλλιώς επιστρέφουμε τον αριθμό κανονικά
    return parseInt(year.replace(/[^0-9]/g, '')) || 0;
}

// 3. ΕΜΦΑΝΙΣΗ ΤΟΥ ΧΡΟΝΟΛΟΓΙΟΥ ΑΡΙΣΤΕΡΑ
function renderTimeline() {
    const timeline = document.querySelector('.timeline');
    if (!timeline) return;
    timeline.innerHTML = '';

    database.forEach(person => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.onclick = () => selectPerson(item, person);
        item.innerHTML = `
            <div class="year">${person.birth || ''}</div>
            <div class="name">${person.name}</div>
        `;
        timeline.appendChild(item);
    });
}

// 4. ΟΤΑΝ ΕΠΙΛΕΓΟΥΜΕ ΕΝΑΝ ΑΝΘΡΩΠΟ
async function selectPerson(element, person) {
    // 1. Highlight στο Timeline
    document.querySelectorAll('.timeline-item').forEach(i => i.classList.remove('active'));
    element.classList.add('active');

    // 2. Ενημέρωση των 13+ πεδίων (HTML IDs: data1 έως data13)
    document.getElementById('currentNameTitle').innerText = person.name;
    document.getElementById('data1').innerText = person.birth || '-';
    document.getElementById('data2').innerText = person.death || '-';
    document.getElementById('data3').innerText = person.origin || '-';
    document.getElementById('data4').innerText = person.category || '-';
    document.getElementById('data5').innerText = person.era || '-';
    document.getElementById('data6').innerText = person.school || '-';
    document.getElementById('data7').innerText = person.rank || '-';
    document.getElementById('data8').innerText = person.bio || '-';
    document.getElementById('data9').innerText = person.contribution || '-';
    document.getElementById('data10').innerText = person.works || '-';
    document.getElementById('data11').innerText = person.relType || '-';
    document.getElementById('data12').innerText = person.personB || '-';
    document.getElementById('data13').innerText = person.quote || '-';

    // 3. Κλήση AI
    askAI(person.name);
}

// 5. ΕΠΙΚΟΙΝΩΝΙΑ ΜΕ ΤΟΝ CLOUDFLARE WORKER
async function askAI(name) {
    const aiBox = document.getElementById('aiResult');
    aiBox.innerHTML = `<div style="color: gray;"><em>Η AI αναζητά πληροφορίες για τον ${name}...</em></div>`;

    try {
        const response = await fetch('https://person-lookup-api.gtetsi.workers.dev/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name })
        });
        
        const data = await response.json();
        
        if (data && data.text) {
            aiBox.innerText = data.text;
        } else {
            aiBox.innerText = "Δεν βρέθηκαν αποτελέσματα από την AI.";
        }
    } catch (err) {
        console.error("AI Error:", err);
        aiBox.innerText = "Η AI είναι προσωρινά μη διαθέσιμη. Ελέγξτε το Quota ή το API Key.";
    }
}

// 6. ΕΝΑΛΛΑΓΗ ΘΕΜΑΤΟΣ (DARK/LIGHT)
function toggleTheme() {
    document.body.classList.toggle('light-mode');
}
