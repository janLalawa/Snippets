class Config {
    static get DEFAULT_ROUTE() { return 'prefix_home'; }

    static get ROLES() {
        return {
            DEFAULT: 'Basic User',
            ADMIN: ['System Administrator', 'Global Administrator'],
            MANAGER: ['Manager', 'Team Lead', 'Department Head'],
            EMPLOYEE: ['Employee', 'Basic User', 'Standard User']
        };
    }

    static get PERSONAS() {
        return {
            EMPLOYEE: 'Employee',
            MANAGER: 'Manager',
            ADMIN: 'Admin'
        }
    }

    static get ROUTES() {
        return {
            MY_DETAILS: 'prefix_mydetails',
            MY_TEAM: 'prefix_myteam',
            MY_CALENDAR: 'prefix_mycalendar',
            MY_REQUESTS: 'prefix_myrequests',
            COMPONENTS: 'prefix_components'
        };
    }

    static get PATHS() {
        return {
            TEMPLATES: '../html/',
            STYLES: '../css/',
            SCRIPTS: '../js/'
        };
    }

    static get ELEMENTS() {
        return {
            PAGE_CONTAINER: 'pageContainer'
        };
    }

    static get CACHE_EXPIRATION() { return 300000; }

}
