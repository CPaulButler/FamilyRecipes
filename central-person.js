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
        
        // Get full name from GEDCOM data
        const personInfo = getPersonInfo(member.id);
        const fullName = personInfo ? personInfo.fullName || '' : '';
        
        return {
            id: member.id,
            name: name,
            fullName: fullName,
            relation: relation,
            years: years,
            searchText: `${name} ${fullName} ${relation} ${years}`.toLowerCase()
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
                
                // Find and display connection path from current central person
                if (currentCentralPerson && currentCentralPerson !== personId) {
                    const path = findConnectionPath(currentCentralPerson, personId);
                    displayConnectionPath(path);
                }
                
                setCurrentCentralPerson(personId);
                searchInput.value = '';
                searchResults.innerHTML = '';
                searchResults.classList.remove('active');
                
                // Scroll to tree
                document.getElementById('family-tree')?.scrollIntoView({ behavior: 'smooth' });
            });
        });
    });
    
    // Clear connection path when starting new search
    searchInput.addEventListener('focus', function() {
        clearConnectionPath();
    });
    
    // Close results when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.remove('active');
        }
    });
}

// Helper function to get person info from person-details.js
function getPersonInfo(personId) {
    if (typeof personData !== 'undefined' && personData[personId]) {
        return personData[personId];
    }
    return null;
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
 * Find path between two family members using BFS
 * @param {string} startId - Starting person ID
 * @param {string} endId - Ending person ID
 * @returns {Array<string>} Array of person IDs forming the path, or empty array if no path
 */
function findConnectionPath(startId, endId) {
    if (startId === endId) return [startId];
    
    const visited = new Set();
    const queue = [[startId]];
    visited.add(startId);
    
    while (queue.length > 0) {
        const path = queue.shift();
        const currentId = path[path.length - 1];
        const currentElement = document.getElementById(currentId);
        
        if (!currentElement) continue;
        
        // Get all connected people (parents, children, spouses)
        const connections = [
            ...getParents(currentElement),
            ...getChildren(currentElement),
            ...getSpouses(currentElement)
        ];
        
        for (const connectedId of connections) {
            if (visited.has(connectedId)) continue;
            
            const newPath = [...path, connectedId];
            
            if (connectedId === endId) {
                return newPath;
            }
            
            visited.add(connectedId);
            queue.push(newPath);
        }
    }
    
    return []; // No path found
}

/**
 * Determine relationship type between two people
 * @param {string} fromId - First person ID
 * @param {string} toId - Second person ID
 * @returns {string} Relationship type: 'parent', 'child', 'spouse-married', 'spouse-divorced', 'spouse-widowed'
 */
function getRelationshipType(fromId, toId) {
    const fromElement = document.getElementById(fromId);
    const toElement = document.getElementById(toId);
    
    if (!fromElement || !toElement) return 'unknown';
    
    // Check if toId is a parent of fromId
    const parents = getParents(fromElement);
    if (parents.includes(toId)) {
        return 'parent';
    }
    
    // Check if toId is a child of fromId
    const children = getChildren(fromElement);
    if (children.includes(toId)) {
        return 'child';
    }
    
    // Check if toId is a spouse of fromId
    const marriages = fromElement.getAttribute('data-marriages');
    if (marriages) {
        try {
            const marriageData = JSON.parse(marriages);
            const spouseData = marriageData.find(m => m.spouse === toId);
            if (spouseData) {
                if (spouseData.status === 'divorced') {
                    return 'spouse-divorced';
                } else if (spouseData.status === 'widowed' || spouseData.status === 'deceased') {
                    return 'spouse-widowed';
                } else {
                    return 'spouse-married';
                }
            }
        } catch (e) {
            console.error('Error parsing marriage data:', e);
        }
    }
    
    return 'unknown';
}

/**
 * Display connection path as visual breadcrumbs
 * @param {Array<string>} path - Array of person IDs
 */
function displayConnectionPath(path) {
    // Remove existing path if any
    const existingPath = document.getElementById('connection-path');
    if (existingPath) {
        existingPath.remove();
    }
    
    if (!path || path.length === 0) return;
    
    const searchContainer = document.querySelector('.person-search-container');
    if (!searchContainer) return;
    
    // Create path container
    const pathContainer = document.createElement('div');
    pathContainer.id = 'connection-path';
    pathContainer.className = 'connection-path';
    
    // Add path title
    const pathTitle = document.createElement('div');
    pathTitle.className = 'connection-path-title';
    pathTitle.textContent = 'Connection Path:';
    pathContainer.appendChild(pathTitle);
    
    // Create path icons container
    const iconsContainer = document.createElement('div');
    iconsContainer.className = 'connection-path-icons';
    
    path.forEach((personId, index) => {
        const personElement = document.getElementById(personId);
        if (!personElement) return;
        
        const personInfo = getPersonInfo(personId);
        const name = personElement.querySelector('h3')?.textContent || 'Unknown';
        const fullName = personInfo ? (personInfo.fullName || name) : name;
        
        // Create icon
        const icon = document.createElement('div');
        icon.className = 'connection-path-icon';
        icon.setAttribute('data-person-id', personId);
        icon.setAttribute('data-full-name', fullName);
        
        // Add initials to icon
        const initials = getInitials(name);
        icon.textContent = initials;
        
        // Highlight current central person
        if (personId === currentCentralPerson) {
            icon.classList.add('current-person');
        }
        
        // Add tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'connection-path-tooltip';
        tooltip.textContent = fullName;
        icon.appendChild(tooltip);
        
        // Add click handler
        icon.addEventListener('click', function() {
            setCurrentCentralPerson(personId);
            // Scroll to tree
            document.getElementById('family-tree')?.scrollIntoView({ behavior: 'smooth' });
        });
        
        iconsContainer.appendChild(icon);
        
        // Add arrow between icons (except after last one)
        if (index < path.length - 1) {
            const nextPersonId = path[index + 1];
            const relationshipType = getRelationshipType(personId, nextPersonId);
            
            const arrow = document.createElement('div');
            arrow.className = 'connection-path-arrow';
            arrow.classList.add(`relationship-${relationshipType}`);
            arrow.innerHTML = '→';
            
            // Add title for accessibility
            const relationshipLabel = relationshipType.replace('spouse-', '').replace('-', ' ');
            arrow.title = relationshipLabel.charAt(0).toUpperCase() + relationshipLabel.slice(1);
            
            iconsContainer.appendChild(arrow);
        }
    });
    
    pathContainer.appendChild(iconsContainer);
    
    // Insert after search container
    searchContainer.parentNode.insertBefore(pathContainer, searchContainer.nextSibling);
}

/**
 * Get initials from a name
 * @param {string} name - Person's name
 * @returns {string} Initials
 */
function getInitials(name) {
    const parts = name.split(' ').filter(p => p.length > 0);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Clear connection path display
 */
function clearConnectionPath() {
    const existingPath = document.getElementById('connection-path');
    if (existingPath) {
        existingPath.remove();
    }
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
