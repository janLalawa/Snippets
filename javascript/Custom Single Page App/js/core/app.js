const app = {
    router: new Router(),
    user: userManager,
    context: null,
    clientContext: null,
    userContext: null,
    testMode: true,
    currentPage: null,

    async init() {
        try {
            this.initialiseContext();
            this.user.setApp(this);
            this.router.setApp(this);
            await this.user.initialise();
            this.initialiseRoutes();
            this.router.navigateTo(Config.DEFAULT_ROUTE);

            const currentUser = await this.user.getCurrentUser();
            const persona = currentUser?.persona;

            if (persona) {
                this.router.renderNavigation(persona);
            }
            
        } catch (error) {
            console.error('Failed to initialise app:', error);
        }
    },

    initialiseRoutes() {
        this.router.addRoute('flexhr_mydetails', {
            label: 'My Details',
            templateUrl: '../html/mydetails.html',
            css: '../css/mydetails.css',
            js: '../js/contact.js',
            roles: ['Employee', 'System Administrator'],
            requiresAuth: true,
            onLoad: async () => {
                console.log('Initialising My Details page');
            }
        });

        this.router.addRoute('flexhr_mydetails-manager', {
            label: 'My Details',
            templateUrl: '../html/mydetails-manager.html',
            css: '../css/mydetails.css',
            js: '../js/contact.js',
            roles: ['Manager', 'System Administrator'],
            requiresAuth: true,
            onLoad: async () => {
                console.log('Initialising My Details page');
            }
        });

        this.router.addRoute('flexhr_myteam', {
            label: 'My Team',
            templateUrl: '../html/myteam.html',
            css: '../css/myteam.css',
            js: '../js/contact.js',
            roles: ['Manager', 'System Administrator'],
            requiresAuth: true,
            onLoad: async () => {
                console.log('Initialising My Team page');
            }
        });

        this.router.addRoute('flexhr_mycalendar', {
            label: 'My Calendar',
            templateUrl: '../html/mycalendar.html',
            css: '../css/mycalendar.css',
            js: '../js/contact.js',
            roles: ['Employee', 'System Administrator'],
            requiresAuth: true,
            onLoad: async () => {
                console.log('Initialising My Team page');
            }
        });

        this.router.addRoute('flexhr_mycalendar-manager', {
            label: 'My Calendar',
            templateUrl: '../html/mycalendar-manager.html',
            css: '../css/mycalendar.css',
            js: '../js/contact.js',
            roles: ['Manager', 'System Administrator'],
            requiresAuth: true,
            onLoad: async () => {
                console.log('Initialising My Team page');
            }
        });

        this.router.addRoute('flexhr_myrequests', {
            label: 'My Requests',
            templateUrl: '../html/myrequests.html',
            css: '../css/myrequests.css',
            js: '../js/contact.js',
            roles: ['Employee', 'System Administrator'],
            requiresAuth: true,
            onLoad: async () => {
                console.log('Initialising debug components page');
            }
        });

        this.router.addRoute('flexhr_myrequests-manager', {
            label: 'My Requests',
            templateUrl: '../html/myrequests-manager.html',
            css: '../css/myrequests.css',
            js: '../js/contact.js',
            roles: ['Manager', 'System Administrator'],
            requiresAuth: true,
            onLoad: async () => {
                console.log('Initialising debug components page');
            }
        });

        this.router.addRoute('flexhr_components', {
            label: 'Components',
            templateUrl: '../html/components.html',
            css: '../css/components.css',
            js: '../js/contact.js',
            roles: ['Manager', 'System Administrator'],
            requiresAuth: true,
            onLoad: async () => {
                console.log('Initialising debug layouts page');
            }
        });

        this.router.addRoute('flexhr_home', {
            label: 'Home',
            templateUrl: '../html/home.html',
            css: '../css/home.css',
            js: '../js/home.js',
            roles: [],
            requiresAuth: false,
            onLoad: async () => {
                console.log('Initialising debug layouts page');
                homePage.init();
            }
        });
    },

    initialiseContext() {
        if (typeof Xrm === 'undefined') {
            throw new Error('Xrm context not available');
        }

        this.context = Xrm.Utility.getGlobalContext();
        this.clientContext = this.context.client;
        this.userContext = this.context.userSettings;
    },

    renderToElement(elementId, content) {
        try {
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = content;
            }
        }
        catch (error) {
            console.error('Error rendering content:', error);
        }
    }
};


document.addEventListener('DOMContentLoaded', () => {
    app.init();
});