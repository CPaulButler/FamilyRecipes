/**
 * Person Details Modal Script
 * Handles displaying detailed information about family members
 * Basic genealogical data is loaded from GEDCOM, this file contains additional details
 */

// Additional person data (photos, documents, contact info, bios)
// Names, dates, and relationships come from GEDCOM
const personData = {
    'grandma-linda': {
        photos: [
            { src: 'images/photos/grandma-mary.svg', caption: 'Portrait', people: ['grandma-linda'] },
            { src: 'images/photos/DCP_2064.jpg', caption: 'Portrait', people: ['grandma-linda'] },
            { src: 'images/photos/grandparents-anniversary.svg', caption: '50th Anniversary - 1998', people: ['grandma-linda', 'martin'] }
        ],
        documents: [
            { src: 'images/documents/birth-cert-grandma-mary.svg', caption: 'Birth Certificate', type: 'Birth Certificate' }
        ],
        addresses: {
            physical: [
                { type: 'Home (1950-2010)', address: '123 Oak Street, Springfield, IL 62701' }
            ],
            virtual: [
                { type: 'Phone', value: '(217) 555-0123' }
            ]
        },
        bio: 'Linda was known for her amazing cooking and warm hospitality. Her cornbread recipe has been passed down through generations.'
    },
    'martin': {
        photos: [
            { src: 'images/photos/grandpa-john.svg', caption: 'Portrait', people: ['martin'] },
            { src: 'images/photos/grandparents-anniversary.svg', caption: '50th Anniversary - 1998', people: ['grandma-linda', 'martin'] }
        ],
        documents: [],
        addresses: {
            physical: [
                { type: 'Home (1950-2008)', address: '123 Oak Street, Springfield, IL 62701' }
            ],
            virtual: [
                { type: 'Phone', value: '(217) 555-0124' }
            ]
        },
        bio: 'Martin worked as a carpenter and built the family home. He loved fishing and teaching his grandchildren about woodworking.'
    },
    'doris': {
        photos: [],
        documents: [],
        addresses: {
            physical: [],
            virtual: []
        },
        bio: 'Doris is a loving mother and grandmother.'
    },
    'mom-sarah': {
        photos: [
            { src: 'images/photos/mom-sarah.svg', caption: 'Portrait', people: ['mom-sarah'] },
            { src: 'images/photos/family-vacation-2005.svg', caption: 'Family Vacation 2005', people: ['mom-sarah', 'dad-robert', 'myself', 'brother-mike'] }
        ],
        documents: [],
        addresses: {
            physical: [
                { type: 'Current Address', address: '456 Maple Avenue, Chicago, IL 60601' }
            ],
            virtual: [
                { type: 'Email', value: 'sarah.smith@email.com' },
                { type: 'Phone', value: '(312) 555-0145' }
            ]
        },
        bio: 'Sarah inherited her mother\'s love of cooking and perfected the family apple pie recipe. She works as a school teacher.'
    },
    'dad-robert': {
        photos: [
            { src: 'images/photos/dad-robert.svg', caption: 'Portrait', people: ['dad-robert'] },
            { src: 'images/photos/family-vacation-2005.svg', caption: 'Family Vacation 2005', people: ['mom-sarah', 'dad-robert', 'myself', 'brother-mike'] }
        ],
        documents: [],
        addresses: {
            physical: [
                { type: 'Current Address', address: '456 Maple Avenue, Chicago, IL 60601' }
            ],
            virtual: [
                { type: 'Email', value: 'robert.anderson@email.com' },
                { type: 'Phone', value: '(312) 555-0146' }
            ]
        },
        bio: 'Robert is an engineer who loves solving complex problems. He enjoys woodworking, a skill he learned from Martin.'
    },
    'uncle-tom': {
        photos: [
            { src: 'images/photos/uncle-tom.svg', caption: 'Portrait', people: ['uncle-tom'] }
        ],
        documents: [],
        addresses: {
            physical: [
                { type: 'Current Address', address: '789 Pine Road, Peoria, IL 61602' }
            ],
            virtual: [
                { type: 'Email', value: 'tom.smith@email.com' },
                { type: 'Phone', value: '(309) 555-0167' }
            ]
        },
        bio: 'Tom is famous for his BBQ ribs at every family reunion. He owns a small restaurant and loves outdoor cooking. He was married to Patricia Moore from 1975-1985 and they had one daughter, Jenny. After Patricia\'s tragic passing, Tom married Linda in 1988.'
    },
    'uncle-tom-first-wife': {
        photos: [],
        documents: [],
        addresses: {
            physical: [],
            virtual: []
        },
        bio: 'Patricia was married to Tom from 1975 until her untimely death in 1985. She was a loving mother to Jenny and is fondly remembered by the family.'
    },
    'aunt-linda': {
        photos: [
            { src: 'images/photos/aunt-linda.svg', caption: 'Portrait', people: ['aunt-linda'] }
        ],
        documents: [],
        addresses: {
            physical: [
                { type: 'Current Address', address: '789 Pine Road, Peoria, IL 61602' }
            ],
            virtual: [
                { type: 'Email', value: 'linda.wilson@email.com' },
                { type: 'Phone', value: '(309) 555-0168' }
            ]
        },
        bio: 'Linda is a pastry chef known for her incredible chocolate chip cookies. She helps Tom run their restaurant.'
    },
    'myself': {
        photos: [
            { src: 'images/photos/emily.svg', caption: 'Portrait', people: ['myself'] },
            { src: 'images/photos/family-vacation-2005.svg', caption: 'Family Vacation 2005', people: ['mom-sarah', 'dad-robert', 'myself', 'brother-mike'] }
        ],
        documents: [],
        addresses: {
            physical: [
                { type: 'Current Address', address: '321 Elm Street, Madison, WI 53703' }
            ],
            virtual: [
                { type: 'Email', value: 'emily.anderson@email.com' },
                { type: 'Phone', value: '(608) 555-0189' },
                { type: 'LinkedIn', value: 'linkedin.com/in/emilyanderson' }
            ]
        },
        bio: 'Emily is a software developer who maintains this family website. She loves preserving family history and recipes.'
    },
    'brother-mike': {
        photos: [
            { src: 'images/photos/brother-mike.svg', caption: 'Portrait', people: ['brother-mike'] },
            { src: 'images/photos/family-vacation-2005.svg', caption: 'Family Vacation 2005', people: ['mom-sarah', 'dad-robert', 'myself', 'brother-mike'] }
        ],
        documents: [],
        addresses: {
            physical: [
                { type: 'Current Address', address: '654 Birch Lane, Milwaukee, WI 53202' }
            ],
            virtual: [
                { type: 'Email', value: 'mike.anderson@email.com' },
                { type: 'Phone', value: '(414) 555-0201' }
            ]
        },
        bio: 'Mike is a chef who combines traditional family recipes with modern techniques. He runs a popular farm-to-table restaurant.'
    },
    'cousin-jenny': {
        photos: [
            { src: 'images/photos/cousin-jenny.svg', caption: 'Portrait', people: ['cousin-jenny'] }
        ],
        documents: [],
        addresses: {
            physical: [
                { type: 'Current Address', address: '987 Cedar Court, Bloomington, IL 61701' }
            ],
            virtual: [
                { type: 'Email', value: 'jenny.smith@email.com' },
                { type: 'Phone', value: '(309) 555-0223' }
            ]
        },
        bio: 'Jenny is a food photographer who has documented many of the family recipes. She travels the world capturing culinary stories.'
    },
    'jason-porter': {
        photos: [],
        documents: [],
        addresses: {
            physical: [],
            virtual: []
        },
        bio: 'Jason Charles Porter was born on December 13, 1973. He is the son of Martin Porter and Doris Bradley.'
    },
    'mackenzie-porter': {
        photos: [],
        documents: [],
        addresses: {
            physical: [],
            virtual: []
        },
        bio: 'Mackenzie Leigh Porter was born on November 17, 1976. She is the daughter of Martin Porter and Doris Bradley.'
    }
};

// Get person info from GEDCOM
function getPersonInfo(personId) {
    const gedcomId = window.gedcomLoader ? window.gedcomLoader.getGedcomId(personId) : null;
    const parser = window.gedcomLoader ? window.gedcomLoader.getParser() : null;
    
    if (gedcomId && parser) {
        const individual = parser.getIndividual(gedcomId);
        if (individual) {
            const displayName = individual.name.given ? individual.name.given.split(' ')[0] : individual.name.full;
            return {
                name: displayName,
                fullName: individual.name.full,
                years: GedcomParser.formatYears(individual.birthDate, individual.deathDate)
            };
        }
    }
    
    // Fallback to empty values if GEDCOM not loaded
    return {
        name: '',
        fullName: '',
        years: ''
    };
}

// Initialize modal when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    // Wait for GEDCOM to load
    if (window.gedcomLoader) {
        await window.gedcomLoader.initialize();
    }
    
    createModal();
    attachClickHandlers();
});

// Create the modal structure
function createModal() {
    const modal = document.createElement('div');
    modal.id = 'person-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close">&times;</span>
            <div class="modal-body">
                <h2 id="modal-person-name"></h2>
                <p id="modal-person-full-name" class="full-name"></p>
                <p id="modal-person-years" class="years"></p>
                <p id="modal-person-relation" class="relation"></p>
                
                <div id="modal-person-bio" class="bio-section"></div>
                
                <div class="modal-section" id="marriages-section">
                    <h3>Marriages</h3>
                    <div id="modal-marriages"></div>
                </div>
                
                <div class="modal-section" id="photos-section">
                    <h3>Photos</h3>
                    <div id="modal-photos" class="photos-grid"></div>
                </div>
                
                <div class="modal-section" id="documents-section">
                    <h3>Documents</h3>
                    <div id="modal-documents" class="documents-grid"></div>
                </div>
                
                <div class="modal-section" id="addresses-section">
                    <h3>Contact Information</h3>
                    <div id="modal-addresses"></div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Close modal when clicking X or outside
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.onclick = closeModal;
    
    modal.onclick = function(event) {
        if (event.target === modal) {
            closeModal();
        }
    };
    
    // Close on Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
}

// Attach click handlers to all family member tiles
function attachClickHandlers() {
    const familyMembers = document.querySelectorAll('.family-member');
    familyMembers.forEach(member => {
        member.addEventListener('click', function() {
            const personId = this.id;
            showPersonDetails(personId);
        });
    });
}

// Show person details in modal
function showPersonDetails(personId) {
    const personDetails = personData[personId] || {};
    const personInfo = getPersonInfo(personId);
    
    const modal = document.getElementById('person-modal');
    
    // Set basic info from GEDCOM
    document.getElementById('modal-person-name').textContent = personInfo.name;
    document.getElementById('modal-person-full-name').textContent = personInfo.fullName;
    document.getElementById('modal-person-years').textContent = personInfo.years;
    
    // Get relation from family member element (generated by GEDCOM loader)
    const familyMemberElement = document.getElementById(personId);
    const relationText = familyMemberElement ? familyMemberElement.querySelector('.relation')?.textContent || '' : '';
    document.getElementById('modal-person-relation').textContent = relationText;
    
    // Set bio
    const bioSection = document.getElementById('modal-person-bio');
    if (personDetails.bio) {
        bioSection.innerHTML = `<p class="bio">${personDetails.bio}</p>`;
        bioSection.style.display = 'block';
    } else {
        bioSection.style.display = 'none';
    }
    
    // Set marriages
    const marriagesContainer = document.getElementById('modal-marriages');
    const marriagesSection = document.getElementById('marriages-section');
    const marriagesAttr = familyMemberElement ? familyMemberElement.getAttribute('data-marriages') : null;
    
    if (marriagesAttr) {
        try {
            const marriages = JSON.parse(marriagesAttr);
            if (marriages && marriages.length > 0) {
                let marriagesHTML = '<div class="marriages-list">';
                marriages.forEach((marriage, index) => {
                    const spouseInfo = getPersonInfo(marriage.spouse);
                    const spouseName = spouseInfo.fullName || spouseInfo.name || marriage.spouse;
                    
                    let statusText = '';
                    let statusClass = '';
                    switch(marriage.status) {
                        case 'married':
                            statusText = 'Married';
                            statusClass = 'status-married';
                            break;
                        case 'divorced':
                            statusText = 'Divorced';
                            statusClass = 'status-divorced';
                            break;
                        case 'widowed':
                            statusText = 'Widowed';
                            statusClass = 'status-widowed';
                            break;
                        case 'deceased':
                            statusText = 'Deceased';
                            statusClass = 'status-deceased';
                            break;
                        default:
                            statusText = marriage.status;
                            statusClass = 'status-other';
                    }
                    
                    const dateRange = marriage.end ? `${marriage.start}-${marriage.end}` : `${marriage.start}-present`;
                    const marriageLabel = marriages.length > 1 ? `Marriage ${index + 1}` : 'Marriage';
                    
                    marriagesHTML += `
                        <div class="marriage-item">
                            <div class="marriage-header">
                                <strong>${marriageLabel}</strong>
                                <span class="marriage-status ${statusClass}">${statusText}</span>
                            </div>
                            <p><strong>Spouse:</strong> ${spouseName}</p>
                            <p><strong>Duration:</strong> ${dateRange}</p>
                        </div>
                    `;
                });
                marriagesHTML += '</div>';
                marriagesContainer.innerHTML = marriagesHTML;
                marriagesSection.style.display = 'block';
            } else {
                marriagesSection.style.display = 'none';
            }
        } catch (e) {
            console.error('Error parsing marriages data:', e);
            marriagesSection.style.display = 'none';
        }
    } else {
        marriagesSection.style.display = 'none';
    }
    
    // Set photos
    const photosContainer = document.getElementById('modal-photos');
    const photosSection = document.getElementById('photos-section');
    if (personDetails.photos && personDetails.photos.length > 0) {
        photosContainer.innerHTML = personDetails.photos.map(photo => `
            <div class="photo-item">
                <img src="${photo.src}" alt="${photo.caption}">
                <p class="photo-caption">${photo.caption}</p>
            </div>
        `).join('');
        photosSection.style.display = 'block';
    } else {
        photosSection.style.display = 'none';
    }
    
    // Set documents
    const documentsContainer = document.getElementById('modal-documents');
    const documentsSection = document.getElementById('documents-section');
    if (personDetails.documents && personDetails.documents.length > 0) {
        documentsContainer.innerHTML = personDetails.documents.map(doc => `
            <div class="document-item">
                <img src="${doc.src}" alt="${doc.caption}">
                <p class="document-caption">${doc.caption}</p>
            </div>
        `).join('');
        documentsSection.style.display = 'block';
    } else {
        documentsSection.style.display = 'none';
    }
    
    // Set addresses
    const addressesContainer = document.getElementById('modal-addresses');
    const addressesSection = document.getElementById('addresses-section');
    let addressesHTML = '';
    
    if (personDetails.addresses && personDetails.addresses.physical && personDetails.addresses.physical.length > 0) {
        addressesHTML += '<div class="address-group"><h4>Physical Addresses</h4>';
        personDetails.addresses.physical.forEach(addr => {
            addressesHTML += `<p><strong>${addr.type}:</strong> ${addr.address}</p>`;
        });
        addressesHTML += '</div>';
    }
    
    if (personDetails.addresses && personDetails.addresses.virtual && personDetails.addresses.virtual.length > 0) {
        addressesHTML += '<div class="address-group"><h4>Virtual Contacts</h4>';
        personDetails.addresses.virtual.forEach(contact => {
            addressesHTML += `<p><strong>${contact.type}:</strong> ${contact.value}</p>`;
        });
        addressesHTML += '</div>';
    }
    
    if (addressesHTML) {
        addressesContainer.innerHTML = addressesHTML;
        addressesSection.style.display = 'block';
    } else {
        addressesSection.style.display = 'none';
    }
    
    // Show modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

// Close modal
function closeModal() {
    const modal = document.getElementById('person-modal');
    modal.style.display = 'none';
    document.body.style.overflow = ''; // Restore scrolling
}
