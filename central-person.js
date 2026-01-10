/**
 * Central Person Navigation Script
 * Shows only the central person, their spouses, parents, and children
 * Clicking on any person makes them the new central person
 */

let currentCentralPerson = null;
let allPeopleData = [];

/**
 * Initialize search functionality
 */
function initializeSearch() {
    const searchInput = document.getElementById('person-search');
    const searchResults = document.getElementById('search-results');
    
    if (!searchInput || !searchResults) return;
    
    // Build searchable data from all family members
    const members = document.querySelectorAll('.family-member');
    allPeopleData = Array.from(members).map(member => {
        const name = member.querySelector('h3')?.textContent || '';
        const relation = member.querySelector('.relation')?.textContent || '';
        const years = member.querySelector('.years')?.textContent || '';
        return {
            id: member.id,
            name: name,
            relation: relation,
            years: years,
            searchText: `${name} ${relation} ${years}`.toLowerCase()
        };
    });
    
    // Search on input
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        
        if (query.length === 0) {
            searchResults.innerHTML = '';
            searchResults.classList.remove('active');
            return;
        }
        
        // Filter people
        const matches = allPeopleData.filter(person => 
            person.searchText.includes(query)
        ).slice(0, 10); // Limit to 10 results
        
        if (matches.length === 0) {
            searchResults.innerHTML = '<div class="search-result no-results">No matches found</div>';
            searchResults.classList.add('active');
            return;
        }
        
        // Display results
        searchResults.innerHTML = matches.map(person => `
            <div class="search-result" data-person-id="${person.id}">
                <div class="search-result-name">${person.name}</div>
                <div class="search-result-details">${person.relation} ${person.years}</div>
            </div>
        `).join('');
        searchResults.classList.add('active');
        
        // Add click handlers to results
        searchResults.querySelectorAll('.search-result[data-person-id]').forEach(result => {
            result.addEventListener('click', function() {
                const personId = this.getAttribute('data-person-id');
                setCurrentCentralPerson(personId);
                searchInput.value = '';
                searchResults.innerHTML = '';
                searchResults.classList.remove('active');
                
                // Scroll to tree
                document.getElementById('family-tree')?.scrollIntoView({ behavior: 'smooth' });
            });
        });
    });
    
    // Close results when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.remove('active');
        }
    });
}

// Listen for when family tree is generated from GEDCOM
document.addEventListener('familyTreeGenerated', function() {
    initializeCentralPersonView();
    initializeSearch();
});

// Also set up on DOMContentLoaded for backward compatibility
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure other scripts have initialized
    setTimeout(() => {
        initializeCentralPersonView();
        initializeSearch();
    }, 100);
});

/**
 * Initialize the central person view
 */
function initializeCentralPersonView() {
    const members = document.querySelectorAll('.family-member');
    if (members.length === 0) return;
    
    // Set Martin Lee Porter as initial central person
    const initialPerson = document.getElementById('i_949871576') || members[0];
    if (initialPerson) {
        setCurrentCentralPerson(initialPerson.id);
    }
    
    // Add details button to all family members
    members.forEach(member => {
        if (!member.querySelector('.details-btn')) {
            const detailsBtn = document.createElement('button');
            detailsBtn.className = 'details-btn';
            detailsBtn.textContent = 'Details';
            detailsBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                console.log('Details button clicked for:', member.id);
                if (window.showPersonDetails) {
                    window.showPersonDetails(member.id);
                } else {
                    console.error('showPersonDetails function not found');
                }
            });
            member.appendChild(detailsBtn);
        }
        
        member.addEventListener('click', function(e) {
            // Don't interfere with links or buttons inside the member
            if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;
            
            setCurrentCentralPerson(member.id);
        });
        
        // Add cursor pointer to indicate clickability
        member.style.cursor = 'pointer';
    });
}

/**
 * Set the current central person and update visibility
 * @param {string} personId - ID of the person to make central
 */
function setCurrentCentralPerson(personId) {
    currentCentralPerson = personId;
    updateVisibility();
    updateTreeLines();
}

/**
 * Update visibility of all family members based on central person
 */
function updateVisibility() {
    if (!currentCentralPerson) return;
    
    const centralElement = document.getElementById(currentCentralPerson);
    if (!centralElement) return;
    
    // Get IDs of people who should be visible
    const visibleIds = new Set();
    
    // Add central person
    visibleIds.add(currentCentralPerson);
    
    // Add spouses
    const spouses = getSpouses(centralElement);
    spouses.forEach(id => visibleIds.add(id));
    
    // Add parents
    const parents = getParents(centralElement);
    parents.forEach(id => visibleIds.add(id));
    
    // Add children
    const children = getChildren(centralElement);
    children.forEach(id => visibleIds.add(id));
    
    // Hide all generations first
    const allGenerations = document.querySelectorAll('.generation');
    allGenerations.forEach(gen => gen.classList.add('hidden-generation'));
    
    // Update visibility of all members
    const allMembers = document.querySelectorAll('.family-member');
    allMembers.forEach(member => {
        if (visibleIds.has(member.id)) {
            member.classList.remove('hidden-member');
            member.classList.add('visible-member');
            
            // Highlight central person
            if (member.id === currentCentralPerson) {
                member.classList.add('central-person');
            } else {
                member.classList.remove('central-person');
            }
        } else {
            member.classList.add('hidden-member');
            member.classList.remove('visible-member', 'central-person');
        }
    });
    
    // Reorganize visible members into custom rows
    reorganizeVisibleMembers(centralElement, parents, spouses, children);
}

/**
 * Reorganize visible members into custom row layout
 * Row 1: Parents, Row 2: Central + Spouses, Row 3+: Children
 */
function reorganizeVisibleMembers(centralElement, parentIds, spouseIds, childIds) {
    const treeContainer = document.querySelector('.tree-container');
    if (!treeContainer) return;
    
    // Remove any existing custom layout
    const existingCustomLayout = document.getElementById('central-person-layout');
    if (existingCustomLayout) {
        existingCustomLayout.remove();
    }
    
    // Create new layout container
    const layoutContainer = document.createElement('div');
    layoutContainer.id = 'central-person-layout';
    layoutContainer.className = 'central-person-layout';
    
    // Create parent row
    if (parentIds.length > 0) {
        const parentRow = document.createElement('div');
        parentRow.className = 'central-row parents-row';
        
        parentIds.forEach(parentId => {
            const parentElement = document.getElementById(parentId);
            if (parentElement) {
                parentRow.appendChild(parentElement.cloneNode(true));
            }
        });
        
        layoutContainer.appendChild(parentRow);
    }
    
    // Create central person + spouses row
    const centralRow = document.createElement('div');
    centralRow.className = 'central-row central-spouses-row';
    centralRow.appendChild(centralElement.cloneNode(true));
    
    spouseIds.forEach(spouseId => {
        const spouseElement = document.getElementById(spouseId);
        if (spouseElement) {
            centralRow.appendChild(spouseElement.cloneNode(true));
        }
    });
    
    layoutContainer.appendChild(centralRow);
    
    // Create children rows
    if (childIds.length > 0) {
        const childrenRow = document.createElement('div');
        childrenRow.className = 'central-row children-row';
        
        childIds.forEach(childId => {
            const childElement = document.getElementById(childId);
            if (childElement) {
                childrenRow.appendChild(childElement.cloneNode(true));
            }
        });
        
        layoutContainer.appendChild(childrenRow);
    }
    
    // Insert the custom layout before the SVG
    const svg = treeContainer.querySelector('.tree-lines');
    if (svg) {
        treeContainer.insertBefore(layoutContainer, svg);
    } else {
        treeContainer.insertBefore(layoutContainer, treeContainer.firstChild);
    }
    
    // Re-attach click handlers and hover handlers to cloned elements
    const clonedMembers = layoutContainer.querySelectorAll('.family-member');
    clonedMembers.forEach(member => {
        // Add details button if not present
        if (!member.querySelector('.details-btn')) {
            const detailsBtn = document.createElement('button');
            detailsBtn.className = 'details-btn';
            detailsBtn.textContent = 'Details';
            detailsBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                console.log('Cloned details button clicked for:', member.id);
                if (window.showPersonDetails) {
                    window.showPersonDetails(member.id);
                } else {
                    console.error('showPersonDetails function not found');
                }
            });
            member.appendChild(detailsBtn);
        } else {
            // Re-attach handler to existing button
            const detailsBtn = member.querySelector('.details-btn');
            detailsBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                console.log('Existing details button clicked for:', member.id);
                if (window.showPersonDetails) {
                    window.showPersonDetails(member.id);
                } else {
                    console.error('showPersonDetails function not found');
                }
            });
        }
        
        member.addEventListener('click', function(e) {
            if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;
            setCurrentCentralPerson(member.id);
        });
        member.style.cursor = 'pointer';
        
        // Add hover handlers for connection lines (if tree-lines.js functions are available)
        if (typeof showConnectionLines === 'function') {
            member.addEventListener('mouseenter', function() {
                showConnectionLines(member);
            });
            
            member.addEventListener('mouseleave', function() {
                clearConnectionLines();
            });
        }
    });
}

/**
 * Get spouse IDs from a family member element
 * @param {HTMLElement} element - Family member element
 * @returns {Array<string>} Array of spouse IDs
 */
function getSpouses(element) {
    const marriages = element.getAttribute('data-marriages');
    if (!marriages) return [];
    
    try {
        const marriageData = JSON.parse(marriages);
        return marriageData.map(m => m.spouse).filter(id => id);
    } catch (e) {
        console.error('Error parsing marriages data:', e);
        return [];
    }
}

/**
 * Get parent IDs from a family member element
 * @param {HTMLElement} element - Family member element
 * @returns {Array<string>} Array of parent IDs
 */
function getParents(element) {
    const parents = element.getAttribute('data-parents');
    if (!parents) return [];
    
    return parents.split(',').map(id => id.trim()).filter(id => id);
}

/**
 * Get child IDs from a family member element
 * @param {HTMLElement} element - Family member element
 * @returns {Array<string>} Array of child IDs
 */
function getChildren(element) {
    const children = element.getAttribute('data-children');
    if (!children) return [];
    
    return children.split(',').map(id => id.trim()).filter(id => id);
}

/**
 * Update tree lines to reflect current visibility
 */
function updateTreeLines() {
    // Clear existing lines
    const svg = document.querySelector('.tree-lines');
    if (svg) {
        svg.innerHTML = '';
    }
    
    // Redraw lines for visible members
    // This will trigger the existing tree-lines.js logic if needed
    const event = new CustomEvent('visibilityChanged');
    document.dispatchEvent(event);
}
