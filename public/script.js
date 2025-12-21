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
    let isEditing = false;
    let vehicleData = {};

    confirmBtn.addEventListener('click', async () => {
        const registration = document.getElementById('registration').value;
        try {
            const response = await fetch(`/api/vehicleDetails?registration=${encodeURIComponent(registration)}`);
            vehicleData = await response.json();
            if (vehicleData.error) {
                alert('Error: ' + vehicleData.error);
                return;
            }
            displayDetails(vehicleData);
            detailsSection.style.display = 'block';
        } catch (error) {
            alert('Error fetching vehicle details: ' + error.message);
        }
    });

    editBtn.addEventListener('click', () => {
        isEditing = true;
        displayDetails(vehicleData, true);
    });

    submitBtn.addEventListener('click', async () => {
        if (isEditing) {
            // Collect edited values
            const updatedData = {};
            for (const key in vehicleData) {
                if (key !== 'registration') {
                    const input = document.getElementById(`edit-${key}`);
                    if (input) updatedData[key] = input.value;
                }
            }
            try {
                const response = await fetch('/api/updateContribution', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ registration: vehicleData.registration, ...updatedData })
                });
                const data = await response.json();
                if (data.success) {
                    alert('Contribution updated successfully');
                    vehicleData = { ...vehicleData, ...updatedData };
                    isEditing = false;
                    displayDetails(vehicleData);
                } else {
                    alert('Update failed: ' + data.message);
                }
            } catch (error) {
                alert('Error updating contribution: ' + error.message);
            }
        } else {
            alert('Click Edit to change values first.');
        }
    });

    function displayDetails(data, edit = false) {
        detailsContent.innerHTML = '';
        for (const key in data) {
            if (key !== 'registration') {
                const p = document.createElement('p');
                if (edit) {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.id = `edit-${key}`;
                    input.value = data[key];
                    p.innerHTML = `${key}: `;
                    p.appendChild(input);
                } else {
                    p.textContent = `${key}: ${data[key]}`;
                }
                detailsContent.appendChild(p);
            }
        }
    }

}
