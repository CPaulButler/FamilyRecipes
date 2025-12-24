# Project Overview
FamilyRecipes is a static website for preserving family recipes and documenting family relationships. The site displays a family tree across multiple generations with interactive features and a collection of family recipes. It is deployed automatically to GitHub Pages.

# Tech Stack
- **HTML5**: Semantic HTML structure for the family tree and recipes
- **CSS3**: Responsive styling with flexbox and grid layouts
- **Vanilla JavaScript**: No frameworks - uses DOM manipulation and event handling
- **SVG**: Dynamic line drawing for family tree connections
- **GitHub Pages**: Static site hosting with automated deployment via GitHub Actions

# File Structure
- `index.html` - Main HTML file containing family tree and recipes sections
- `styles.css` - All CSS styling for responsive design
- `person-details.js` - Modal functionality for displaying detailed family member information
- `tree-lines.js` - SVG line drawing script for visualizing family relationships
- `images/` - Directory for photos and documents
- `.github/workflows/deploy.yml` - GitHub Actions workflow for automated deployment

# Development Instructions

## Local Development
To test the site locally, use a simple HTTP server:

```bash
# Python 3
python3 -m http.server 8000

# Then visit http://localhost:8000 in your browser
```

## Testing
This is a static website with no build process or automated test suite. Manual testing should include:
- Verify all family member cards display correctly
- Test clicking family members to open modal with details
- Check that all recipe links work correctly
- Ensure responsive design works on mobile and desktop viewports
- Verify SVG lines draw correctly between family members
- Test browser compatibility (Chrome, Firefox, Safari, Edge)

# Coding Guidelines

## HTML
- Use semantic HTML5 elements (`<section>`, `<nav>`, `<header>`, etc.)
- Maintain consistent `data-` attribute naming for family relationships:
  - `data-marriages` - JSON array of marriage objects with spouse, start, end, status
  - `data-children` - Comma-separated list of child IDs
  - `data-parents` - Comma-separated list of parent IDs
- Use descriptive IDs for family members (e.g., `grandma-mary`, `uncle-tom`)

## CSS
- Mobile-first responsive design approach
- Use CSS Grid for layout where appropriate
- Use Flexbox for component arrangement
- Maintain consistent spacing and color scheme
- Keep media queries organized at the bottom of the file

## JavaScript
- Use vanilla JavaScript - no frameworks or libraries
- Follow modern ES6+ syntax (const/let, arrow functions, template literals)
- Add JSDoc comments for complex functions
- Use event delegation where appropriate
- Handle errors gracefully (try/catch for JSON parsing)
- Ensure SVG manipulation is compatible with all modern browsers

## Data Structure Conventions
- Family member data in `person-details.js` uses a consistent object structure:
  - `name`, `fullName`, `years`, `relation`
  - `photos`, `documents` (arrays of objects with src and caption)
  - `addresses` (object with physical and virtual arrays)
  - `bio` (string)
- Marriage status values: `married`, `divorced`, `widowed`, `deceased`

# Adding New Content

## Adding a Family Member
1. Add a `<div class="family-member">` in the appropriate generation in `index.html`
2. Include required attributes: `id`, `data-marriages`, `data-children`, `data-parents`
3. Add corresponding entry in `personData` object in `person-details.js`
4. Add any photos/documents to the `images/` directory

## Adding a Recipe
1. Add a `<div class="recipe-card">` in the recipes section of `index.html`
2. Include recipe attribution linking to family member: `<a href="#family-member-id">`
3. Follow existing recipe structure with ingredients and instructions

# Deployment
- The site is automatically deployed to GitHub Pages when changes are pushed to the `main` branch
- Deployment is handled by `.github/workflows/deploy.yml`
- No build step is required - files are deployed as-is
- Changes are typically live within 1-2 minutes after merge

# Important Notes
- This is a static site with no backend or database
- All data is stored directly in HTML and JavaScript files
- No build tools, package managers, or dependencies required
- Keep file sizes reasonable for fast page loads
- Optimize images before adding to the repository
