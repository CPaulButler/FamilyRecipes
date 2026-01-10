/**
 * Person Details Modal Script
 * Handles displaying detailed information about family members
 * Basic genealogical data is loaded from GEDCOM, this file contains additional details
 */

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

// Also listen for family tree generated event
document.addEventListener('familyTreeGenerated', function() {
    // Re-attach handlers after family tree is generated
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
                
                <div class="modal-section" id="vital-stats-section">
                    <h3>Vital Information</h3>
                    <div id="modal-vital-stats"></div>
                </div>
                
                <div class="modal-section" id="residences-section">
                    <h3>Residences</h3>
                    <div id="modal-residences"></div>
                </div>
                
                <div class="modal-section" id="family-section">
                    <h3>Family</h3>
                    <div id="modal-family"></div>
                </div>
                
                <div class="modal-section" id="sources-section">
                    <h3>Sources & References</h3>
                    <div id="modal-sources"></div>
                </div>
                
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

// Attach click handlers to details buttons
function attachClickHandlers() {
    attachDetailsButtonHandlers();
}

// Attach click handlers to all details buttons
function attachDetailsButtonHandlers() {
    const detailsButtons = document.querySelectorAll('.details-btn');
    detailsButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent tile click from firing
            const personId = this.closest('.family-member').id;
            showPersonDetails(personId);
        });
    });
}

// Show person details in modal
function showPersonDetails(personId) {
    const personInfo = getPersonInfo(personId);
    
    const modal = document.getElementById('person-modal');
    if (!modal) {
        console.error('Modal not found');
        return;
    }
    
    // Set basic info from GEDCOM
    document.getElementById('modal-person-name').textContent = personInfo.name;
    document.getElementById('modal-person-full-name').textContent = personInfo.fullName;
    document.getElementById('modal-person-years').textContent = personInfo.years;
    
    // Get relation from family member element (generated by GEDCOM loader)
    const familyMemberElement = document.getElementById(personId);
    const relationText = familyMemberElement ? familyMemberElement.querySelector('.relation')?.textContent || '' : '';
    document.getElementById('modal-person-relation').textContent = relationText;
    
    // Get data from GEDCOM
    const gedcomId = window.gedcomLoader ? window.gedcomLoader.getGedcomId(personId) : null;
    const parser = window.gedcomLoader ? window.gedcomLoader.getParser() : null;
    
    let bio = '';
    let photos = [];
    let documents = [];
    let addresses = { physical: [], virtual: [] };
    let individual = null;
    
    if (gedcomId && parser) {
        // Get individual data
        individual = parser.getIndividual(gedcomId);
        
        // Get data from GEDCOM
        bio = parser.getBio(gedcomId);
        photos = parser.getPhotos(gedcomId);
        documents = parser.getDocuments(gedcomId);
        addresses = parser.getAddresses(gedcomId);
    }
    
    // Set bio
    const bioSection = document.getElementById('modal-person-bio');
    if (bio) {
        bioSection.innerHTML = `<p class="bio">${bio}</p>`;
        bioSection.style.display = 'block';
    } else {
        bioSection.style.display = 'none';
    }
    
    // Set vital statistics
    const vitalStatsContainer = document.getElementById('modal-vital-stats');
    const vitalStatsSection = document.getElementById('vital-stats-section');
    let vitalStatsHTML = '<div class="vital-stats-list">';
    
    if (individual) {
        if (individual.sex) {
            const gender = individual.sex === 'M' ? 'Male' : individual.sex === 'F' ? 'Female' : individual.sex;
            vitalStatsHTML += `<p><strong>Gender:</strong> ${gender}</p>`;
        }
        
        if (individual.occupation) {
            vitalStatsHTML += `<p><strong>Occupation:</strong> ${individual.occupation}</p>`;
        }
        
        if (individual.education) {
            vitalStatsHTML += `<p><strong>Education:</strong> ${individual.education}</p>`;
        }
        
        if (individual.birthDate) {
            vitalStatsHTML += `<p><strong>Born:</strong> ${individual.birthDate}`;
            if (individual.birthPlace) {
                vitalStatsHTML += ` in ${individual.birthPlace}`;
            }
            vitalStatsHTML += `</p>`;
        }
        
        if (individual.deathDate) {
            vitalStatsHTML += `<p><strong>Died:</strong> ${individual.deathDate}`;
            if (individual.deathPlace) {
                vitalStatsHTML += ` in ${individual.deathPlace}`;
            }
            vitalStatsHTML += `</p>`;
        }
        
        if (individual.burialDate || individual.burialPlace) {
            vitalStatsHTML += `<p><strong>Burial:</strong> `;
            if (individual.burialDate) {
                vitalStatsHTML += individual.burialDate;
            }
            if (individual.burialPlace) {
                if (individual.burialDate) vitalStatsHTML += ' in ';
                vitalStatsHTML += individual.burialPlace;
            }
            vitalStatsHTML += `</p>`;
        }
        
        vitalStatsHTML += '</div>';
        vitalStatsContainer.innerHTML = vitalStatsHTML;
        vitalStatsSection.style.display = 'block';
    } else {
        vitalStatsSection.style.display = 'none';
    }
    
    // Set residences
    const residencesContainer = document.getElementById('modal-residences');
    const residencesSection = document.getElementById('residences-section');
    
    if (individual && individual.residences && individual.residences.length > 0) {
        let residencesHTML = '<div class="residences-list">';
        
        // Filter out residences without meaningful data
        const validResidences = individual.residences.filter(r => r.date || r.place);
        
        validResidences.forEach((residence, index) => {
            residencesHTML += `<div class="residence-item">`;
            if (residence.date && residence.place) {
                residencesHTML += `<p><strong>${residence.date}:</strong> ${residence.place}</p>`;
            } else if (residence.date) {
                residencesHTML += `<p><strong>${residence.date}</strong></p>`;
            } else if (residence.place) {
                residencesHTML += `<p>${residence.place}</p>`;
            }
            residencesHTML += `</div>`;
        });
        
        residencesHTML += '</div>';
        residencesContainer.innerHTML = residencesHTML;
        residencesSection.style.display = 'block';
    } else {
        residencesSection.style.display = 'none';
    }
    
    // Set family information (parents and children)
    const familyContainer = document.getElementById('modal-family');
    const familySection = document.getElementById('family-section');
    let familyHTML = '';
    
    // Get parents
    const parentsAttr = familyMemberElement ? familyMemberElement.getAttribute('data-parents') : null;
    if (parentsAttr) {
        const parentIds = parentsAttr.split(',').map(id => id.trim()).filter(id => id);
        if (parentIds.length > 0) {
            familyHTML += '<div class="family-group"><h4>Parents</h4>';
            parentIds.forEach(parentId => {
                const parentInfo = getPersonInfo(parentId);
                const parentName = parentInfo.fullName || parentInfo.name || parentId;
                familyHTML += `<p>${parentName} <span class="years">${parentInfo.years}</span></p>`;
            });
            familyHTML += '</div>';
        }
    }
    
    // Get children
    const childrenAttr = familyMemberElement ? familyMemberElement.getAttribute('data-children') : null;
    if (childrenAttr) {
        const childIds = childrenAttr.split(',').map(id => id.trim()).filter(id => id);
        if (childIds.length > 0) {
            familyHTML += '<div class="family-group"><h4>Children</h4>';
            childIds.forEach(childId => {
                const childInfo = getPersonInfo(childId);
                const childName = childInfo.fullName || childInfo.name || childId;
                familyHTML += `<p>${childName} <span class="years">${childInfo.years}</span></p>`;
            });
            familyHTML += '</div>';
        }
    }
    
    if (familyHTML) {
        familyContainer.innerHTML = familyHTML;
        familySection.style.display = 'block';
    } else {
        familySection.style.display = 'none';
    }
    
    // Set sources
    const sourcesContainer = document.getElementById('modal-sources');
    const sourcesSection = document.getElementById('sources-section');
    
    if (individual && individual.sources && individual.sources.length > 0) {
        let sourcesHTML = '<div class="sources-list">';
        
        // Filter out duplicates and sources without page info
        const uniqueSources = [];
        const seen = new Set();
        
        individual.sources.forEach(source => {
            if (source.page && !seen.has(source.page)) {
                seen.add(source.page);
                uniqueSources.push(source);
            }
        });
        
        uniqueSources.forEach((source, index) => {
            sourcesHTML += `<div class="source-item">`;
            sourcesHTML += `<p class="source-citation">${source.page}</p>`;
            if (source.www) {
                sourcesHTML += `<p class="source-link"><a href="${source.www}" target="_blank" rel="noopener noreferrer">View Source</a></p>`;
            }
            sourcesHTML += `</div>`;
        });
        
        sourcesHTML += '</div>';
        sourcesContainer.innerHTML = sourcesHTML;
        sourcesSection.style.display = 'block';
    } else {
        sourcesSection.style.display = 'none';
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
    if (photos && photos.length > 0) {
        photosContainer.innerHTML = photos.map(photo => `
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
    if (documents && documents.length > 0) {
        documentsContainer.innerHTML = documents.map(doc => `
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
    
    if (addresses && addresses.physical && addresses.physical.length > 0) {
        addressesHTML += '<div class="address-group"><h4>Physical Addresses</h4>';
        addresses.physical.forEach(addr => {
            addressesHTML += `<p><strong>${addr.type}:</strong> ${addr.address}</p>`;
        });
        addressesHTML += '</div>';
    }
    
    if (addresses && addresses.virtual && addresses.virtual.length > 0) {
        addressesHTML += '<div class="address-group"><h4>Virtual Contacts</h4>';
        addresses.virtual.forEach(contact => {
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

// Make functions globally accessible
window.showPersonDetails = showPersonDetails;
window.closeModal = closeModal;
