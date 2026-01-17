/**
 * Family Tree Lines Drawing Script
 * Draws direct connecting lines on hover to show relationships
 * Lines pass over all tiles between source and destination
 */

// Listen for when family tree is generated from GEDCOM
document.addEventListener('familyTreeGenerated', function() {
    setupHoverLines();
    updateSVGSize();
});

// Also set up on DOMContentLoaded for backward compatibility
document.addEventListener('DOMContentLoaded', function() {
    setupHoverLines();
    
    // Update SVG size on window resize
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateSVGSize, 250);
    });
    
    updateSVGSize();
});

function updateSVGSize() {
    const svg = document.querySelector('.tree-lines');
    if (!svg) return;
    
    const container = document.querySelector('.tree-container');
    const containerRect = container.getBoundingClientRect();
    
    // Set SVG dimensions
    svg.setAttribute('width', containerRect.width);
    svg.setAttribute('height', containerRect.height);
}

function setupHoverLines() {
    const members = document.querySelectorAll('.family-member');
    
    members.forEach(member => {
        member.addEventListener('mouseenter', function() {
            showConnectionLines(member);
        });
        
        member.addEventListener('mouseleave', function() {
            clearConnectionLines();
        });
    });
}

function showConnectionLines(member) {
    const svg = document.querySelector('.tree-lines');
    if (!svg) return;
    
    // Clear any existing hover lines
    clearConnectionLines();
    
    const container = document.querySelector('.tree-container');
    const containerRect = container.getBoundingClientRect();
    const memberRect = member.getBoundingClientRect();
    
    const memberX = memberRect.left + memberRect.width / 2 - containerRect.left;
    const memberY = memberRect.top + memberRect.height / 2 - containerRect.top;
    
    // Draw lines to spouses
    drawSpouseLines(svg, member, memberX, memberY, memberRect, containerRect);
    
    // Draw lines to parents
    drawParentLines(svg, member, memberX, memberY, containerRect);
    
    // Draw lines to children
    drawChildLines(svg, member, memberX, memberY, containerRect);
}

function drawSpouseLines(svg, member, memberX, memberY, memberRect, containerRect) {
    let spouses = [];
    
    // Check for old data-spouse format
    const spouseId = member.getAttribute('data-spouse');
    if (spouseId) {
        spouses.push({id: spouseId, status: 'married'});
    }
    
    // Check for new data-marriages format
    const marriagesAttr = member.getAttribute('data-marriages');
    if (marriagesAttr) {
        try {
            const marriages = JSON.parse(marriagesAttr);
            marriages.forEach(marriage => {
                spouses.push({id: marriage.spouse, status: marriage.status});
            });
        } catch (e) {
            console.error('Error parsing marriages data', e);
        }
    }
    
    spouses.forEach(spouseInfo => {
        const spouse = document.getElementById(spouseInfo.id);
        if (!spouse) return;
        
        const spouseRect = spouse.getBoundingClientRect();
        // Skip if element has no dimensions (not rendered)
        if (spouseRect.width === 0 || spouseRect.height === 0) return;
        
        const spouseX = spouseRect.left + spouseRect.width / 2 - containerRect.left;
        const spouseY = spouseRect.top + spouseRect.height / 2 - containerRect.top;
        
        // Adjust Y position based on marriage status to prevent overlapping lines
        let memberYAdjusted = memberY;
        let spouseYAdjusted = spouseY;
        const offset = memberRect.height * 0.25; // 25% of tile height
        
        if (spouseInfo.status === 'divorced') {
            // Divorced lines above center
            memberYAdjusted = memberY - offset;
            spouseYAdjusted = spouseY - offset;
        } else if (spouseInfo.status === 'widowed') {
            // Widowed lines below center
            memberYAdjusted = memberY + offset;
            spouseYAdjusted = spouseY + offset;
        }
        // married status stays at center (no adjustment)
        
        // Draw direct line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', memberX);
        line.setAttribute('y1', memberYAdjusted);
        line.setAttribute('x2', spouseX);
        line.setAttribute('y2', spouseYAdjusted);
        
        // Set class based on marriage status
        let lineClass = 'hover-line spouse-hover-line';
        if (spouseInfo.status === 'married') {
            lineClass += ' married-hover';
        } else if (spouseInfo.status === 'divorced') {
            lineClass += ' divorced-hover';
        } else if (spouseInfo.status === 'widowed') {
            lineClass += ' widowed-hover';
        }
        
        line.setAttribute('class', lineClass);
        svg.appendChild(line);
    });
}

function drawParentLines(svg, member, memberX, memberY, containerRect) {
    const parentsAttr = member.getAttribute('data-parents');
    if (!parentsAttr) return;
    
    const parentIds = parentsAttr.split(',').map(id => id.trim());
    
    parentIds.forEach(parentId => {
        const parent = document.getElementById(parentId);
        if (!parent) return;
        
        const parentRect = parent.getBoundingClientRect();
        // Skip if element has no dimensions (not rendered)
        if (parentRect.width === 0 || parentRect.height === 0) return;
        
        const parentX = parentRect.left + parentRect.width / 2 - containerRect.left;
        const parentY = parentRect.top + parentRect.height / 2 - containerRect.top;
        
        // Draw direct line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', memberX);
        line.setAttribute('y1', memberY);
        line.setAttribute('x2', parentX);
        line.setAttribute('y2', parentY);
        line.setAttribute('class', 'hover-line parent-hover-line');
        svg.appendChild(line);
    });
}

function drawChildLines(svg, member, memberX, memberY, containerRect) {
    const childrenAttr = member.getAttribute('data-children');
    if (!childrenAttr) return;
    
    const childIds = childrenAttr.split(',').map(id => id.trim());
    
    childIds.forEach(childId => {
        const child = document.getElementById(childId);
        if (!child) return;
        
        const childRect = child.getBoundingClientRect();
        // Skip if element has no dimensions (not rendered)
        if (childRect.width === 0 || childRect.height === 0) return;
        
        const childX = childRect.left + childRect.width / 2 - containerRect.left;
        const childY = childRect.top + childRect.height / 2 - containerRect.top;
        
        // Draw direct line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', memberX);
        line.setAttribute('y1', memberY);
        line.setAttribute('x2', childX);
        line.setAttribute('y2', childY);
        line.setAttribute('class', 'hover-line child-hover-line');
        svg.appendChild(line);
    });
}

function clearConnectionLines() {
    const svg = document.querySelector('.tree-lines');
    if (!svg) return;
    
    // Remove all hover lines
    const hoverLines = svg.querySelectorAll('.hover-line');
    hoverLines.forEach(line => line.remove());
}
