/**
 * Family Tree Lines Drawing Script
 * Draws connecting lines between family members to show relationships
 * Uses simple Manhattan routing (horizontal and vertical lines only)
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
    
    // Draw spouse connections (horizontal lines only - same Y level)
    drawSpouseConnections(svg, containerRect);
    
    // Draw parent-child connections (Manhattan routing)
    drawParentChildConnections(svg, containerRect);
}

function drawSpouseConnections(svg, containerRect) {
    // Handle both old data-spouse format and new data-marriages format
    const members = document.querySelectorAll('.family-member[data-spouse], .family-member[data-marriages]');
    const drawnPairs = new Set();
    
    // Collect all member positions as potential obstacles
    const allMembers = document.querySelectorAll('.family-member');
    const obstacles = [];
    allMembers.forEach(m => {
        const rect = m.getBoundingClientRect();
        obstacles.push({
            id: m.id,
            left: rect.left - containerRect.left,
            right: rect.right - containerRect.left,
            top: rect.top - containerRect.top,
            bottom: rect.bottom - containerRect.top
        });
    });
    
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
                const validStatuses = ['married', 'widowed', 'divorced'];
                marriages.forEach(marriage => {
                    if (validStatuses.includes(marriage.status)) {
                        spousesToDraw.push({id: marriage.spouse, status: marriage.status});
                    }
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
            
            // Check if there's an obstacle between spouses
            const minX = Math.min(x1, x2);
            const maxX = Math.max(x1, x2);
            let hasObstacle = false;
            
            for (const obs of obstacles) {
                // Skip the spouses themselves
                if (obs.id === member.id || obs.id === spouseInfo.id) continue;
                
                // Check if obstacle is between spouses horizontally and overlaps Y level
                if (obs.left < maxX && obs.right > minX && 
                    obs.top < y1 + 10 && obs.bottom > y1 - 10) {
                    hasObstacle = true;
                    break;
                }
            }
            
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let pathData;
            
            if (hasObstacle) {
                // Route around: go down, across, then back up to same Y level
                // Route below the cards to stay within visible area
                const routeY = Math.max(memberRect.bottom, spouseRect.bottom) - containerRect.top + 20;
                // Both spouses should be at same Y level, use y1
                pathData = `M ${x1},${y1} L ${x1},${routeY} L ${x2},${routeY} L ${x2},${y1}`;
            } else {
                // Simple horizontal line at same Y level
                pathData = `M ${x1},${y1} L ${x2},${y1}`;
            }
            
            path.setAttribute('d', pathData);
            
            // Set class based on marriage status
            let lineClass = 'spouse-line';
            if (spouseInfo.status === 'divorced') {
                lineClass += ' divorced-line';
            } else if (spouseInfo.status === 'widowed') {
                lineClass += ' widowed-line';
            } else if (spouseInfo.status === 'married') {
                lineClass += ' married-line';
            } else {
                console.warn(`Unexpected marriage status '${spouseInfo.status}' for ${member.id}`);
                lineClass += ' married-line';
            }
            
            path.setAttribute('class', lineClass);
            svg.appendChild(path);
        });
    });
}

function drawParentChildConnections(svg, containerRect) {
    const children = document.querySelectorAll('.family-member[data-parents]');
    
    // Collect all member positions as potential obstacles
    const allMembers = document.querySelectorAll('.family-member');
    const obstacles = [];
    allMembers.forEach(m => {
        const rect = m.getBoundingClientRect();
        obstacles.push({
            id: m.id,
            left: rect.left - containerRect.left,
            right: rect.right - containerRect.left,
            top: rect.top - containerRect.top,
            bottom: rect.bottom - containerRect.top
        });
    });
    
    // Group children by their parents to identify shared routes
    const parentChildGroups = new Map();
    
    children.forEach(child => {
        const parentsAttr = child.getAttribute('data-parents');
        if (!parentsAttr) return;
        
        const parentIds = parentsAttr.split(',').map(id => id.trim()).sort().join(',');
        if (!parentChildGroups.has(parentIds)) {
            parentChildGroups.set(parentIds, []);
        }
        parentChildGroups.get(parentIds).push(child);
    });
    
    // Draw connections for each parent-child group
    parentChildGroups.forEach((childrenList, parentIds) => {
        const parentIdArray = parentIds.split(',');
        const parents = parentIdArray.map(id => document.getElementById(id)).filter(p => p);
        
        if (parents.length === 0) return;
        
        // Calculate parent connection point
        let parentX, parentBottom;
        const parentRects = parents.map(p => p.getBoundingClientRect());
        
        if (parents.length === 1) {
            const parentRect = parentRects[0];
            parentX = parentRect.left + parentRect.width / 2 - containerRect.left;
            parentBottom = parentRect.bottom - containerRect.top;
        } else {
            // Use midpoint between first two parents
            const parent1Rect = parentRects[0];
            const parent2Rect = parentRects[1];
            parentX = (parent1Rect.left + parent1Rect.width / 2 + parent2Rect.left + parent2Rect.width / 2) / 2 - containerRect.left;
            parentBottom = Math.max(parent1Rect.bottom, parent2Rect.bottom) - containerRect.top;
        }
        
        // Calculate routing level - must be below any obstacles between parent and children
        const childrenWithPos = childrenList.map(child => {
            const rect = child.getBoundingClientRect();
            return {
                element: child,
                id: child.id,
                x: rect.left + rect.width / 2 - containerRect.left,
                top: rect.top - containerRect.top
            };
        });
        
        const minChildTop = Math.min(...childrenWithPos.map(c => c.top));
        
        // Find all obstacles that are truly BETWEEN parent and children vertically
        // Not just overlapping, but with top clearly below parent and bottom clearly above children
        const minX = Math.min(parentX, ...childrenWithPos.map(c => c.x));
        const maxX = Math.max(parentX, ...childrenWithPos.map(c => c.x));
        let maxObstacleBottom = parentBottom;
        
        for (const obs of obstacles) {
            // Skip parents and children themselves
            if (parentIdArray.includes(obs.id) || childrenWithPos.some(c => c.id === obs.id)) continue;
            
            // Check if obstacle is truly in the routing region:
            // - Obstacle top must be clearly below parent bottom (not just touching)
            // - Obstacle bottom must be clearly above child top (not just touching)  
            // - Must horizontally overlap the routing path
            if (obs.top > parentBottom + 10 && obs.bottom < minChildTop - 10 &&
                obs.right > minX - 20 && obs.left < maxX + 20) {
                maxObstacleBottom = Math.max(maxObstacleBottom, obs.bottom);
            }
        }
        
        // Set routing level below all obstacles with clearance, or at midpoint if no obstacles
        const routingY = maxObstacleBottom > parentBottom ? maxObstacleBottom + 20 : (parentBottom + minChildTop) / 2;
        
        // Draw vertical line from parent down to routing level
        const parentVerticalPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const parentVerticalData = `M ${parentX},${parentBottom} L ${parentX},${routingY}`;
        parentVerticalPath.setAttribute('d', parentVerticalData);
        parentVerticalPath.setAttribute('class', 'parent-child-line');
        svg.appendChild(parentVerticalPath);
        
        // Draw connections to each child with parallel routing offsets
        childrenWithPos.forEach((childInfo, index) => {
            const childX = childInfo.x;
            const childTop = childInfo.top;
            
            // Add small vertical offset for parallel lines to improve clarity
            // Lines going in same direction get slightly different Y positions
            const parallelOffset = index * 3; // 3px spacing between parallel horizontal segments
            const horizontalY = routingY + parallelOffset;
            
            // Simple Manhattan routing: down from parent, across at offset level, down to child
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const pathData = `M ${parentX},${routingY} L ${parentX},${horizontalY} L ${childX},${horizontalY} L ${childX},${childTop}`;
            path.setAttribute('d', pathData);
            path.setAttribute('class', 'parent-child-line');
            svg.appendChild(path);
        });
        
        // Add solder joint where child lines branch from parent's vertical line
        if (childrenWithPos.length > 0) {
            const joint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            joint.setAttribute('cx', parentX);
            joint.setAttribute('cy', routingY);
            joint.setAttribute('r', 3);  // Reduced from 4 to 3 for better clarity
            joint.setAttribute('class', 'solder-joint');
            svg.appendChild(joint);
        }
    });
}
