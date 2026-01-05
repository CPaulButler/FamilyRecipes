/**
 * Family Tree Generator from GEDCOM
 * Loads GEDCOM data and dynamically generates the family tree
 */

let gedcomParser = null;
let gedcomData = null;
let initializationPromise = null;
let generationMap = new Map(); // Computed generation for each individual
let generationGroups = {}; // Individuals grouped by generation

// Fallback year for sorting individuals without birth dates
const FALLBACK_YEAR = '9999';

/**
 * Compute generation number for each individual
 * Uses BFS from individuals with no parents (root generation)
 */
function computeGenerations() {
    generationMap.clear();
    generationGroups = {};
    
    if (!gedcomParser) return;
    
    const individuals = gedcomParser.getIndividuals();
    const visited = new Set();
    const queue = [];
    
    // Find root individuals (those with no parents AND have children)
    // This helps identify the actual starting generation
    const roots = [];
    for (const [id, individual] of individuals) {
        const parents = gedcomParser.getParents(id);
        const children = gedcomParser.getChildren(id);
        if (parents.length === 0 && children.length > 0) {
            roots.push(id);
        }
    }
    
    // If we found roots with children, start from them
    if (roots.length > 0) {
        for (const id of roots) {
            generationMap.set(id, 1);
            queue.push({ id, generation: 1 });
            visited.add(id);
        }
    } else {
        // Fallback: find individuals with no parents
        for (const [id, individual] of individuals) {
            const parents = gedcomParser.getParents(id);
            if (parents.length === 0) {
                generationMap.set(id, 1);
                queue.push({ id, generation: 1 });
                visited.add(id);
            }
        }
    }
    
    // BFS to assign generations based on parent-child relationships
    while (queue.length > 0) {
        const { id, generation } = queue.shift();
        
        // Add to generation groups
        if (!generationGroups[generation]) {
            generationGroups[generation] = [];
        }
        if (!generationGroups[generation].includes(id)) {
            generationGroups[generation].push(id);
        }
        
        // Process children
        const children = gedcomParser.getChildren(id);
        for (const childId of children) {
            if (!visited.has(childId)) {
                const childGeneration = generation + 1;
                generationMap.set(childId, childGeneration);
                queue.push({ id: childId, generation: childGeneration });
                visited.add(childId);
            }
        }
        
        // Also process spouses and put them in the same generation
        const spouses = gedcomParser.getSpouses(id);
        for (const spouseInfo of spouses) {
            const spouseId = spouseInfo.id;
            if (!visited.has(spouseId)) {
                generationMap.set(spouseId, generation);
                queue.push({ id: spouseId, generation: generation });
                visited.add(spouseId);
            }
        }
    }
    
    // Handle any individuals not reached (orphaned records)
    for (const [id, individual] of individuals) {
        if (!visited.has(id)) {
            // Assign to a default generation based on parents if they exist
            const parents = gedcomParser.getParents(id);
            if (parents.length > 0) {
                const parentGen = generationMap.get(parents[0]) || 1;
                const generation = parentGen + 1;
                generationMap.set(id, generation);
                if (!generationGroups[generation]) {
                    generationGroups[generation] = [];
                }
                generationGroups[generation].push(id);
            } else {
                // Check if they have a spouse who has been assigned
                const spouses = gedcomParser.getSpouses(id);
                let assignedToGeneration = false;
                for (const spouseInfo of spouses) {
                    const spouseGen = generationMap.get(spouseInfo.id);
                    if (spouseGen) {
                        generationMap.set(id, spouseGen);
                        if (!generationGroups[spouseGen]) {
                            generationGroups[spouseGen] = [];
                        }
                        generationGroups[spouseGen].push(id);
                        assignedToGeneration = true;
                        break;
                    }
                }
                
                // Assign to generation 1 as fallback
                if (!assignedToGeneration) {
                    generationMap.set(id, 1);
                    if (!generationGroups[1]) {
                        generationGroups[1] = [];
                    }
                    generationGroups[1].push(id);
                }
            }
        }
    }
    
    // Sort individuals within each generation by family groups and birth date
    for (const generation in generationGroups) {
        generationGroups[generation].sort((a, b) => {
            const indivA = gedcomParser.getIndividual(a);
            const indivB = gedcomParser.getIndividual(b);
            
            // Try to group spouses together
            const spousesA = gedcomParser.getSpouses(a).map(s => s.id);
            const spousesB = gedcomParser.getSpouses(b).map(s => s.id);
            
            // If A is spouse of B, or B is spouse of A, keep them close
            if (spousesA.includes(b)) return -1;
            if (spousesB.includes(a)) return 1;
            
            // Otherwise sort by birth year
            const yearA = indivA.birthDate ? GedcomParser.extractYear(indivA.birthDate) : FALLBACK_YEAR;
            const yearB = indivB.birthDate ? GedcomParser.extractYear(indivB.birthDate) : FALLBACK_YEAR;
            
            return yearA.localeCompare(yearB);
        });
    }
}

/**
 * Generate a relation label for an individual based on their relationships
 */
function generateRelationLabel(gedcomId) {
    const individual = gedcomParser.getIndividual(gedcomId);
    if (!individual) return '';
    
    const parents = gedcomParser.getParents(gedcomId);
    const spouses = gedcomParser.getSpouses(gedcomId);
    
    // Try to build a meaningful label
    let label = '';
    
    // Check if married
    if (spouses.length > 0) {
        const spouseNames = spouses.map(s => {
            const spouseName = s.spouse.name.given ? s.spouse.name.given.split(' ')[0] : s.spouse.name.full;
            return spouseName;
        });
        
        if (spouses.length === 1) {
            const spouse = spouses[0].spouse;
            const spouseName = spouse.name.given ? spouse.name.given.split(' ')[0] : spouse.name.full;
            
            if (spouses[0].status === 'divorced') {
                label = `Former spouse of ${spouseName}`;
            } else if (spouses[0].status === 'widowed') {
                label = `Widow/Widower of ${spouseName}`;
            } else {
                label = `Spouse of ${spouseName}`;
            }
        } else if (spouses.length > 1) {
            // Multiple marriages
            const currentSpouse = spouses.find(s => s.status === 'married');
            if (currentSpouse) {
                const spouseName = currentSpouse.spouse.name.given ? 
                    currentSpouse.spouse.name.given.split(' ')[0] : 
                    currentSpouse.spouse.name.full;
                label = `Spouse of ${spouseName}`;
            } else {
                label = `${spouses.length} marriages`;
            }
        }
    }
    
    // Add parent information if available
    if (parents.length > 0) {
        const parentNames = parents.map(p => {
            const parent = gedcomParser.getIndividual(p);
            return parent && parent.name.given ? parent.name.given.split(' ')[0] : '';
        }).filter(n => n).join(' & ');
        
        if (parentNames) {
            label = `Child of ${parentNames}`;
        }
    }
    
    return label;
}

/**
 * Load and parse GEDCOM file
 */
async function loadGedcom() {
    try {
        const response = await fetch('family.ged');
        const content = await response.text();
        
        gedcomParser = new GedcomParser();
        gedcomParser.parse(content);
        
        // Compute generations after parsing
        computeGenerations();
        
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
    return GedcomParser.gedcomIdToHtmlId(gedcomId);
}

/**
 * Get GEDCOM ID for an HTML ID
 */
function getGedcomId(htmlId) {
    // Convert HTML ID back to GEDCOM format
    // HTML IDs are lowercased versions without @ symbols (e.g., "i1" from "@I1@")
    const gedcomId = `@${htmlId.toUpperCase()}@`;
    
    // Verify this individual exists
    if (gedcomParser && gedcomParser.getIndividual(gedcomId)) {
        return gedcomId;
    }
    
    return null;
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

    // Get the generations in sorted order
    const generationNumbers = Object.keys(generationGroups).map(Number).sort((a, b) => a - b);
    
    // Generate each generation
    for (const genNum of generationNumbers) {
        const genDiv = document.createElement('div');
        genDiv.className = 'generation';
        genDiv.setAttribute('data-generation', genNum);

        const individualsInGen = generationGroups[genNum] || [];
        
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
    relationP.textContent = generateRelationLabel(gedcomId);
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
