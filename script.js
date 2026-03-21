let database = [];

window.onload = async () => {
    try {
        const response = await fetch('data.csv');
        const text = await response.text();
        
        const delimiter = text.includes(';') ? ';' : ',';
        const rows = text.split('\n').filter(row => row.trim() !== '');
        
        database = rows.slice(1).map(row => {
            const cols = row.split(delimiter);
            return {
                id: cols[0]?.trim(),
                name: cols[1]?.trim(),
                birth: cols[2]?.trim(), // Εδώ είναι η χρονιά (π.χ. 2024 ή -500)
                death: cols[3]?.trim(),
                origin: cols[4]?.trim(),
                category: cols[5]?.trim(),
                era: cols[6]?.trim(),
                school: cols[7]?.trim(),
                rank: cols[8]?.trim(),
                bio: cols[9]?.trim(),
                contribution: cols[10]?.trim(),
                works: cols[11]?.trim(),
                relType: cols[12]?.trim(),
                personB: cols[13]?.trim(),
                quote: cols[14]?.trim()
            };
        }).filter(item => item.name);

        // ΤΑΞΙΝΟΜΗΣΗ: Από το Σήμερα (Μεγάλο νούμερο) στο Παρελθόν (Μικρό νούμερο)
        database.sort((a, b) => {
            let yearA = parseInt(a.birth) || 0;
            let yearB = parseInt(b.birth) || 0;
            return yearB - yearA; // Φθίνουσα σειρά
        });

        renderTimeline();
    } catch (err) {
        console.error("Σφάλμα:", err);
    }
};

function renderTimeline() {
    const timeline = document.querySelector('.timeline');
    timeline.innerHTML = '';

    database.forEach(person => {
        if (!person.name) return;
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.onclick = () => selectPerson(item, person);
        item.innerHTML = `
            <span class="year">${person.birth || ''}</span>
            <span class="name">${person.name.replace(/"/g, '')}</span>
        `;
        timeline.appendChild(item);
    });
}

async function selectPerson(element, person) {
    document.querySelectorAll('.timeline-item').forEach(i => i.classList.remove('active'));
    element.classList.add('active');

    // Καθαρισμός των " από τα κείμενα αν υπάρχουν
    const clean = (txt) => txt ? txt.replace(/"/g, '') : '-';

    document.getElementById('currentNameTitle').innerText = clean(person.name);
    
    // Αντιστοίχιση των 15 πεδίων σου στα 13 πλαίσια
    document.getElementById('data1').innerHTML = `<strong>Γέννηση:</strong> ${clean(person.birth)}`;
    document.getElementById('data2').innerHTML = `<strong>Θάνατος:</strong> ${clean(person.death)}`;
    document.getElementById('data3').innerHTML = `<strong>Καταγωγή:</strong> ${clean(person.origin)}`;
    document.getElementById('data4').innerHTML = `<strong>Κατηγορία:</strong> ${clean(person.cat)}`;
    document.getElementById('data5').innerHTML = `<strong>Εποχή:</strong> ${clean(person.era)}`;
    document.getElementById('data6').innerHTML = `<strong>Σχολή:</strong> ${clean(person.school)}`;
    document.getElementById('data7').innerHTML = `<strong>Κατάταξη:</strong> ${clean(person.rank)}`;
    document.getElementById('data8').innerHTML = `<strong>Σύντομο Βιογραφικό:</strong> ${clean(person.bio)}`;
    document.getElementById('data9').innerHTML = `<strong>Συνεισφορά:</strong> ${clean(person.contr)}`;
    document.getElementById('data10').innerHTML = `<strong>Έργα:</strong> ${clean(person.works)}`;
    document.getElementById('data11').innerHTML = `<strong>Σχέση:</strong> ${clean(person.rel)}`;
    document.getElementById('data12').innerHTML = `<strong>Σχετικό Πρόσωπο:</strong> ${clean(person.personB)}`;
    document.getElementById('data13').innerHTML = `<strong>Ρήση:</strong> ${clean(person.quote)}`;

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
