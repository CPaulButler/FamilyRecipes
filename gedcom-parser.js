/**
 * GEDCOM Parser
 * Parses GEDCOM files and extracts family data
 */

class GedcomParser {
    constructor() {
        this.individuals = new Map();
        this.families = new Map();
        this.objects = new Map();
    }

    /**
     * Parse GEDCOM file content
     * @param {string} content - GEDCOM file content
     */
    parse(content) {
        const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        let currentRecord = null;
        let currentLevel = 0;
        let currentSubRecord = null;
        let currentSubSubRecord = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const parts = line.match(/^(\d+)\s+(@[^@]+@)?\s*([^\s]+)\s*(.*)$/);
            
            if (!parts) continue;

            const level = parseInt(parts[1]);
            const id = parts[2];
            const tag = parts[3];
            const value = parts[4] || '';

            if (level === 0) {
                // Save previous record
                if (currentRecord) {
                    this.saveRecord(currentRecord);
                }

                // Start new record
                if (tag === 'INDI') {
                    currentRecord = {
                        type: 'INDI',
                        id: id,
                        name: {},
                        birthDate: '',
                        deathDate: '',
                        sex: '',
                        familiesAsSpouse: [],
                        familiesAsChild: [],
                        objects: [],
                        notes: [],
                        addresses: [],
                        phones: [],
                        emails: [],
                        customLinks: []
                    };
                } else if (tag === 'FAM') {
                    currentRecord = {
                        type: 'FAM',
                        id: id,
                        husband: '',
                        wife: '',
                        children: [],
                        marriageDate: '',
                        divorceDate: ''
                    };
                } else if (tag === 'OBJE') {
                    currentRecord = {
                        type: 'OBJE',
                        id: id,
                        file: '',
                        form: '',
                        title: '',
                        people: '',
                        docType: ''
                    };
                } else {
                    currentRecord = null;
                }
                currentSubRecord = null;
                currentSubSubRecord = null;
            } else if (currentRecord) {
                if (level === 1) {
                    currentSubRecord = tag;
                    currentSubSubRecord = null;
                    
                    if (tag === 'NAME' && currentRecord.type === 'INDI') {
                        currentRecord.name.full = value;
                    } else if (tag === 'SEX' && currentRecord.type === 'INDI') {
                        currentRecord.sex = value;
                    } else if (tag === 'FAMS' && currentRecord.type === 'INDI') {
                        currentRecord.familiesAsSpouse.push(value);
                    } else if (tag === 'FAMC' && currentRecord.type === 'INDI') {
                        currentRecord.familiesAsChild.push(value);
                    } else if (tag === 'OBJE' && currentRecord.type === 'INDI') {
                        currentRecord.objects.push(value);
                    } else if (tag === 'NOTE' && currentRecord.type === 'INDI') {
                        currentRecord.notes.push(value);
                    } else if (tag === 'ADDR' && currentRecord.type === 'INDI') {
                        currentRecord.addresses.push({ address: value, type: '' });
                    } else if (tag === 'PHON' && currentRecord.type === 'INDI') {
                        currentRecord.phones.push(value);
                    } else if (tag === 'EMAIL' && currentRecord.type === 'INDI') {
                        currentRecord.emails.push(value);
                    } else if (tag === '_LINK' && currentRecord.type === 'INDI') {
                        currentRecord.customLinks.push({ value: value, type: '' });
                    } else if (tag === 'HUSB' && currentRecord.type === 'FAM') {
                        currentRecord.husband = value;
                    } else if (tag === 'WIFE' && currentRecord.type === 'FAM') {
                        currentRecord.wife = value;
                    } else if (tag === 'CHIL' && currentRecord.type === 'FAM') {
                        currentRecord.children.push(value);
                    } else if (tag === 'FILE' && currentRecord.type === 'OBJE') {
                        currentRecord.file = value;
                    } else if (tag === 'FORM' && currentRecord.type === 'OBJE') {
                        currentRecord.form = value;
                    } else if (tag === 'TITL' && currentRecord.type === 'OBJE') {
                        currentRecord.title = value;
                    } else if (tag === '_PEOPLE' && currentRecord.type === 'OBJE') {
                        currentRecord.people = value;
                    } else if (tag === '_DOCTYPE' && currentRecord.type === 'OBJE') {
                        currentRecord.docType = value;
                    }
                } else if (level === 2) {
                    if (tag === 'GIVN' && currentRecord.type === 'INDI') {
                        currentRecord.name.given = value;
                    } else if (tag === 'SURN' && currentRecord.type === 'INDI') {
                        currentRecord.name.surname = value;
                    } else if (tag === 'DATE') {
                        if (currentSubRecord === 'BIRT') {
                            currentRecord.birthDate = value;
                        } else if (currentSubRecord === 'DEAT') {
                            currentRecord.deathDate = value;
                        } else if (currentSubRecord === 'MARR' && currentRecord.type === 'FAM') {
                            currentRecord.marriageDate = value;
                        } else if (currentSubRecord === 'DIV' && currentRecord.type === 'FAM') {
                            currentRecord.divorceDate = value;
                        }
                    } else if (tag === '_TYPE' && currentRecord.type === 'INDI') {
                        if (currentSubRecord === 'ADDR' && currentRecord.addresses.length > 0) {
                            currentRecord.addresses[currentRecord.addresses.length - 1].type = value;
                        } else if (currentSubRecord === '_LINK' && currentRecord.customLinks.length > 0) {
                            currentRecord.customLinks[currentRecord.customLinks.length - 1].type = value;
                        }
                    }
                }
            }
        }

        // Save last record
        if (currentRecord) {
            this.saveRecord(currentRecord);
        }
    }

    saveRecord(record) {
        if (record.type === 'INDI') {
            this.individuals.set(record.id, record);
        } else if (record.type === 'FAM') {
            this.families.set(record.id, record);
        } else if (record.type === 'OBJE') {
            this.objects.set(record.id, record);
        }
    }

    /**
     * Get all individuals
     * @returns {Map} Map of individuals
     */
    getIndividuals() {
        return this.individuals;
    }

    /**
     * Get all families
     * @returns {Map} Map of families
     */
    getFamilies() {
        return this.families;
    }

    /**
     * Get individual by ID
     * @param {string} id - Individual ID
     * @returns {Object|null} Individual object or null
     */
    getIndividual(id) {
        return this.individuals.get(id) || null;
    }

    /**
     * Get family by ID
     * @param {string} id - Family ID
     * @returns {Object|null} Family object or null
     */
    getFamily(id) {
        return this.families.get(id) || null;
    }

    /**
     * Get multimedia object by ID
     * @param {string} id - Object ID
     * @returns {Object|null} Object or null
     */
    getObject(id) {
        return this.objects.get(id) || null;
    }

    /**
     * Get photos for an individual
     * @param {string} individualId - Individual ID
     * @returns {Array} Array of photo objects
     */
    getPhotos(individualId) {
        const individual = this.getIndividual(individualId);
        if (!individual) return [];

        const photos = [];
        for (const objId of individual.objects) {
            const obj = this.getObject(objId);
            if (obj && !obj.docType) { // Photos don't have docType
                photos.push({
                    src: obj.file,
                    caption: obj.title,
                    people: obj.people ? obj.people.split(',') : []
                });
            }
        }

        return photos;
    }

    /**
     * Get documents for an individual
     * @param {string} individualId - Individual ID
     * @returns {Array} Array of document objects
     */
    getDocuments(individualId) {
        const individual = this.getIndividual(individualId);
        if (!individual) return [];

        const documents = [];
        for (const objId of individual.objects) {
            const obj = this.getObject(objId);
            if (obj && obj.docType) { // Documents have docType
                documents.push({
                    src: obj.file,
                    caption: obj.title,
                    type: obj.docType
                });
            }
        }

        return documents;
    }

    /**
     * Get addresses for an individual
     * @param {string} individualId - Individual ID
     * @returns {Object} Object with physical and virtual arrays
     */
    getAddresses(individualId) {
        const individual = this.getIndividual(individualId);
        if (!individual) return { physical: [], virtual: [] };

        const addresses = {
            physical: individual.addresses.map(addr => ({
                type: addr.type || 'Address',
                address: addr.address
            })),
            virtual: []
        };

        // Add emails
        for (const email of individual.emails) {
            addresses.virtual.push({
                type: 'Email',
                value: email
            });
        }

        // Add phones
        for (const phone of individual.phones) {
            addresses.virtual.push({
                type: 'Phone',
                value: phone
            });
        }

        // Add custom links
        for (const link of individual.customLinks) {
            addresses.virtual.push({
                type: link.type || 'Link',
                value: link.value
            });
        }

        return addresses;
    }

    /**
     * Get biographical note for an individual
     * @param {string} individualId - Individual ID
     * @returns {string} Biographical note or empty string
     */
    getBio(individualId) {
        const individual = this.getIndividual(individualId);
        if (!individual || !individual.notes || individual.notes.length === 0) return '';

        // Join all notes with space
        return individual.notes.join(' ');
    }

    /**
     * Get spouses for an individual
     * @param {string} individualId - Individual ID
     * @returns {Array} Array of spouse objects with marriage details
     */
    getSpouses(individualId) {
        const individual = this.getIndividual(individualId);
        if (!individual) return [];

        const spouses = [];
        for (const famId of individual.familiesAsSpouse) {
            const family = this.getFamily(famId);
            if (!family) continue;

            const spouseId = family.husband === individualId ? family.wife : family.husband;
            const spouse = this.getIndividual(spouseId);
            if (!spouse) continue;

            let status = 'married';
            if (family.divorceDate) {
                status = 'divorced';
            } else if (spouse.deathDate) {
                status = 'widowed';
            }

            spouses.push({
                id: spouseId,
                spouse: spouse,
                marriageDate: family.marriageDate,
                divorceDate: family.divorceDate,
                status: status
            });
        }

        return spouses;
    }

    /**
     * Get children for an individual
     * @param {string} individualId - Individual ID
     * @returns {Array} Array of child IDs
     */
    getChildren(individualId) {
        const individual = this.getIndividual(individualId);
        if (!individual) return [];

        const children = new Set();
        for (const famId of individual.familiesAsSpouse) {
            const family = this.getFamily(famId);
            if (!family) continue;

            for (const childId of family.children) {
                children.add(childId);
            }
        }

        return Array.from(children);
    }

    /**
     * Get parents for an individual
     * @param {string} individualId - Individual ID
     * @returns {Array} Array of parent IDs
     */
    getParents(individualId) {
        const individual = this.getIndividual(individualId);
        if (!individual) return [];

        const parents = [];
        for (const famId of individual.familiesAsChild) {
            const family = this.getFamily(famId);
            if (!family) continue;

            if (family.husband) parents.push(family.husband);
            if (family.wife) parents.push(family.wife);
        }

        return parents;
    }

    /**
     * Convert GEDCOM ID to HTML-friendly ID
     * @param {string} gedcomId - GEDCOM ID (e.g., @I1@)
     * @returns {string} HTML-friendly ID
     */
    static gedcomIdToHtmlId(gedcomId) {
        // Remove @ symbols and convert to lowercase
        return gedcomId.replace(/@/g, '').toLowerCase();
    }

    /**
     * Format years string from birth and death dates
     * @param {string} birthDate - Birth date
     * @param {string} deathDate - Death date
     * @returns {string} Formatted years (e.g., "1950-" or "1950-2020")
     */
    static formatYears(birthDate, deathDate) {
        const birth = birthDate ? this.extractYear(birthDate) : '';
        const death = deathDate ? this.extractYear(deathDate) : '';
        
        if (birth && death) {
            return `${birth}-${death}`;
        } else if (birth) {
            return `${birth}-`;
        }
        return '';
    }

    /**
     * Extract year from GEDCOM date
     * @param {string} date - GEDCOM date string
     * @returns {string} Year
     */
    static extractYear(date) {
        // GEDCOM dates can be in various formats (e.g., "1950", "13 DEC 1973", "DEC 1973")
        const match = date.match(/\d{4}/);
        return match ? match[0] : '';
    }
}

// Export for use in other scripts
window.GedcomParser = GedcomParser;
