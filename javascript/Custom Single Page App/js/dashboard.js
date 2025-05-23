const dashboardPage = {
    init() {
        Promise.all([
            this.loadRecentContacts(),
            this.loadRecentActivities(),
            this.loadQuickStats()
        ]).catch(error => console.error('Error initialising dashboard:', error));
    },

    async loadRecentContacts() {
        try {
            const contacts = [
                { name: 'John Doe', email: 'john@example.com' },
                { name: 'Jane Smith', email: 'jane@example.com' }
            ];

            const contactsElement = document.getElementById('recentContacts');
            if (contactsElement) {
                contactsElement.innerHTML = contacts.map(contact => 
                    `<div>${contact.name} - ${contact.email}</div>`
                ).join('');
            }
        } catch (error) {
            console.error('Error loading contacts:', error);
        }
    },

    async loadRecentActivities() {
        try {
            const activities = [
                { type: 'Phone Call', date: '2025-01-17' },
                { type: 'Email', date: '2025-01-16' }
            ];

            const activitiesElement = document.getElementById('recentActivities');
            if (activitiesElement) {
                activitiesElement.innerHTML = activities.map(activity => 
                    `<div>${activity.type} - ${activity.date}</div>`
                ).join('');
            }
        } catch (error) {
            console.error('Error loading activities:', error);
        }
    },

    async loadQuickStats() {
        try {
            const stats = {
                totalContacts: 150,
                activeDeals: 25,
                completedTasks: 75
            };

            const statsElement = document.getElementById('quickStats');
            if (statsElement) {
                statsElement.innerHTML = `
                    <div>Total Contacts: ${stats.totalContacts}</div>
                    <div>Active Deals: ${stats.activeDeals}</div>
                    <div>Completed Tasks: ${stats.completedTasks}</div>
                `;
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }
};