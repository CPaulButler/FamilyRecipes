/**
 * Family Tree Lines Drawing Script
 * Draws connecting lines between family members to show relationships
 */

document.addEventListener('DOMContentLoaded', function() {
    drawFamilyLines();
    
    // Redraw lines on window resize
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(drawFamilyLines, 250);
    });
});

function drawFamilyLines() {
    const svg = document.querySelector('.tree-lines');
    if (!svg) return;
    
    // Clear existing lines
    svg.innerHTML = '';
    
    const container = document.querySelector('.tree-container');
    const containerRect = container.getBoundingClientRect();
    
    // Set SVG dimensions
    svg.setAttribute('width', containerRect.width);
    svg.setAttribute('height', containerRect.height);
    
    // Draw spouse connections (horizontal lines)
    drawSpouseConnections(svg, containerRect);
    
    // Draw parent-child connections (vertical lines)
    drawParentChildConnections(svg, containerRect);
}

function drawSpouseConnections(svg, containerRect) {
    // Handle both old data-spouse format and new data-marriages format
    const members = document.querySelectorAll('.family-member[data-spouse], .family-member[data-marriages]');
    const drawnPairs = new Set();
    
    members.forEach(member => {
        let spousesToDraw = [];
        
        // Check for old data-spouse format
        const spouseId = member.getAttribute('data-spouse');
        if (spouseId) {
            spousesToDraw.push({id: spouseId, status: 'married'});
        }
        
        // Check for new data-marriages format
        const marriagesAttr = member.getAttribute('data-marriages');
        if (marriagesAttr) {
            try {
                const marriages = JSON.parse(marriagesAttr);
                // Draw lines for all marriages (married, widowed, and divorced)
                marriages.forEach(marriage => {
                    spousesToDraw.push({id: marriage.spouse, status: marriage.status});
                });
            } catch (e) {
                console.error('Error parsing marriages data for', member.id, e);
            }
        }
        
        spousesToDraw.forEach(spouseInfo => {
            const spouse = document.getElementById(spouseInfo.id);
            if (!spouse) return;
            
            // Create a unique pair identifier to avoid drawing twice
            const pairId = [member.id, spouseInfo.id].sort().join('-');
            if (drawnPairs.has(pairId)) return;
            drawnPairs.add(pairId);
            
            const memberRect = member.getBoundingClientRect();
            const spouseRect = spouse.getBoundingClientRect();
            
            // Calculate positions relative to container
            const x1 = memberRect.left + memberRect.width / 2 - containerRect.left;
            const y1 = memberRect.top + memberRect.height / 2 - containerRect.top;
            const x2 = spouseRect.left + spouseRect.width / 2 - containerRect.left;
            const y2 = spouseRect.top + spouseRect.height / 2 - containerRect.top;
            
            // Draw line between spouses with appropriate style based on status
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x1);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            
            // Set class based on marriage status
            let lineClass = 'spouse-line';
            if (spouseInfo.status === 'divorced') {
                lineClass += ' divorced-line';
            } else if (spouseInfo.status === 'widowed') {
                lineClass += ' widowed-line';
            } else {
                lineClass += ' married-line';
            }
            
            line.setAttribute('class', lineClass);
            svg.appendChild(line);
        });
    });
}

function drawParentChildConnections(svg, containerRect) {
    const children = document.querySelectorAll('.family-member[data-parents]');
    
    children.forEach(child => {
        const parentsAttr = child.getAttribute('data-parents');
        if (!parentsAttr) return; // Safety check
        
        const parentIds = parentsAttr.split(',');
        const parents = parentIds.map(id => document.getElementById(id.trim())).filter(p => p);
        
        if (parents.length === 0) return;
        
        const childRect = child.getBoundingClientRect();
        const childX = childRect.left + childRect.width / 2 - containerRect.left;
        const childTop = childRect.top - containerRect.top;
        
        // Calculate midpoint between parents
        let parentX, parentBottom;
        
        if (parents.length === 1) {
            const parentRect = parents[0].getBoundingClientRect();
            parentX = parentRect.left + parentRect.width / 2 - containerRect.left;
            parentBottom = parentRect.bottom - containerRect.top;
        } else {
            // Handle 2 or more parents - use first two
            const parent1Rect = parents[0].getBoundingClientRect();
            const parent2Rect = parents[1].getBoundingClientRect();
            parentX = (parent1Rect.left + parent1Rect.width / 2 + parent2Rect.left + parent2Rect.width / 2) / 2 - containerRect.left;
            parentBottom = Math.max(parent1Rect.bottom, parent2Rect.bottom) - containerRect.top;
        }
        
        // Draw path from parents to child
        const midY = parentBottom + (childTop - parentBottom) / 2;
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const pathData = `M ${parentX},${parentBottom} L ${parentX},${midY} L ${childX},${midY} L ${childX},${childTop}`;
        path.setAttribute('d', pathData);
        path.setAttribute('class', 'parent-child-line');
        svg.appendChild(path);
    });
}
