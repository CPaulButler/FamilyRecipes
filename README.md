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
- `.github/workflows/deploy.yml` - GitHub Actions workflow for deploying to GitHub Pages

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

Edit `index.html` and add a new `family-member` div in the appropriate generation section:

```html
<div class="family-member" id="person-name">
    <h3>Person Name</h3>
    <p class="relation">Relationship</p>
    <p class="years">YYYY-YYYY</p>
</div>
```

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