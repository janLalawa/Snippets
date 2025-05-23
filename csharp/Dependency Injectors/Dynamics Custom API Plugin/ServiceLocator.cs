using System;
using System.Collections.Generic;
using System.Threading;
using Microsoft.Xrm.Sdk;

namespace NAMESPACEHERE.Common
{
    public static class ServiceLocator
    {
        private static readonly AsyncLocal<Dictionary<Type, object>> _services = new AsyncLocal<Dictionary<Type, object>>
            { Value = new Dictionary<Type, object>() };

        public static void Initialise(IServiceProvider serviceProvider)
        {
            _services.Value = new Dictionary<Type, object>();

            var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            var factory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            var trace = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
            var orgService = factory.CreateOrganizationService(context.UserId);

            RegisterService<IPluginExecutionContext>(context);
            RegisterService<ITracingService>(trace);
            RegisterService<IOrganizationService>(orgService);
        }

        public static void RegisterService<T>(object service) where T : class
        {
            if (service == null)
                throw new ArgumentNullException(nameof(service));

            if (_services.Value == null)
                _services.Value = new Dictionary<Type, object>();

            _services.Value[typeof(T)] = service;
        }

        public static T GetService<T>(Type serviceType) where T : class
        {
            if (_services.Value == null)
                throw new InvalidOperationException("Service container not initialized");

            if (_services.Value.TryGetValue(serviceType, out var service))
                return (T)service;
            throw new InvalidPluginExecutionException($"Service for {serviceType.Name} not found.");
        }

        public static void Clear()
        {
            _services.Value?.Clear();
        }
    }

    public static class ServiceFactory
    {
        public static T Create<T>() where T : class, new()
        {
            var instance = new T();
            DependencyInjector.InjectDependencies(instance);
            return instance;
        }
    }
}