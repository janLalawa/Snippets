(function() {
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';

    const originalXrm = window.Xrm;

    const mockXrm = {
        _mockData: {
            currentUser: {
                id: "mock-user-id",
                roles: [
                    { id: "role1", name: "Basic User" },
                    { id: "role2", name: "Employee" },
                    { id: "role3", name: "Manager" },
                    { id: "role4", name: "System Administrator" }
                ],
                timesClicked: 2,
                textEntered: "nothing"
            },
            systemuserroles: [
                { systemuserid: "mock-user-id", roleid: "role1" },
                { systemuserid: "mock-user-id", roleid: "role2" },
                { systemuserid: "mock-user-id", roleid: "role3" },
                { systemuserid: "mock-user-id", roleid: "role4" }
            ]
        },

        WebApi: {
            async retrieveMultipleRecords(entityName, queryString) {
                console.log(`Mock WebApi call: ${entityName}, ${queryString}`);

                if (entityName === 'systemuserroles') {
                    return {
                        entities: mockXrm._mockData.systemuserroles
                    };
                }

                if (entityName === 'role') {
                    return {
                        entities: mockXrm._mockData.currentUser.roles
                    };
                }

                return { entities: [] };
            }
        },

        Utility: {
            getGlobalContext: () => ({
                client: {
                    getClient: () => "Web",
                    getFormFactor: () => "Desktop",
                    isOffline: () => false
                },
                userSettings: {
                    userId: mockXrm._mockData.currentUser.id,
                    userName: "Mock User",
                    languageId: 1033,
                    securityRoles: mockXrm._mockData.currentUser.roles,
                    timesClicked: mockXrm._mockData.currentUser.timesClicked,
                    textEntered: mockXrm._mockData.currentUser.textEntered
                },
                organizationSettings: {
                    organizationId: "mock-org-id",
                    uniqueName: "mockorg"
                }
            })
        }
    };

    Object.defineProperty(window, 'Xrm', {
        get: function() {
            if (window.app?.testMode === true) {
                console.log('Using Mock Xrm (testMode)');
                return mockXrm;
            }

            if (isLocalhost) {
                console.log('Using Mock Xrm (localhost)');
                return mockXrm;
            }

            return originalXrm;
        },
        set: function(value) {
            originalXrm = value;
        },
        configurable: true
    });
})();