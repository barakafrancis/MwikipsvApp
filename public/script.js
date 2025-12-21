// Login Handling
if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');
    const forgotPassword = document.getElementById('forgotPassword');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const pin = document.getElementById('pin').value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, pin })
            });
            const data = await response.json();
            if (data.success) {
                     //vehiclepage
                window.location.href = '/vehicle.html';
            } else {
                alert('Login failed: ' + data.message);
            }
        } catch (error) {
            alert('Error during login: ' + error.message);
        }
    });

    forgotPassword.addEventListener('click', async (e) => {
        e.preventDefault();
        const username = prompt('Enter your username or phone number for password reset:');
        if (username) {
            try {
                const response = await fetch('/api/forgotPassword', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username })
                });
                const data = await response.json();
                alert(data.message);
            } catch (error) {
                alert('Error requesting password reset: ' + error.message);
            }
        }
    });
}

// Vehicle Form Handler
if (document.getElementById('vehicleForm')) {
    const confirmBtn = document.getElementById('confirmBtn');
    const editBtn = document.getElementById('editBtn');
    const submitBtn = document.getElementById('submitBtn');
    const detailsSection = document.getElementById('detailsSection');
    const detailsContent = document.getElementById('detailsContent');
    let isEditing = false;
    let vehicleData = {};
    let originalVehicleData = {};

    confirmBtn.addEventListener('click', async () => {
        const registration = document.getElementById('registration').value.trim();
        if (!registration) {
            alert('Please enter a vehicle registration number');
            return;
        }
        
        try {
            const response = await fetch(`/api/vehicleDetails?registration=${encodeURIComponent(registration)}`);
            vehicleData = await response.json();
            
            if (vehicleData.error) {
                alert('Error: ' + vehicleData.error);
                detailsSection.style.display = 'none';
                return;
            }
            
            // Store original data
            originalVehicleData = { ...vehicleData };
            
            displayDetails(vehicleData);
            detailsSection.style.display = 'block';
            resetEditState();
        } catch (error) {
            alert('Error fetching vehicle details: ' + error.message);
        }
    });

    editBtn.addEventListener('click', () => {
        if (!vehicleData || Object.keys(vehicleData).length === 0) {
            alert('Please load vehicle details first');
            return;
        }
        
        isEditing = !isEditing; // Toggle edit mode
        
        if (isEditing) {
            // Enter edit mode
            editBtn.classList.add('editing');
            submitBtn.textContent = 'Save';
            submitBtn.classList.add('save-mode');
            displayDetails(vehicleData, true);
        } else {
            // Cancel edit mode
            resetEditState();
            displayDetails(vehicleData);
        }
    });

    submitBtn.addEventListener('click', async () => {
        if (isEditing) {
            // In edit mode - save changes
            const updatedData = {};
            let hasChanges = false;
            
            // Collect edited values
            for (const key in vehicleData) {
                if (key !== 'registration') {
                    const input = document.getElementById(`edit-${key}`);
                    if (input) {
                        const newValue = input.value.trim();
                        if (newValue !== vehicleData[key]) {
                            updatedData[key] = newValue;
                            hasChanges = true;
                        }
                    }
                }
            }
            
            if (!hasChanges) {
                alert('No changes detected');
                resetEditState();
                displayDetails(vehicleData);
                return;
            }
            
            try {
                const response = await fetch('/api/updateContribution', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        registration: vehicleData.registration, 
                        ...updatedData 
                    })
                });
                
                const data = await response.json();
                if (data.success) {
                    alert('Contribution updated successfully');
                    
                    // Update local data
                    vehicleData = { ...vehicleData, ...updatedData };
                    originalVehicleData = { ...vehicleData };
                    
                    // Exit edit mode
                    isEditing = false;
                    resetEditState();
                    displayDetails(vehicleData);
                } else {
                    alert('Update failed: ' + data.message);
                }
            } catch (error) {
                alert('Error updating contribution: ' + error.message);
            }
        } else {
            // Not in edit mode - just show message
            alert('Click the pencil icon to edit details');
        }
    });

    function displayDetails(data, edit = false) {
        detailsContent.innerHTML = '';
        
        for (const key in data) {
            if (key !== 'registration') {
                const p = document.createElement('p');
                
                if (edit) {
                    // Create label
                    const labelSpan = document.createElement('span');
                    labelSpan.className = 'label';
                    labelSpan.textContent = `${formatKey(key)}:`;
                    
                    // Create input field
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.id = `edit-${key}`;
                    input.value = data[key];
                    input.className = 'edit-input';
                    
                    p.appendChild(labelSpan);
                    p.appendChild(input);
                } else {
                    const labelSpan = document.createElement('span');
                    labelSpan.className = 'label';
                    labelSpan.textContent = `${formatKey(key)}:`;
                    
                    const valueSpan = document.createElement('span');
                    valueSpan.className = 'value';
                    valueSpan.textContent = data[key];
                    
                    p.appendChild(labelSpan);
                    p.appendChild(valueSpan);
                }
                
                detailsContent.appendChild(p);
            }
        }
    }
    
    function formatKey(key) {
        // Convert camelCase or snake_case to readable text
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/_/g, ' ')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }
    
    function resetEditState() {
        isEditing = false;
        editBtn.classList.remove('editing');
        submitBtn.textContent = 'Submit';
        submitBtn.classList.remove('save-mode');
    }
}

