let database = [];

window.onload = async () => {
    try {
        const response = await fetch('data.csv?v=' + Math.random());
        const text = await response.text();
        const delimiter = text.includes(';') ? ';' : ',';
        const rows = text.split('\n').map(r => r.trim()).filter(r => r !== '');
        
        database = rows.slice(1).map(row => {
            const cols = row.split(delimiter);
            return {
                id: cols[0], name: cols[1], birth: cols[2], death: cols[3],
                origin: cols[4], category: cols[5], era: cols[6], school: cols[7],
                rank: cols[8], bio: cols[9], contribution: cols[10], works: cols[11],
                relType: cols[12], personB: cols[13], quote: cols[14]
            };
        }).filter(item => item.name);

        database.sort((a, b) => parseYear(b.birth) - parseYear(a.birth));
        renderTimeline();
    } catch (err) {
        console.error("CSV Load Error:", err);
    }
};

function parseYear(yearStr) {
    if (!yearStr) return -99999;
    let year = yearStr.toString().toLowerCase().trim();
    if (year.includes('π')) {
        let num = parseInt(year.replace(/[^0-9]/g, ''));
        return num ? -num : 0;
    }
    return parseInt(year.replace(/[^0-9]/g, '')) || 0;
}

function renderTimeline() {
    const timeline = document.querySelector('.timeline');
    if (!timeline) return;
    timeline.innerHTML = '';
    database.forEach(person => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.onclick = () => selectPerson(item, person);
        item.innerHTML = `<div class="year">${person.birth || ''}</div><div class="name">${person.name}</div>`;
        timeline.appendChild(item);
    });
}

async function selectPerson(element, person) {
    document.querySelectorAll('.timeline-item').forEach(i => i.classList.remove('active'));
    element.classList.add('active');

    document.getElementById('currentNameTitle').innerText = person.name;
    for(let i=1; i<=13; i++) {
        const field = Object.values(person)[i+1]; 
        document.getElementById('data' + i).innerText = field || '-';
    }

    askAI(person.name);

    fetchWikipedia(person.name); // Τραβάει το κείμενο από τη Wiki
}

async function askAI(name) {
    const aiBox = document.getElementById('aiResult');
    // ΕΦΕ LOADING
    aiBox.innerHTML = `<div class="loading-ai">Η AI αναζητά πληροφορίες για τον ${name}...</div>`;

    try {
        const response = await fetch('https://person-lookup-api.gtetsi.workers.dev/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name })
        });
        
        const data = await response.json();
        // Μετατρέπει τα **κείμενο** σε <b>κείμενο</b> για να φαίνονται έντονα
        let formattedText = data.text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        aiBox.innerHTML = formattedText;

    } catch (err) {
        // ΚΡΥΦΟ ΣΦΑΛΜΑ ΓΙΑ ΤΟΝ ΧΡΗΣΤΗ - ΦΑΝΕΡΟ ΣΤΟ F12
        console.error("AI DEBUG ERROR:", err);
        aiBox.innerText = "Η υπηρεσία AI δεν είναι διαθέσιμη. Παρακαλώ δοκιμάστε ξανά σε λίγο.";
    }
}

function showTab(tabName) {
    // Απόκρυψη όλων των περιεχομένων
    document.getElementById('ai-content').style.display = 'none';
    document.getElementById('wiki-content').style.display = 'none';
    
    // Αφαίρεση active class από τα κουμπιά
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // Εμφάνιση του επιλεγμένου
    document.getElementById(tabName + '-content').style.display = 'block';
    event.currentTarget.classList.add('active');
}




function toggleTheme() {
    document.body.classList.toggle('light-mode');
}

async function fetchWikipedia(name) {
    const wikiBody = document.getElementById('wiki-body');
    wikiBody.innerHTML = "Αναζήτηση στην Wikipedia...";

    try {
        // Χρησιμοποιούμε το API της Wikipedia για να πάρουμε το "Parse" (επεξεργασμένο) περιεχόμενο
        const url = `https://el.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(name)}&format=json&origin=*&prop=text&section=0`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.parse && data.parse.text) {
            let cleanHtml = data.parse.text["*"];
            
            // Διορθώνουμε τα links για να ανοίγουν σε νέο παράθυρο και να δείχνουν στην κανονική Wiki
            cleanHtml = cleanHtml.replace(/href="\/wiki\//g, 'target="_blank" href="https://el.wikipedia.org/wiki/');
            
            wikiBody.innerHTML = cleanHtml;
        } else {
            wikiBody.innerHTML = "Δεν βρέθηκε λήμμα στην Wikipedia για αυτό το όνομα.";
        }
    } catch (err) {
        wikiBody.innerHTML = "Σφάλμα κατά τη σύνδεση με την Wikipedia.";
    }
}
