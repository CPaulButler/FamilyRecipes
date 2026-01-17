/**
 * Recipe Management Script
 * Handles recipe display, search, and filtering
 * 
 * SECURITY NOTE: Recipe data is hardcoded in this file and controlled by site maintainers.
 * No user input modifies recipe data. If this changes in the future, implement proper
 * HTML sanitization for recipe content to prevent XSS attacks.
 */

// Helper function to escape HTML in user-facing text fields
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Recipe data structure
// Each recipe supports multiple formats: html, md, pdf, jpg, links to images
const recipeData = [
    {
        id: 'grandmas-lemonade',
        name: "Grandma's Fresh Lemonade",
        familyMember: '@I6036539853@',
        familyMemberName: 'Linda Margot Fontenot',
        type: 'drink',
        flavor: 'sweet',
        ingredients: ['lemons', 'sugar', 'water', 'ice', 'mint'],
        description: 'A refreshing homemade lemonade recipe perfect for summer gatherings.',
        format: 'md',
        content: {
            mdFile: 'recipes/grandmas-lemonade.md'
        }
    },
    {
        id: 'lindas-cornbread',
        name: "Linda's Cornbread",
        familyMember: '@I6036539853@',
        familyMemberName: 'Linda Margot Fontenot',
        type: 'side',
        flavor: 'savory',
        ingredients: ['cornmeal', 'flour', 'sugar', 'baking powder', 'salt', 'milk', 'vegetable oil', 'egg'],
        description: 'A classic Southern cornbread recipe, perfect with butter.',
        format: 'html',
        content: {
            html: `
                <h4>Ingredients:</h4>
                <ul>
                    <li>1 cup cornmeal</li>
                    <li>1 cup all-purpose flour</li>
                    <li>1/4 cup sugar</li>
                    <li>4 tsp baking powder</li>
                    <li>1/2 tsp salt</li>
                    <li>1 cup milk</li>
                    <li>1/4 cup vegetable oil</li>
                    <li>1 egg</li>
                </ul>
                <h4>Instructions:</h4>
                <ol>
                    <li>Preheat oven to 400°F (200°C). Grease an 8-inch square pan.</li>
                    <li>Mix dry ingredients in a large bowl.</li>
                    <li>In another bowl, beat egg, then add milk and oil.</li>
                    <li>Pour wet ingredients into dry ingredients and stir until just combined.</li>
                    <li>Pour batter into prepared pan.</li>
                    <li>Bake for 20-25 minutes until golden brown.</li>
                </ol>
                <p class="recipe-note">Linda made this every Sunday for dinner. Best served warm with butter!</p>
            `
        }
    },
    {
        id: 'uncle-toms-bbq-ribs',
        name: "Uncle Tom's BBQ Ribs",
        familyMember: '@I_949871576@',
        familyMemberName: 'Martin Lee Porter',
        type: 'entree',
        flavor: 'savory',
        ingredients: ['baby back ribs', 'brown sugar', 'paprika', 'black pepper', 'salt', 'garlic powder', 'onion powder', 'cayenne pepper', 'BBQ sauce'],
        description: "Uncle Tom's signature ribs - the star of every family reunion.",
        format: 'html',
        content: {
            html: `
                <h4>Ingredients:</h4>
                <ul>
                    <li>2 racks of baby back ribs</li>
                    <li>1/4 cup brown sugar</li>
                    <li>2 tbsp paprika</li>
                    <li>1 tbsp black pepper</li>
                    <li>1 tbsp salt</li>
                    <li>1 tsp garlic powder</li>
                    <li>1 tsp onion powder</li>
                    <li>1/2 tsp cayenne pepper</li>
                    <li>2 cups BBQ sauce</li>
                </ul>
                <h4>Instructions:</h4>
                <ol>
                    <li>Mix all dry ingredients to create the rub.</li>
                    <li>Remove membrane from back of ribs and apply rub generously.</li>
                    <li>Let ribs sit for 30 minutes at room temperature.</li>
                    <li>Preheat grill to 225°F for indirect heat.</li>
                    <li>Place ribs on grill, bone side down, and cook for 3 hours.</li>
                    <li>Brush with BBQ sauce and cook for another 30 minutes.</li>
                    <li>Let rest for 10 minutes before cutting.</li>
                </ol>
                <p class="recipe-note">Uncle Tom's special dish at every family reunion!</p>
            `
        }
    },
    {
        id: 'moms-apple-pie',
        name: "Mom's Apple Pie",
        familyMember: '@I_949796306@',
        familyMemberName: 'Sarah Jane Porter',
        type: 'dessert',
        flavor: 'sweet',
        ingredients: ['pie crusts', 'Granny Smith apples', 'sugar', 'flour', 'cinnamon', 'nutmeg', 'salt', 'butter', 'egg'],
        description: 'A traditional apple pie recipe perfected over the years.',
        format: 'html',
        content: {
            html: `
                <h4>Ingredients:</h4>
                <ul>
                    <li>2 prepared pie crusts</li>
                    <li>6-7 Granny Smith apples, peeled and sliced</li>
                    <li>3/4 cup sugar</li>
                    <li>2 tbsp all-purpose flour</li>
                    <li>1 tsp cinnamon</li>
                    <li>1/4 tsp nutmeg</li>
                    <li>1/4 tsp salt</li>
                    <li>2 tbsp butter</li>
                    <li>1 egg (for egg wash)</li>
                </ul>
                <h4>Instructions:</h4>
                <ol>
                    <li>Preheat oven to 425°F (220°C).</li>
                    <li>Place one pie crust in a 9-inch pie pan.</li>
                    <li>Mix sugar, flour, cinnamon, nutmeg, and salt in a large bowl.</li>
                    <li>Add sliced apples and toss to coat.</li>
                    <li>Pour apple mixture into pie crust and dot with butter.</li>
                    <li>Cover with second crust, seal edges, and cut slits for venting.</li>
                    <li>Brush with beaten egg for golden finish.</li>
                    <li>Bake for 40-45 minutes until crust is golden and filling is bubbly.</li>
                </ol>
                <p class="recipe-note">Mom learned this from Linda and perfected it over the years!</p>
            `
        }
    },
    {
        id: 'aunt-lindas-chocolate-chip-cookies',
        name: "Aunt Linda's Chocolate Chip Cookies",
        familyMember: '@I372150330015@',
        familyMemberName: 'Linda Kay King',
        type: 'dessert',
        flavor: 'sweet',
        ingredients: ['flour', 'baking soda', 'salt', 'butter', 'granulated sugar', 'brown sugar', 'eggs', 'vanilla extract', 'chocolate chips'],
        description: 'Classic chocolate chip cookies that disappear in minutes at family gatherings.',
        format: 'html',
        content: {
            html: `
                <h4>Ingredients:</h4>
                <ul>
                    <li>2 1/4 cups all-purpose flour</li>
                    <li>1 tsp baking soda</li>
                    <li>1 tsp salt</li>
                    <li>1 cup butter, softened</li>
                    <li>3/4 cup granulated sugar</li>
                    <li>3/4 cup packed brown sugar</li>
                    <li>2 large eggs</li>
                    <li>2 tsp vanilla extract</li>
                    <li>2 cups chocolate chips</li>
                </ul>
                <h4>Instructions:</h4>
                <ol>
                    <li>Preheat oven to 375°F (190°C).</li>
                    <li>Mix flour, baking soda, and salt in a small bowl.</li>
                    <li>Beat butter and both sugars until creamy.</li>
                    <li>Add eggs and vanilla, beat well.</li>
                    <li>Gradually blend in flour mixture.</li>
                    <li>Stir in chocolate chips.</li>
                    <li>Drop rounded tablespoons onto ungreased cookie sheets.</li>
                    <li>Bake 9-11 minutes until golden brown.</li>
                </ol>
                <p class="recipe-note">These cookies are always gone within minutes at family gatherings!</p>
            `
        }
    },
    {
        id: 'martins-beef-stew',
        name: "Martin's Beef Stew",
        familyMember: '@I_949871576@',
        familyMemberName: 'Martin Lee Porter',
        type: 'entree',
        flavor: 'savory',
        ingredients: ['beef chuck', 'flour', 'vegetable oil', 'beef broth', 'potatoes', 'carrots', 'celery', 'onion', 'garlic', 'bay leaves', 'salt', 'pepper'],
        description: "Martin's special winter warmer - perfect for cold evenings.",
        format: 'html',
        content: {
            html: `
                <h4>Ingredients:</h4>
                <ul>
                    <li>2 lbs beef chuck, cubed</li>
                    <li>1/4 cup all-purpose flour</li>
                    <li>2 tbsp vegetable oil</li>
                    <li>4 cups beef broth</li>
                    <li>4 large potatoes, cubed</li>
                    <li>4 carrots, sliced</li>
                    <li>2 celery stalks, chopped</li>
                    <li>1 onion, diced</li>
                    <li>3 cloves garlic, minced</li>
                    <li>2 bay leaves</li>
                    <li>Salt and pepper to taste</li>
                </ul>
                <h4>Instructions:</h4>
                <ol>
                    <li>Coat beef cubes with flour, salt, and pepper.</li>
                    <li>Heat oil in a large pot and brown beef on all sides.</li>
                    <li>Add broth, bay leaves, and garlic. Bring to a boil.</li>
                    <li>Reduce heat and simmer for 1 hour.</li>
                    <li>Add potatoes, carrots, celery, and onion.</li>
                    <li>Simmer for another 45 minutes until vegetables are tender.</li>
                    <li>Remove bay leaves and season to taste.</li>
                </ol>
                <p class="recipe-note">Martin's special winter warmer - perfect for cold evenings!</p>
            `
        }
    }
];

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeRecipes();
    attachEventHandlers();
});

// Initialize recipe display
function initializeRecipes() {
    displayRecipes(recipeData);
    updateRecipeCount();
}

// Display recipes in the grid
function displayRecipes(recipes) {
    const grid = document.getElementById('recipes-grid');
    const noResults = document.getElementById('no-results');
    
    if (recipes.length === 0) {
        grid.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    
    grid.innerHTML = recipes.map(recipe => {
        const typeLabel = recipe.type.charAt(0).toUpperCase() + recipe.type.slice(1);
        const flavorLabel = recipe.flavor.charAt(0).toUpperCase() + recipe.flavor.slice(1);
        const ingredientsPreview = recipe.ingredients.slice(0, 5).join(', ') + (recipe.ingredients.length > 5 ? '...' : '');
        
        // Escape user-facing text to prevent XSS (defense in depth)
        const safeName = escapeHtml(recipe.name);
        const safeDescription = escapeHtml(recipe.description);
        const safeMemberName = escapeHtml(recipe.familyMemberName);
        const safeIngredientsPreview = escapeHtml(ingredientsPreview);
        
        return `
            <div class="recipe-card" data-recipe-id="${recipe.id}">
                <h3>${safeName}</h3>
                <div class="recipe-meta">
                    <span class="recipe-tag tag-type">${typeLabel}</span>
                    <span class="recipe-tag tag-flavor">${flavorLabel}</span>
                </div>
                <p class="recipe-attribution">From: <a href="index.html#${recipe.familyMember}">${safeMemberName}</a></p>
                <p class="recipe-description">${safeDescription}</p>
                <div class="recipe-ingredients-preview">
                    <strong>Key ingredients:</strong> ${safeIngredientsPreview}
                </div>
                <div class="recipe-format">
                    <span>Format: ${recipe.format.toUpperCase()}</span>
                </div>
                <button class="view-recipe-btn" onclick="viewRecipe('${recipe.id}')">View Recipe</button>
            </div>
        `;
    }).join('');
}

// Attach event handlers for search and filter
function attachEventHandlers() {
    const searchInput = document.getElementById('recipe-search');
    const typeFilter = document.getElementById('filter-type');
    const flavorFilter = document.getElementById('filter-flavor');
    const clearButton = document.getElementById('clear-filters');
    
    // Search input handler
    searchInput.addEventListener('input', filterRecipes);
    
    // Filter handlers
    typeFilter.addEventListener('change', filterRecipes);
    flavorFilter.addEventListener('change', filterRecipes);
    
    // Clear filters button
    clearButton.addEventListener('click', function() {
        searchInput.value = '';
        typeFilter.value = '';
        flavorFilter.value = '';
        filterRecipes();
    });
}

// Filter recipes based on search and filters
function filterRecipes() {
    const searchTerm = document.getElementById('recipe-search').value.toLowerCase();
    const typeFilter = document.getElementById('filter-type').value;
    const flavorFilter = document.getElementById('filter-flavor').value;
    
    const filteredRecipes = recipeData.filter(recipe => {
        // Search filter
        const searchMatch = !searchTerm || 
            recipe.name.toLowerCase().includes(searchTerm) ||
            recipe.familyMemberName.toLowerCase().includes(searchTerm) ||
            recipe.description.toLowerCase().includes(searchTerm) ||
            recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm));
        
        // Type filter
        const typeMatch = !typeFilter || recipe.type === typeFilter;
        
        // Flavor filter
        const flavorMatch = !flavorFilter || recipe.flavor === flavorFilter;
        
        return searchMatch && typeMatch && flavorMatch;
    });
    
    displayRecipes(filteredRecipes);
    updateRecipeCount(filteredRecipes.length);
}

// Update recipe count display
function updateRecipeCount(visibleCount = null) {
    const totalCount = recipeData.length;
    const visible = visibleCount !== null ? visibleCount : totalCount;
    
    document.getElementById('total-count').textContent = totalCount;
    document.getElementById('visible-count').textContent = visible;
}

// View recipe in modal
async function viewRecipe(recipeId) {
    const recipe = recipeData.find(r => r.id === recipeId);
    if (!recipe) return;
    
    // Create modal if it doesn't exist
    let modal = document.getElementById('recipe-modal');
    if (!modal) {
        modal = createRecipeModal();
    }
    
    // Set modal content
    const modalBody = modal.querySelector('.recipe-modal-body');
    const typeLabel = recipe.type.charAt(0).toUpperCase() + recipe.type.slice(1);
    const flavorLabel = recipe.flavor.charAt(0).toUpperCase() + recipe.flavor.slice(1);
    
    // Escape user-facing text fields for defense in depth
    const safeName = escapeHtml(recipe.name);
    const safeDescription = escapeHtml(recipe.description);
    const safeMemberName = escapeHtml(recipe.familyMemberName);
    
    // Show loading state
    modalBody.innerHTML = `
        <h2>${safeName}</h2>
        <div class="recipe-meta">
            <span class="recipe-tag tag-type">${typeLabel}</span>
            <span class="recipe-tag tag-flavor">${flavorLabel}</span>
        </div>
        <p class="recipe-attribution">From: <a href="index.html#${recipe.familyMember}">${safeMemberName}</a></p>
        <p class="recipe-description">${safeDescription}</p>
        <div class="recipe-content">
            <p>Loading recipe...</p>
        </div>
    `;
    
    // Show modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Render recipe content (async for markdown files)
    const recipeContent = await renderRecipeContent(recipe);
    const contentDiv = modalBody.querySelector('.recipe-content');
    if (contentDiv) {
        contentDiv.innerHTML = recipeContent;
    }
}

// Render recipe content based on format
// NOTE: Recipe content HTML is hardcoded by site maintainers in recipeData array.
// If recipe content becomes user-generated in the future, implement proper HTML sanitization.
async function renderRecipeContent(recipe) {
    switch (recipe.format) {
        case 'html':
            // Recipe HTML content is trusted - controlled by site maintainers
            return recipe.content.html;
        
        case 'md':
            // For markdown files, fetch and parse the content
            if (recipe.content.mdFile) {
                try {
                    const response = await fetch(recipe.content.mdFile);
                    if (!response.ok) {
                        throw new Error(`Failed to load recipe: ${response.status}`);
                    }
                    const markdown = await response.text();
                    
                    // Parse markdown to HTML using marked.js
                    if (typeof marked !== 'undefined') {
                        return marked.parse(markdown);
                    } else {
                        // Fallback if marked.js didn't load
                        return `<pre>${escapeHtml(markdown)}</pre>`;
                    }
                } catch (error) {
                    console.error('Error loading markdown recipe:', error);
                    return `<p class="recipe-error">Error loading recipe. Please try again later.</p>`;
                }
            } else if (recipe.content.md) {
                // Parse inline markdown content
                if (typeof marked !== 'undefined') {
                    return marked.parse(recipe.content.md);
                } else {
                    return `<pre>${escapeHtml(recipe.content.md)}</pre>`;
                }
            }
            return '<p>Markdown content not available</p>';
        
        case 'pdf':
            return `<div class="recipe-media">
                <iframe src="${recipe.content.pdf}"></iframe>
            </div>`;
        
        case 'jpg':
        case 'png':
            return `<div class="recipe-media">
                <img src="${recipe.content.image}" alt="${escapeHtml(recipe.name)}">
            </div>`;
        
        default:
            return '<p>Recipe format not supported</p>';
    }
}

// Create recipe modal
function createRecipeModal() {
    const modal = document.createElement('div');
    modal.id = 'recipe-modal';
    modal.className = 'recipe-modal';
    modal.innerHTML = `
        <div class="recipe-modal-content">
            <div class="recipe-modal-header">
                <span class="recipe-modal-close">&times;</span>
            </div>
            <div class="recipe-modal-body">
                <!-- Content will be dynamically inserted -->
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Close modal handlers
    const closeBtn = modal.querySelector('.recipe-modal-close');
    closeBtn.onclick = closeRecipeModal;
    
    modal.onclick = function(event) {
        if (event.target === modal) {
            closeRecipeModal();
        }
    };
    
    return modal;
}

// Global escape key handler (added only once)
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeRecipeModal();
    }
});

// Close recipe modal
function closeRecipeModal() {
    const modal = document.getElementById('recipe-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// Make viewRecipe globally accessible
window.viewRecipe = viewRecipe;
