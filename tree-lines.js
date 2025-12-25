/**
 * Family Tree Lines Drawing Script
 * Draws connecting lines between family members to show relationships
 * Uses Manhattan routing to avoid tiles and prevent overlaps
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
    
    // Collect all family member rectangles for obstacle detection
    const obstacles = collectObstacles(containerRect);
    
    // Draw spouse connections (horizontal lines)
    drawSpouseConnections(svg, containerRect, obstacles);
    
    // Draw parent-child connections (vertical lines with Manhattan routing)
    drawParentChildConnections(svg, containerRect, obstacles);
}

/**
 * Collect all family member card positions as obstacles
 */
function collectObstacles(containerRect) {
    const members = document.querySelectorAll('.family-member');
    const obstacles = [];
    
    members.forEach(member => {
        const rect = member.getBoundingClientRect();
        obstacles.push({
            id: member.id,
            left: rect.left - containerRect.left,
            right: rect.right - containerRect.left,
            top: rect.top - containerRect.top,
            bottom: rect.bottom - containerRect.top,
            centerX: rect.left + rect.width / 2 - containerRect.left,
            centerY: rect.top + rect.height / 2 - containerRect.top
        });
    });
    
    return obstacles;
}

function drawSpouseConnections(svg, containerRect, obstacles) {
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
                // Draw lines for all valid marriages
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
            } else if (spouseInfo.status === 'married') {
                lineClass += ' married-line';
            } else {
                // Log warning for unexpected status
                console.warn(`Unexpected marriage status '${spouseInfo.status}' for ${member.id}, defaulting to married-line`);
                lineClass += ' married-line';
            }
            
            line.setAttribute('class', lineClass);
            svg.appendChild(line);
        });
    });
}

function drawParentChildConnections(svg, containerRect, obstacles) {
    const children = document.querySelectorAll('.family-member[data-parents]');
    
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
        
        // Sort children by x position for parallel routing
        const childrenWithPos = childrenList.map(child => {
            const rect = child.getBoundingClientRect();
            return {
                element: child,
                x: rect.left + rect.width / 2 - containerRect.left,
                top: rect.top - containerRect.top,
                rect: rect
            };
        }).sort((a, b) => a.x - b.x);
        
        // Constants for routing
        const MARGIN = 20; // Margin around obstacles
        const PARALLEL_SPACING = 10; // Spacing between parallel lines
        const DROP_DISTANCE = 50; // How far down from parent the horizontal routing level is
        
        // Vertical drop from parent to routing level
        const routingY = parentBottom + DROP_DISTANCE;
        
        // Draw vertical line from parent down to routing level
        const parentVerticalPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const parentVerticalData = `M ${parentX},${parentBottom} L ${parentX},${routingY}`;
        parentVerticalPath.setAttribute('d', parentVerticalData);
        parentVerticalPath.setAttribute('class', 'parent-child-line');
        svg.appendChild(parentVerticalPath);
        
        // Add solder joint at parent connection point (top of vertical line)
        addSolderJoint(svg, parentX, parentBottom);
        
        // Draw connections to each child with parallel routing
        childrenWithPos.forEach((childInfo, index) => {
            const childX = childInfo.x;
            const childTop = childInfo.top;
            
            // Route from the horizontal line level to the child
            const path = routeManhattanPath(
                parentX, routingY,
                childX, childTop,
                obstacles,
                MARGIN,
                index * PARALLEL_SPACING // Offset for parallel lines
            );
            
            const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            pathElement.setAttribute('d', path);
            pathElement.setAttribute('class', 'parent-child-line');
            svg.appendChild(pathElement);
        });
        
        // Add solder joint where child lines branch from parent's vertical line
        if (childrenWithPos.length > 0) {
            addSolderJoint(svg, parentX, routingY);
        }
    });
}

/**
 * Route a Manhattan path from start to end, avoiding obstacles
 */
function routeManhattanPath(startX, startY, endX, endY, obstacles, margin, parallelOffset) {
    const pathSegments = [];
    
    // Start point
    pathSegments.push(`M ${startX},${startY}`);
    
    // If start and end are vertically aligned (or very close), draw straight line if no obstacles
    if (Math.abs(startX - endX) < 1) {
        if (!checkVerticalPathBlocked(startX, startY, endY, obstacles, margin)) {
            pathSegments.push(`L ${endX},${endY}`);
        } else {
            // Need to detour around
            const detourX = startX + 30 + parallelOffset;
            const midY = (startY + endY) / 2;
            pathSegments.push(`L ${detourX},${startY}`);
            pathSegments.push(`L ${detourX},${midY}`);
            pathSegments.push(`L ${endX},${midY}`);
            pathSegments.push(`L ${endX},${endY}`);
        }
        return pathSegments.join(' ');
    }
    
    // Calculate routing with obstacle avoidance
    // Strategy: Go down a bit, then horizontal to above child, then down to child
    
    const direction = endX > startX ? 1 : -1;
    
    // Step 1: Move down a bit from the starting point (already at routingY level)
    // Find a clear horizontal path level
    let horizontalY = findClearHorizontalLevel(startX, endX, startY, endY, obstacles, margin, parallelOffset);
    
    pathSegments.push(`L ${startX},${horizontalY}`);
    
    // Step 2: Move horizontally toward target, routing around obstacles
    const horizontalPath = routeHorizontal(startX, horizontalY, endX, obstacles, margin, parallelOffset);
    pathSegments.push(horizontalPath);
    
    // Step 3: Move down to end point
    pathSegments.push(`L ${endX},${endY}`);
    
    return pathSegments.join(' ');
}

/**
 * Find a clear horizontal routing level between start and end
 */
function findClearHorizontalLevel(startX, endX, startY, endY, obstacles, margin, offset) {
    // Try the preferred level first
    const preferredY = startY + 20 + Math.abs(offset);
    
    const minX = Math.min(startX, endX);
    const maxX = Math.max(startX, endX);
    
    // Check if this level is clear
    let isClear = true;
    for (const obs of obstacles) {
        const obsLeft = obs.left - margin;
        const obsRight = obs.right + margin;
        const obsTop = obs.top - margin;
        const obsBottom = obs.bottom + margin;
        
        // Check if horizontal line at preferredY intersects obstacle
        if (preferredY >= obsTop && preferredY <= obsBottom) {
            if (obsRight >= minX && obsLeft <= maxX) {
                isClear = false;
                break;
            }
        }
    }
    
    if (isClear) {
        return preferredY;
    }
    
    // Try levels below obstacles
    const candidates = [startY + 10 + offset, startY + 30 + offset, startY + 50 + offset];
    for (const candidateY of candidates) {
        isClear = true;
        for (const obs of obstacles) {
            const obsLeft = obs.left - margin;
            const obsRight = obs.right + margin;
            const obsTop = obs.top - margin;
            const obsBottom = obs.bottom + margin;
            
            if (candidateY >= obsTop && candidateY <= obsBottom) {
                if (obsRight >= minX && obsLeft <= maxX) {
                    isClear = false;
                    break;
                }
            }
        }
        if (isClear) {
            return candidateY;
        }
    }
    
    // Fallback to original calculation
    return startY + (endY - startY) * 0.5 + offset;
}

/**
 * Route horizontally from startX to endX at given Y, avoiding obstacles
 */
function routeHorizontal(startX, y, endX, obstacles, margin, offset) {
    const segments = [];
    
    const minX = Math.min(startX, endX);
    const maxX = Math.max(startX, endX);
    const direction = endX > startX ? 1 : -1;
    
    // Find all obstacles blocking this horizontal path
    const blockingObstacles = [];
    for (const obs of obstacles) {
        const obsLeft = obs.left - margin;
        const obsRight = obs.right + margin;
        const obsTop = obs.top - margin;
        const obsBottom = obs.bottom + margin;
        
        // Check if obstacle blocks this horizontal segment
        if (y >= obsTop && y <= obsBottom) {
            if (obsRight >= minX && obsLeft <= maxX) {
                blockingObstacles.push({
                    left: obsLeft,
                    right: obsRight,
                    top: obsTop,
                    bottom: obsBottom
                });
            }
        }
    }
    
    if (blockingObstacles.length === 0) {
        // Clear path - go straight
        segments.push(`L ${endX},${y}`);
        return segments.join(' ');
    }
    
    // Sort obstacles by position
    blockingObstacles.sort((a, b) => {
        if (direction > 0) {
            return a.left - b.left;
        } else {
            return b.right - a.right;
        }
    });
    
    // Route around obstacles
    let currentX = startX;
    
    for (const obs of blockingObstacles) {
        // Check if we're actually blocked by this obstacle
        const blocked = (direction > 0 && currentX < obs.right && endX > obs.left) ||
                       (direction < 0 && currentX > obs.left && endX < obs.right);
        
        if (blocked) {
            // Go around: move up, over, and back down
            const detourY = obs.top - margin - Math.abs(offset) * 2;
            const passX = direction > 0 ? obs.right + margin : obs.left - margin;
            
            // Go up
            segments.push(`L ${currentX},${detourY}`);
            // Go across
            segments.push(`L ${passX},${detourY}`);
            // Come back down
            segments.push(`L ${passX},${y}`);
            
            currentX = passX;
        }
    }
    
    // Final segment to destination
    if (Math.abs(currentX - endX) > 1) {
        segments.push(`L ${endX},${y}`);
    }
    
    return segments.join(' ');
}

/**
 * Check if a vertical path is blocked by obstacles
 */
function checkVerticalPathBlocked(x, y1, y2, obstacles, margin) {
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    
    for (const obs of obstacles) {
        const obsLeft = obs.left - margin;
        const obsRight = obs.right + margin;
        const obsTop = obs.top - margin;
        const obsBottom = obs.bottom + margin;
        
        // Check if vertical line at x intersects obstacle
        if (x >= obsLeft && x <= obsRight) {
            if (obsBottom >= minY && obsTop <= maxY) {
                return true;
            }
        }
    }
    
    return false;
}

/**
 * Add a solder joint (small circle) at connection points
 */
function addSolderJoint(svg, x, y) {
    const joint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    joint.setAttribute('cx', x);
    joint.setAttribute('cy', y);
    joint.setAttribute('r', 4);
    joint.setAttribute('class', 'solder-joint');
    svg.appendChild(joint);
}
