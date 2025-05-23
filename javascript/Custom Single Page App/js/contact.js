const contactPage = {
    async submitForm() {
        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            notes: document.getElementById('notes').value
        };

        try {
            console.log('Submitting contact:', formData);
            alert('Contact created successfully!');

            this.clearForm();

            app.router.navigateTo('flexhr_dashboard');
        } catch (error) {
            console.error('Error creating contact:', error);
            alert('Error creating contact. Please try again.');
        }
    },

    clearForm() {
        document.getElementById('firstName').value = '';
        document.getElementById('lastName').value = '';
        document.getElementById('email').value = '';
        document.getElementById('phone').value = '';
        document.getElementById('notes').value = '';
    }
};
