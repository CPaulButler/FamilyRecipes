# FamilyRecipes

A static website for preserving family recipes and documenting family relationships. This site is published on GitHub Pages.

## Features

- **Family Tree Section**: Displays family members across three generations with their names, relationships, and years
- **Recipes Section**: Collection of family recipes with ingredients, instructions, and family associations
- **Interactive Links**: Click on family member names in recipes to jump to their profile in the family tree
- **Responsive Design**: Works beautifully on mobile and desktop devices

## Structure

- `index.html` - Main HTML file with family tree and recipes
- `styles.css` - CSS styling for the website
- `person-details.js` - Interactive modal system for displaying detailed family member information
- `tree-lines.js` - SVG line drawing for visualizing family relationships
- `.github/workflows/deploy.yml` - GitHub Actions workflow for deploying to GitHub Pages

## How person-details.js Works

The `person-details.js` file provides an interactive modal system that displays detailed information about family members when they are clicked on the family tree.

### Relationship Between index.html and person-details.js

1. **HTML Side (index.html)**: Each family member is represented by a `<div class="family-member">` element with:
   - An `id` attribute (e.g., `id="grandma-linda"`) that uniquely identifies the person
   - `data-marriages` attribute containing JSON with marriage information
   - `data-children` and `data-parents` attributes listing related family members

2. **JavaScript Side (person-details.js)**: 
   - Contains a `personData` object where each key matches a family member's `id` from index.html
   - When a family member is clicked, the script looks up their `id` in the `personData` object
   - Displays detailed information (bio, photos, documents, contact info) in a modal popup

### Person Data Structure

Each person in `personData` follows this structure:

```javascript
'person-id': {
    name: 'Display Name',                    // Required - displayed in modal header
    fullName: 'Full Legal Name',             // Optional
    years: 'YYYY-YYYY',                      // Optional
    relation: 'Relationship to family',      // Optional
    photos: [                                // Optional - can be empty array []
        { src: 'path/to/image.jpg', caption: 'Photo description', people: ['person-id'] }
    ],
    documents: [                             // Optional - can be empty array []
        { src: 'path/to/doc.jpg', caption: 'Document name', type: 'Document type' }
    ],
    addresses: {                             // Optional
        physical: [
            { type: 'Home (years)', address: 'Street address' }
        ],
        virtual: [
            { type: 'Email', value: 'email@example.com' },
            { type: 'Phone', value: '(123) 456-7890' }
        ]
    },
    bio: 'Biography text about the person'   // Optional
}
```

## Deployment

The site is automatically deployed to GitHub Pages when changes are pushed to the main branch using GitHub Actions.

## Local Development

To view the site locally:

```bash
# Start a simple HTTP server
python3 -m http.server 8000

# Visit http://localhost:8000 in your browser
```

## Adding Content

### Adding a Family Member

**Step 1: Add to index.html**

Add a new `family-member` div in the appropriate generation section. At minimum, you need an `id`:

```html
<div class="family-member" id="person-name">
    <h3>Person Name</h3>
    <p class="relation">Relationship</p>
    <p class="years">YYYY-YYYY</p>
</div>
```

Optionally, add data attributes to show relationships (all are optional):

```html
<div class="family-member" id="person-name" 
     data-marriages='[{"spouse":"spouse-id","start":"YYYY","status":"married"}]'
     data-children="child1-id,child2-id"
     data-parents="parent1-id,parent2-id">
    <h3>Person Name</h3>
    <p class="relation">Relationship</p>
    <p class="years">YYYY-YYYY</p>
</div>
```

**Step 2: Add to person-details.js**

Add detailed information to the `personData` object using the same `id`:

```javascript
'person-name': {
    name: 'Person Name',
    fullName: 'Full Legal Name',
    years: 'YYYY-YYYY',
    relation: 'Relationship to family',
    photos: [],
    documents: [],
    addresses: {
        physical: [],
        virtual: []
    },
    bio: 'A brief biography of the person.'
}
```

**Important**: The `id` in index.html must exactly match the key in the `personData` object for the modal to work correctly.

### Adding a Recipe

Add a new `recipe-card` div in the recipes section:

```html
<div class="recipe-card">
    <h3>Recipe Name</h3>
    <p class="recipe-attribution">From: <a href="#family-member-id">Family Member</a></p>
    <div class="recipe-content">
        <!-- Add ingredients and instructions -->
    </div>
</div>
```