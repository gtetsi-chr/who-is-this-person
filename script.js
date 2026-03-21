let database = []; // Εδώ θα αποθηκευτούν τα δεδομένα από το CSV

// 1. ΦΟΡΤΩΣΗ ΤΟΥ CSV ΜΟΛΙΣ ΑΝΟΙΞΕΙ Η ΣΕΛΙΔΑ
window.onload = async () => {
    try {
        const response = await fetch('data.csv');
        const data = await response.text();
        
        // Μετατροπή CSV σε Λίστα (Array)
        const rows = data.split('\n').slice(1); // Παράκαμψη της πρώτης γραμμής (headers)
        database = rows.map(row => {
            const cols = row.split(','); // Ή ';' αν το Excel σου χρησιμοποιεί ερωτηματικό
            return {
                id: cols[0], name: cols[1], birth: cols[2], death: cols[3],
                origin: cols[4], category: cols[5], era: cols[6], school: cols[7],
                rank: cols[8], bio: cols[9], contribution: cols[10], works: cols[11],
                relType: cols[12], personB: cols[13], quote: cols[14]
            };
        }).filter(item => item.name); // Φιλτράρισμα κενών γραμμών

        renderTimeline();
    } catch (err) {
        console.error("Σφάλμα φόρτωσης CSV:", err);
    }
};

// 2. ΔΗΜΙΟΥΡΓΙΑ ΤΟΥ TIMELINE ΑΡΙΣΤΕΡΑ
function renderTimeline() {
    const timeline = document.querySelector('.timeline');
    timeline.innerHTML = ''; // Καθαρισμός

    database.forEach(person => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.onclick = () => selectPerson(item, person);
        item.innerHTML = `
            <span class="year">${person.birth || ''}</span>
            <span class="name">${person.name}</span>
        `;
        timeline.appendChild(item);
    });
}

// 3. ΟΤΑΝ ΕΠΙΛΕΓΕΙΣ ΠΡΟΣΩΠΟ
async function selectPerson(element, person) {
    // Highlight
    document.querySelectorAll('.timeline-item').forEach(i => i.classList.remove('active'));
    element.classList.add('active');

    // ΑΚΑΡΙΑΙΑ ΕΝΗΜΕΡΩΣΗ ΑΠΟ ΤΟ CSV (Τα 13+ πεδία σου)
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

    // ΚΛΗΣΗ AI (Θα εμφανιστεί αργότερα αν η Google ξεμπλοκάρει)
    askAI(person.name);
}

// 4. Η ΣΥΝΑΡΤΗΣΗ ΤΟΥ WORKER
async function askAI(name) {
    const aiBox = document.getElementById('aiResult');
    aiBox.innerHTML = "<em>Η AI επεξεργάζεται...</em>";

    try {
        const response = await fetch('https://person-lookup-api.gtetsi.workers.dev/', {
            method: 'POST',
            body: JSON.stringify({ name: name })
        });
        const data = await response.json();
        aiBox.innerText = data.text;
    } catch (err) {
        aiBox.innerText = "Η AI είναι προσωρινά μη διαθέσιμη (Quota Limit).";
    }
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
}
