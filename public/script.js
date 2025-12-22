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
                // Redirect to vehicle page on success
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

if (document.getElementById('vehicleForm')) {
    const confirmBtn = document.getElementById('confirmBtn');
    const editBtn = document.getElementById('editBtn');
    const submitBtn = document.getElementById('submitBtn');
    const detailsSection = document.getElementById('detailsSection');
    const detailsContent = document.getElementById('detailsContent');
    const registrationInput = document.getElementById('registration');
    let isEditing = false;
    let hasUnsavedChanges = false;
    let vehicleData = {};
    let originalVehicleData = {};

    confirmBtn.addEventListener('click', async () => {
        const registration = registrationInput.value.trim();
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
            resetToViewMode();
            hasUnsavedChanges = false;
            
            // Show success message
            showMessage('Vehicle details loaded', 'success');
        } catch (error) {
            alert('Error fetching vehicle details: ' + error.message);
        }
    });

    editBtn.addEventListener('click', () => {
        if (!vehicleData || Object.keys(vehicleData).length === 0) {
            alert('Please load vehicle details first');
            return;
        }
        
        if (!isEditing) {
            // Enter edit mode
            isEditing = true;
            hasUnsavedChanges = false;
            editBtn.classList.add('editing');
            submitBtn.textContent = 'Save';
            submitBtn.classList.add('save-mode');
            displayDetails(vehicleData, true);
            showMessage('Make changes and click Save to update.', 'info');
        } else {
            // Cancel edit mode
            isEditing = false;
            editBtn.classList.remove('editing');
            submitBtn.textContent = 'Submit';
            submitBtn.classList.remove('save-mode');
            displayDetails(vehicleData);
            showMessage('Edit cancelled.', 'info');
        }
    });

    submitBtn.addEventListener('click', async () => {
        if (isEditing) {
            // We're in edit mode, so save the changes first
            await saveChanges();
        } else {
            // Not in edit mode, submit the contribution
            await submitContribution();
        }
    });

    async function saveChanges() {
        // Collect edited values
        const updatedData = {};
        let hasChanges = false;
        
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
            showMessage('No changes detected', 'info');
            // Exit edit mode since no changes
            isEditing = false;
            editBtn.classList.remove('editing');
            submitBtn.textContent = 'Submit';
            submitBtn.classList.remove('save-mode');
            displayDetails(vehicleData);
            return;
        }
        
        try {
            // Show loading state
            submitBtn.textContent = 'Saving...';
            submitBtn.disabled = true;
            
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
                // Update local data with saved values
                vehicleData = { ...vehicleData, ...updatedData };
                originalVehicleData = { ...vehicleData };
                
                // Mark changes as saved
                hasUnsavedChanges = false;
                
                // Exit edit mode
                isEditing = false;
                editBtn.classList.remove('editing');
                submitBtn.textContent = 'Submit';
                submitBtn.classList.remove('save-mode');
                
                // Refresh display
                displayDetails(vehicleData);
                
                // Show success message
                showMessage('Changes saved successfully! Click Submit to finalize.', 'success');
                
                // Show saved values in alert
                let alertMessage = '✓ Changes Saved Successfully!\n\nUpdated Values:\n';
                for (const key in updatedData) {
                    const formattedKey = formatKey(key);
                    alertMessage += `${formattedKey}: ${updatedData[key]}\n`;
                }
                alert(alertMessage);
                
            } else {
                alert('Save failed: ' + data.message);
            }
        } catch (error) {
            alert('Error saving changes: ' + error.message);
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save';
        }
    }

    async function submitContribution() {
        if (!vehicleData || Object.keys(vehicleData).length === 0) {
            alert('Please load vehicle details first');
            return;
        }
        
        // Confirm submission
        const confirmSubmit = confirm('Submit this contribution? This action cannot be undone.');
        if (!confirmSubmit) {
            return;
        }
        
        try {
            // Show loading state
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;
            
            const response = await fetch('/api/updateContribution', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(vehicleData)
            });
            
            const data = await response.json();
            if (data.success) {
                // Show success message
                showMessage('Contribution submitted successfully!', 'success');
                
                // Show submitted values in alert
                let alertMessage = '✓ Contribution Submitted Successfully!\n\nSubmitted Values:\n';
                for (const key in vehicleData) {
                    if (key !== 'registration') {
                        const formattedKey = formatKey(key);
                        alertMessage += `${formattedKey}: ${vehicleData[key]}\n`;
                    }
                }
                alert(alertMessage);
                
                // Refresh the data to show latest state
                const registration = registrationInput.value.trim();
                if (registration) {
                    const refreshResponse = await fetch(`/api/vehicleDetails?registration=${encodeURIComponent(registration)}`);
                    const refreshedData = await refreshResponse.json();
                    if (!refreshedData.error) {
                        vehicleData = refreshedData;
                        displayDetails(vehicleData);
                    }
                }
                
            } else {
                alert('Submission failed: ' + data.message);
            }
        } catch (error) {
            alert('Error submitting contribution: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit';
        }
    }

    // Refresh functionality
    confirmBtn.addEventListener('click', async () => {
        // Clear previous data
        detailsSection.style.display = 'none';
        detailsContent.innerHTML = '';
        resetToViewMode();
        hasUnsavedChanges = false;
        
        const registration = registrationInput.value.trim();
        if (!registration) {
            alert('Please enter a vehicle registration number');
            return;
        }
        
        try {
            const response = await fetch(`/api/vehicleDetails?registration=${encodeURIComponent(registration)}`);
            vehicleData = await response.json();
            
            if (vehicleData.error) {
                alert('Error: ' + vehicleData.error);
                return;
            }
            
            originalVehicleData = { ...vehicleData };
            displayDetails(vehicleData);
            detailsSection.style.display = 'block';
            showMessage('Vehicle details refreshed', 'success');
        } catch (error) {
            alert('Error fetching vehicle details: ' + error.message);
        }
    });

    function displayDetails(data, edit = false) {
        detailsContent.innerHTML = '';
        
        for (const key in data) {
            if (key !== 'registration') {
                const p = document.createElement('p');
                
                if (edit) {
                    const labelSpan = document.createElement('span');
                    labelSpan.className = 'label';
                    labelSpan.textContent = `${formatKey(key)}:`;
                    
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
    
    function resetToViewMode() {
        isEditing = false;
        editBtn.classList.remove('editing');
        submitBtn.textContent = 'Submit';
        submitBtn.classList.remove('save-mode');
    }
    
    function showMessage(text, type = 'info') {
        // Remove any existing message
        const existingMessage = document.querySelector('.status-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `status-message status-${type}`;
        messageDiv.textContent = text;
        messageDiv.style.cssText = `
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
            font-size: 14px;
            text-align: center;
            animation: fadeIn 0.3s ease-in;
        `;
        
        if (type === 'success') {
            messageDiv.style.backgroundColor = '#d4edda';
            messageDiv.style.color = '#155724';
            messageDiv.style.border = '1px solid #c3e6cb';
        } else if (type === 'info') {
            messageDiv.style.backgroundColor = '#d1ecf1';
            messageDiv.style.color = '#0c5460';
            messageDiv.style.border = '1px solid #bee5eb';
        }
        
        // Add to container before the details section
        const container = document.querySelector('.container');
        const detailsSection = document.getElementById('detailsSection');
        if (detailsSection && detailsSection.style.display !== 'none') {
            container.insertBefore(messageDiv, detailsSection);
        } else {
            container.appendChild(messageDiv);
        }
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.style.opacity = '0';
                messageDiv.style.transition = 'opacity 0.3s';
                setTimeout(() => {
                    if (messageDiv.parentNode) {
                        messageDiv.remove();
                    }
                }, 300);
            }
        }, 5000);
    }
    
    function formatKey(key) {
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/_/g, ' ')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }
    
    // Add CSS for fadeIn animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
}
