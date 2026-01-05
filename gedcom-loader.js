/**
 * Family Tree Generator from GEDCOM
 * Loads GEDCOM data and dynamically generates the family tree
 */

let gedcomParser = null;
let gedcomData = null;
let initializationPromise = null;

// Mapping of GEDCOM IDs to HTML IDs for consistency with existing site
const idMapping = {
    '@I1@': 'grandma-linda',
    '@I2@': 'martin',
    '@I3@': 'doris',
    '@I4@': 'mom-sarah',
    '@I5@': 'dad-robert',
    '@I6@': 'uncle-tom',
    '@I7@': 'uncle-tom-first-wife',
    '@I8@': 'aunt-linda',
    '@I9@': 'myself',
    '@I10@': 'brother-mike',
    '@I11@': 'cousin-jenny',
    '@I12@': 'jason-porter',
    '@I13@': 'mackenzie-porter'
};

// Reverse mapping for looking up GEDCOM IDs from HTML IDs
const reverseIdMapping = {};
for (const [gedcomId, htmlId] of Object.entries(idMapping)) {
    reverseIdMapping[htmlId] = gedcomId;
}

// Define generation assignments (which generation each person belongs to)
const generationAssignments = {
    '@I1@': 1,  // grandma-linda
    '@I2@': 1,  // martin
    '@I3@': 1,  // doris
    '@I4@': 2,  // mom-sarah
    '@I5@': 2,  // dad-robert
    '@I6@': 2,  // uncle-tom
    '@I7@': 2,  // uncle-tom-first-wife
    '@I8@': 2,  // aunt-linda
    '@I9@': 3,  // myself
    '@I10@': 3, // brother-mike
    '@I11@': 3, // cousin-jenny
    '@I12@': 3, // jason-porter
    '@I13@': 3  // mackenzie-porter
};

// Define display order within each generation
const displayOrder = {
    1: ['@I1@', '@I3@', '@I2@'],
    2: ['@I4@', '@I5@', '@I7@', '@I6@', '@I8@'],
    3: ['@I9@', '@I10@', '@I11@', '@I12@', '@I13@']
};

// Custom relation labels for each person
const relationLabels = {
    '@I1@': 'Second wife of Martin',
    '@I2@': 'Patriarch',
    '@I3@': 'First wife of Martin',
    '@I4@': 'Daughter of Doris & Martin',
    '@I5@': 'Son-in-law',
    '@I6@': 'Son of Doris & Martin',
    '@I7@': 'First wife of Tom',
    '@I8@': 'Second wife of Tom',
    '@I9@': 'Daughter of Sarah & Robert',
    '@I10@': 'Son of Sarah & Robert',
    '@I11@': 'Daughter of Tom & Patricia',
    '@I12@': 'Son of Doris & Martin',
    '@I13@': 'Daughter of Doris & Martin'
};

/**
 * Load and parse GEDCOM file
 */
async function loadGedcom() {
    try {
        const response = await fetch('family.ged');
        const content = await response.text();
        
        gedcomParser = new GedcomParser();
        gedcomParser.parse(content);
        
        return gedcomParser;
    } catch (error) {
        console.error('Error loading GEDCOM file:', error);
        return null;
    }
}

/**
 * Get HTML ID for a GEDCOM individual
 */
function getHtmlId(gedcomId) {
    return idMapping[gedcomId] || GedcomParser.gedcomIdToHtmlId(gedcomId);
}

/**
 * Get GEDCOM ID for an HTML ID
 */
function getGedcomId(htmlId) {
    return reverseIdMapping[htmlId] || null;
}

/**
 * Generate family tree HTML from GEDCOM data
 */
function generateFamilyTree() {
    if (!gedcomParser) return;

    const treeContainer = document.querySelector('.tree-container');
    if (!treeContainer) return;

    // Clear existing generations (keep SVG)
    const generations = treeContainer.querySelectorAll('.generation');
    generations.forEach(gen => gen.remove());

    // Generate each generation
    for (let genNum = 1; genNum <= 3; genNum++) {
        const genDiv = document.createElement('div');
        genDiv.className = 'generation';
        genDiv.setAttribute('data-generation', genNum);

        const individualsInGen = displayOrder[genNum] || [];
        
        for (const gedcomId of individualsInGen) {
            const individual = gedcomParser.getIndividual(gedcomId);
            if (!individual) continue;

            const htmlId = getHtmlId(gedcomId);
            const memberDiv = createFamilyMemberElement(individual, gedcomId, htmlId);
            genDiv.appendChild(memberDiv);
        }

        // Insert before the legend
        const legend = treeContainer.querySelector('.tree-legend');
        if (legend) {
            treeContainer.insertBefore(genDiv, legend);
        } else {
            treeContainer.appendChild(genDiv);
        }
    }
}

/**
 * Create a family member element
 */
function createFamilyMemberElement(individual, gedcomId, htmlId) {
    const div = document.createElement('div');
    div.className = 'family-member';
    div.id = htmlId;

    // Get marriages data
    const spouses = gedcomParser.getSpouses(gedcomId);
    const marriages = spouses.map(s => {
        const spouseHtmlId = getHtmlId(s.id);
        return {
            spouse: spouseHtmlId,
            start: GedcomParser.extractYear(s.marriageDate),
            end: s.divorceDate ? GedcomParser.extractYear(s.divorceDate) : undefined,
            status: s.status
        };
    });

    if (marriages.length > 0) {
        div.setAttribute('data-marriages', JSON.stringify(marriages));
    }

    // Get children
    const children = gedcomParser.getChildren(gedcomId);
    if (children.length > 0) {
        const childHtmlIds = children.map(c => getHtmlId(c));
        div.setAttribute('data-children', childHtmlIds.join(','));
    }

    // Get parents
    const parents = gedcomParser.getParents(gedcomId);
    if (parents.length > 0) {
        const parentHtmlIds = parents.map(p => getHtmlId(p));
        div.setAttribute('data-parents', parentHtmlIds.join(','));
    }

    // Create content
    const displayName = individual.name.given ? individual.name.given.split(' ')[0] : individual.name.full;
    const h3 = document.createElement('h3');
    h3.textContent = displayName;
    div.appendChild(h3);

    // Relation
    const relationP = document.createElement('p');
    relationP.className = 'relation';
    relationP.textContent = relationLabels[gedcomId] || '';
    div.appendChild(relationP);

    // Years
    const yearsP = document.createElement('p');
    yearsP.className = 'years';
    yearsP.textContent = GedcomParser.formatYears(individual.birthDate, individual.deathDate);
    div.appendChild(yearsP);

    return div;
}

/**
 * Initialize family tree from GEDCOM
 */
async function initializeFamilyTree() {
    // Return existing promise if already initializing
    if (initializationPromise) {
        return initializationPromise;
    }
    
    initializationPromise = (async () => {
        gedcomData = await loadGedcom();
        if (gedcomData) {
            generateFamilyTree();
            
            // Notify that family tree has been generated
            // This allows tree-lines.js to set up hover handlers
            const event = new CustomEvent('familyTreeGenerated');
            document.dispatchEvent(event);
        }
        return gedcomData;
    })();
    
    return initializationPromise;
}

// Make functions available globally
window.gedcomLoader = {
    initialize: initializeFamilyTree,
    getParser: () => gedcomParser,
    getHtmlId: getHtmlId,
    getGedcomId: getGedcomId
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFamilyTree);
} else {
    // DOM is already ready, initialize immediately
    initializeFamilyTree();
}
