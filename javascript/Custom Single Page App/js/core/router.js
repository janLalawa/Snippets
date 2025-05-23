class Router {
    constructor() {
        this.routes = new Map();
        this.currentPage = null;
        this.templateCache = new Map();
        this.currentCss = null;
        this.app = null;
        this.navStack = [];
        this.currentRouteIndex = -1;
    }

    setApp(appInstance) {
        this.app = appInstance;
    }

    addRoute(name, config) {
        const routeConfig = {
            ...config,
            roles: config.roles || ['Basic User'], // TODO: Move defaults to config
            requiresAuth: config.requiresAuth !== false
        };
        console.log (`Adding route ${name}:`, routeConfig);
        this.routes.set(name, routeConfig);
    }

    async navigateTo(routeName, isBackNavigation = false) {
        try {
            if (!this.routes.has(routeName)) {
                return await this.loadErrorPage('404', `Page not found: ${routeName}`);
            }

            const route = this.routes.get(routeName);

            if (!isBackNavigation) {
                this.updateNavigationStack(routeName);
            }

            if (route.requiresAuth && !(await this.checkRouteAccess(route))) {
                return await this.loadErrorPage('403', 'Access denied');
            }

            this.updatePageTitle(routeName);
            this.updateCurrentPage(routeName);

            await this.handlePageTransition(routeName, route);

        } catch (error) {
            console.error('Navigation error:', error);
            await this.loadErrorPage('500', error.message);
        }
    }

    updateNavigationStack(routeName) {
        if (routeName === this.navStack[this.currentRouteIndex]) return;

        this.navStack = this.navStack.slice(0, this.currentRouteIndex + 1);
        this.navStack.push(routeName);
        this.currentRouteIndex = this.navStack.length - 1;
    }

    async handlePageTransition(routeName, route) {
        if (this.currentPage) {
            this.currentPage.classList.remove('active');
            this.cleanupCurrentCSS(route);
        }

        let pageElement = document.getElementById(`page-${routeName}`);
        if (!pageElement) {
            pageElement = await this.loadPage(routeName, route);
        } else {
            await this.refreshExistingPage(route);
        }

        pageElement.classList.add('active');
        this.currentPage = pageElement;
    }

    cleanupCurrentCSS(newRoute = null) {
        if ((!newRoute || !newRoute.css) && this.currentCSS) {
            const oldLink = document.querySelector(`link[href="${this.currentCSS}"]`);
            oldLink?.remove();
            this.currentCSS = null;
        }
    }

    async refreshExistingPage(route) {
        if (route.onLoad) {
            await route.onLoad();
            if (route.css) {
                await this.loadCSS(route.css);
            }
        }
    }

    async navigateBack() {
        if (this.currentRouteIndex === 0) return;

        this.currentRouteIndex--;
        const routeName = this.navStack[this.currentRouteIndex];
        await this.navigateTo(routeName, true);
    }

    async navigateHome() {
        await this.navigateTo(Config.DEFAULT_ROUTE);
    }

    async refreshFullPage(routeName = null) {
        document.getElementById(Config.ELEMENTS.PAGE_CONTAINER).replaceChildren();
        this.templateCache.clear();
        this.cleanupCurrentCSS();
        this.currentPage = null;

        const currentUser = await this.app.user.getCurrentUser();
        const persona = currentUser?.persona;
    
        if (persona) {
            this.renderNavigation(persona);
        }
    
        const targetRoute = routeName || this.navStack[this.currentRouteIndex];
        if (targetRoute) {
            await this.navigateTo(targetRoute);
        }
    }


    updatePageTitle(routeName) {
        const titleText = routeName.replace('flexhr_', '').charAt(0).toUpperCase() + routeName.replace('flexhr_', '').slice(1);
        const pageTitleElement = document.getElementById('pageTitle');
        if (pageTitleElement) {
            pageTitleElement.innerHTML = `MyAccess Annual Leave Management - ${titleText}`;
        }
    }

    updateCurrentPage(routeName) {
        const navButtons = document.querySelectorAll('#navigation button');
        navButtons.forEach(button => button.classList.remove('active'));
    
        const currentNavButton = document.getElementById(`nav-${routeName}`);
        if (currentNavButton) {
            currentNavButton.classList.add('active');
        }
    }

    async checkRouteAccess(route) {
        try {
            if (!route.roles || route.roles.length === 0) {
                return await app.user.hasRole(Config.ROLES.DEFAULT);
            }

            for (const role of route.roles) {
                if (await app.user.hasRole(role)) {
                    return true;
                }
            }

            return false;
        } catch (error) {
            console.error('Error checking route access:', error);
            return false;
        }
    }

    

    async loadPage(routeName, route) {
        try {
            const pageElement = document.createElement('div');
            pageElement.id = `page-${routeName}`;
            pageElement.className = 'page';

            const contentContainer = document.createElement('div');
            contentContainer.className = 'page-content';

            if (route.templateUrl) {
                const template = await this.loadTemplate(route.templateUrl);
                contentContainer.innerHTML = template;
            } else if (route.template) {
                contentContainer.innerHTML = route.template;
            }

            pageElement.appendChild(contentContainer);

            if (route.css) await this.loadCSS(route.css);
            if (route.js) await this.loadJS(route.js);

            document.getElementById(Config.ELEMENTS.PAGE_CONTAINER).appendChild(pageElement);

            if (route.onLoad) {
                route.onLoad();
            }

            return pageElement;
        } catch (error) {
            console.error('Error loading page:', error);
            throw error;
        }
    }

    async loadTemplate(path) {
        if (this.templateCache.has(path)) {
            return this.templateCache.get(path);
        }

        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Failed to load template: ${path}`);
            }
            const template = await response.text();
            this.templateCache.set(path, template);
            return template;
        } catch (error) {
            console.error(`Error loading template ${path}:`, error);
            throw error;
        }
    }

    async loadCSS(path) {
        if (this.currentCSS) {
            const oldLink = document.querySelector(`link[href="${this.currentCSS}"]`);
            if (oldLink) {
                oldLink.remove();
            }
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = path;
        document.head.appendChild(link);

        this.currentCSS = path;

        return new Promise((resolve, reject) => {
            link.onload = resolve;
            link.onerror = reject;
        });
    }

    async loadJS(path) {
        if (document.querySelector(`script[src="${path}"]`)) return;

        const script = document.createElement('script');
        script.src = path;
        document.body.appendChild(script);

        return new Promise((resolve) => {
            script.onload = resolve;
        });
    }

    async loadErrorPage(errorCode, errorMessage) {
        const errorTemplate = `
            <div class="error-page">
                <h2>Error ${errorCode}</h2>
                <p>${errorMessage}</p>
                <button onclick="app.router.navigateTo('${Config.DEFAULT_ROUTE}')">Return Home</button>
            </div>
        `;

        const pageElement = document.createElement('div');
        pageElement.id = 'error-page';
        pageElement.className = 'page active';
        pageElement.innerHTML = errorTemplate;

        if (this.currentPage) {
            this.currentPage.classList.remove('active');
        }

        document.getElementById(Config.ELEMENTS.PAGE_CONTAINER).appendChild(pageElement);
        this.currentPage = pageElement;
    }

    async renderNavigation(persona) {
        const navContainer = document.getElementById('navigation');
        if (!navContainer) return;
    
        navContainer.innerHTML = '';
    
        const userHasAccess = (roles) => {
            if (!roles || roles.length === 0) return true;
            if (persona === 'Admin') return true;
            return roles.includes(persona);
        };
    
        for (const [routeName, routeConfig] of this.routes.entries()) {
            if (!userHasAccess(routeConfig.roles)) continue;
    
            const button = document.createElement('button');
            button.id = `nav-${routeName}`;
            button.className = 'button-text';
            button.title = routeConfig.label || routeName;
            button.onclick = () => this.navigateTo(routeName);
    
            const span = document.createElement('span');
            span.innerText = routeConfig.label || routeName;
            button.appendChild(span);
    
            navContainer.appendChild(button);
        }
    
        const activePage = document.querySelector('.page.active');
        const activeRoute = activePage?.id?.replace('page-', '');
    
        this.highlightActiveNav(activeRoute);
    }
    
    async highlightActiveNav(routeName) {
        const navButtons = document.querySelectorAll('#navigation .button-text');
        navButtons.forEach(btn => btn.classList.remove('active'));
    
        const currentNavButton = document.getElementById(`nav-${routeName}`);
        if (currentNavButton) {
            currentNavButton.classList.add('active');
        }
    }
}
