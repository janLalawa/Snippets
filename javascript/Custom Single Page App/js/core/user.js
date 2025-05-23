const userManager = {
    app: null,
    currentUser: null,
    privilegeCache: new Map(),
    roleCache: new Map(),
    userCache: new Map(),
    cacheExpiration: Config.CACHE_EXPIRATION,

    setApp(appInstance) {
        this.app = appInstance;
    },

    async initialise() {
        try {
            if (typeof Xrm === 'undefined') {
                throw new Error('This application must be run within Dynamics 365');
            }
            await this.getCurrentUser();
            await this.setUserGreeting(this.currentUser.name); // TODO: Add safety to this so it doesn't break
        } catch (error) {
            console.error('Failed to initialise user manager:', error);
            throw error;
        }
    },

    async getCurrentUser() {
        try {
            if (this.currentUser && this.isValidCache('currentUser')) {
                console.log('Returning cached user:', this.currentUser);
                return this.currentUser;
            }

            const userSettings = this.app.userContext;
            const userRoles = await this.getUserRoles(userSettings.userId);

            this.currentUser = {
                id: userSettings.userId,
                name: userSettings.userName,
                roles: userRoles,
                availablePersonas: await this.getAvailablePersonas(userRoles),
                persona: Config.PERSONAS.EMPLOYEE,
                timestamp: Date.now(),
                timesClicked: userSettings.timesClicked,
                textEntered: userSettings.textEntered,
            };
            console.log('Current user:', this.currentUser);
            return this.currentUser;
        } 
        
        catch (error) {
            console.error('Error getting current user:', error);
            throw error;
        }
    },

    async setUserGreeting(userName) {
        try {
            const greetingElement = document.getElementById('userGreeting');
            greetingElement.textContent = `Welcome, ${userName}!`;
        } catch (error) {
            console.error('Error setting user greetings:', error);
        }
        
    },

    async getUserRoles(userId) {
        try {
            const cacheKey = `roles_${userId}`;
            if (this.roleCache.has(cacheKey) && this.isValidCache(cacheKey)) {
                return this.roleCache.get(cacheKey).roles;
            }
    
            const userRoles = await Xrm.WebApi.retrieveMultipleRecords(
                'systemuserroles',
                `?$filter=systemuserid eq ${userId}`
            );
    
            const roleIds = userRoles.entities.map(role => role.roleid);

            if (roleIds.length === 0) {
                return [];
            }
    
            const roleFilter = roleIds.map(id => `roleid eq ${id}`).join(' or ');
    
            const roleDetails = await Xrm.WebApi.retrieveMultipleRecords(
                'role',
                `?$select=name,roleid&$filter=${roleFilter}`
            );
    
            const rolesList = roleDetails.entities.map(role => ({
                id: role.roleid,
                name: role.name
            }));
    
            this.roleCache.set(cacheKey, {
                roles: rolesList,
                timestamp: Date.now()
            });
    
            return rolesList;
        } catch (error) {
            console.error('Error getting user roles:', error);
            throw error;
        }
    },

    async hasRole(roleName) {
        try {
            const user = await this.getCurrentUser();
            return user.roles.some(role => role.name.toLowerCase() === roleName.toLowerCase());
        } catch (error) {
            console.error('Error checking role:', error);
            return false;
        }
    },

    async getAvailablePersonas(roles) {
        try {
            const availablePersonas = [];
            const userRoleNames = roles.map(role => role.name);
    
            if (userRoleNames.some(roleName => Config.ROLES.ADMIN.includes(roleName))) {
                availablePersonas.push(Config.PERSONAS.ADMIN);
            }
            if (userRoleNames.some(roleName => Config.ROLES.MANAGER.includes(roleName))) {
                availablePersonas.push(Config.PERSONAS.MANAGER);
            }
            if (userRoleNames.some(roleName => Config.ROLES.EMPLOYEE.includes(roleName))) {
                availablePersonas.push(Config.PERSONAS.EMPLOYEE);
            }
    
            if (availablePersonas.length === 0) {
                availablePersonas.push(Config.PERSONAS.EMPLOYEE);
            }
    
            console.log('Available personas:', availablePersonas);
            return availablePersonas;
        } catch (error) {
            console.error('Error getting available personas:', error);
            return [Config.PERSONAS.EMPLOYEE];
        }
    },

    async setPersona(persona) {
        try {
            if (!this.currentUser) {
                await this.getCurrentUser();
            }
            if (!this.currentUser.availablePersonas.includes(persona)) {
                throw new Error('Invalid persona');
            }
    
            this.currentUser.persona = persona;
            console.log('Persona set:', persona);

            this.app.router.renderNavigation(persona);

        } catch (error) {
            console.error('Error setting persona:', error);
            throw error;
        }
    },

    async incrementCount()
    {
        this.currentUser.timesClicked ++;
        app.renderToElement('timesClickedButton', `${app.user.currentUser.timesClicked}`);
    },


    isValidCache(cacheKey) {
        const cachedData = this.roleCache.get(cacheKey) || 
                          this.privilegeCache.get(cacheKey) || 
                          (cacheKey === 'currentUser' ? this.currentUser : null);

        if (!cachedData || !cachedData.timestamp) {
            return false;
        }

        const now = Date.now();
        return (now - cachedData.timestamp) < this.cacheExpiration;
    },

    clearCache() {
        this.currentUser = null;
        this.privilegeCache.clear();
        this.roleCache.clear();
        this.userCache.clear();
    }
};
