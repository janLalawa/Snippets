const homePage = {
    init() {
        Promise.all([
            this.loadUserStats(),
            this.db = new DataBinding(app.user.currentUser, ['timesClicked', 'textEntered']),
        ]).catch(error => console.error('Error initialising dashboard:', error)); 
    },

    async loadUserStats() {
        app.renderToElement('userName', `${app.user.currentUser.name}`);
        app.renderToElement('currentPersona', `${app.user.currentUser.persona}`);
        app.renderToElement('availablePersonas', `${app.user.currentUser.availablePersonas.join(', ')}`);
        app.renderToElement('userRoles', `${app.user.currentUser.roles.map(role => role?.name || 'Unknown').join(', ')}`);
        app.renderToElement('userId', `${app.user.currentUser.id}`);
        app.renderToElement('timeLastChecked', `${new Date(app.user.currentUser.timestamp).toLocaleString()}`);
        app.renderToElement('timesClickedButton', `${app.user.currentUser.timesClicked}`);
        app.renderToElement('textEntered', `${app.user.currentUser.textEntered}`);
    },
};

// TODO: Add component refresh functionality
// TODO: Add navigation refresh on persona change
