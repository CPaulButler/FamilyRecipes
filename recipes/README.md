# Recipe Storage

This directory contains recipe files in various formats. Recipes can be stored as:

- **HTML files** - Rich formatted recipes with styling
- **Markdown files (.md)** - Simple text-based recipes  
- **PDF files** - Scanned recipe cards or documents
- **Image files (.jpg, .png)** - Photos of handwritten recipes or recipe cards

## Adding New Recipes

To add a new recipe to the website:

1. Add the recipe file to this directory
2. Update `recipes.js` to include the recipe metadata:
   - `id`: Unique identifier (e.g., 'grandmas-lemonade')
   - `name`: Display name of the recipe
   - `familyMember`: ID of the family member (from GEDCOM)
   - `familyMemberName`: Display name of family member
   - `type`: Recipe type (entree, appetizer, dessert, side, drink, breakfast)
   - `flavor`: Flavor profile (savory, sweet)
   - `ingredients`: Array of key ingredients for search
   - `description`: Brief description
   - `format`: File format (html, md, pdf, jpg, png)
   - `content`: Object with format-specific content path or HTML

## Example Recipe Entry

```javascript
{
    id: 'grandmas-lemonade',
    name: "Grandma's Fresh Lemonade",
    familyMember: 'i1',
    familyMemberName: 'Linda',
    type: 'drink',
    flavor: 'sweet',
    ingredients: ['lemons', 'sugar', 'water', 'mint'],
    description: 'A refreshing homemade lemonade recipe perfect for summer.',
    format: 'md',
    content: {
        md: 'recipes/grandmas-lemonade.md'
    }
}
```

## Supported Formats

### HTML
Recipes with inline HTML content for full formatting control.

### Markdown
Simple text-based recipes stored as .md files. These can include:
- Headings
- Lists (ingredients, instructions)
- Bold/italic text
- Links to images

### PDF
Scanned recipe cards or documents. These display in an embedded viewer.

### Images (JPG/PNG)
Photos of handwritten recipe cards, cookbook pages, or completed dishes.

## Linking to Images

Recipes can link to images from old handwritten notebooks:
- Store images in `/images/recipes/` directory
- Reference them in HTML or Markdown recipes
- For example: `![Old recipe card](../images/recipes/cornbread-card.jpg)`
