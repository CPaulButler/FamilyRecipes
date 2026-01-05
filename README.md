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

### How Family Data is Stored

Family member data is stored in the GEDCOM file (family.ged):

1. **GEDCOM File (family.ged)**: Contains all genealogical data following GEDCOM 5.5.1 format:
   - Names, birth/death dates, and relationships (standard GEDCOM tags)
   - Biographical notes (NOTE tags)
   - Photos and documents (OBJE records with FILE, FORM, TITL tags)
   - Addresses and contact information (ADDR, PHON, EMAIL tags)

2. **Dynamic Generation**: 
   - gedcom-loader.js reads the GEDCOM file and generates the family tree HTML dynamically
   - When a family member is clicked, person-details.js retrieves their data from the parsed GEDCOM and displays it in a modal

### GEDCOM Data Structure

Example individual record:

```gedcom
0 @I1@ INDI
1 NAME Linda Margot /Fontenot/
1 OBJE @O1@
1 NOTE Linda was known for her amazing cooking...
1 ADDR 123 Oak Street, Springfield, IL 62701
2 _TYPE Home (1950-2010)
1 PHON (217) 555-0123
1 EMAIL linda@example.com
```

Photos and documents are defined as multimedia objects:

```gedcom
0 @O1@ OBJE
1 FILE images/photos/portrait.jpg
1 FORM jpg
1 TITL Portrait
1 _PEOPLE grandma-linda
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

Add the person to the GEDCOM file (family.ged) following the GEDCOM 5.5.1 format:

```gedcom
0 @I14@ INDI
1 NAME John /Doe/
2 GIVN John
2 SURN Doe
1 SEX M
1 BIRT
2 DATE 1980
1 OBJE @O14@
1 NOTE John is a software engineer who loves coding.
1 ADDR 123 Main St, City, State 12345
2 _TYPE Current Address
1 EMAIL john.doe@example.com
1 PHON (555) 123-4567

0 @O14@ OBJE
1 FILE images/photos/john-doe.jpg
1 FORM jpg
1 TITL Portrait
1 _PEOPLE person-id
```

The family tree will be automatically regenerated from the GEDCOM file when the page loads.

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