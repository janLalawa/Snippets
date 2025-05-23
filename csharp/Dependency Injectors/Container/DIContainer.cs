namespace NAMESPACEHERE
{
    using System;
    using System.Collections.Generic;
    using System.Linq;

    public class ServiceDescriptor
    {
        public Type ServiceType { get; }
        public Type ImplementationType { get; }
        public object Instance { get; }
        public bool IsSingleton { get; }

        private ServiceDescriptor(Type serviceType, Type implementationType, object instance, bool isSingleton)
        {
            ServiceType = serviceType;
            ImplementationType = implementationType;
            Instance = instance;
            IsSingleton = isSingleton;
        }

        public static ServiceDescriptor Transient(Type serviceType, Type implementationType)
            => new ServiceDescriptor(serviceType, implementationType, null, false);

        public static ServiceDescriptor Singleton(Type serviceType, Type implementationType)
            => new ServiceDescriptor(serviceType, implementationType, null, true);

        public static ServiceDescriptor SingletonInstance(Type serviceType, object instance)
            => new ServiceDescriptor(serviceType, instance?.GetType(), instance, true);
    }

    public class PluginContainer : IDisposable
    {
        private readonly Dictionary<Type, ServiceDescriptor> _services;
        private readonly Dictionary<Type, object> _singletons;

        public PluginContainer()
        {
            _services = new Dictionary<Type, ServiceDescriptor>();
            _singletons = new Dictionary<Type, object>();
        }

        public void Register<TInterface, TImplementation>() where TImplementation : TInterface
        {
            _services[typeof(TInterface)] = ServiceDescriptor.Transient(typeof(TInterface), typeof(TImplementation));
        }

        public void RegisterSingleton<TInterface, TImplementation>() where TImplementation : TInterface
        {
            _services[typeof(TInterface)] = ServiceDescriptor.Singleton(typeof(TInterface), typeof(TImplementation));
        }

        public void RegisterInstance<TInterface>(TInterface instance)
        {
            _services[typeof(TInterface)] = ServiceDescriptor.SingletonInstance(typeof(TInterface), instance);
        }

        public T Resolve<T>()
        {
            return (T)Resolve(typeof(T));
        }

        private object Resolve(Type serviceType)
        {
            if (!_services.TryGetValue(serviceType, out var descriptor))
            {
                throw new InvalidOperationException($"Service of type {serviceType.Name} is not registered");
            }

            if (descriptor.Instance != null)
            {
                return descriptor.Instance;
            }

            if (descriptor.IsSingleton && _singletons.TryGetValue(serviceType, out var singleton))
            {
                return singleton;
            }

            var implementation = CreateInstance(descriptor.ImplementationType);

            if (descriptor.IsSingleton)
            {
                _singletons[serviceType] = implementation;
            }

            return implementation;
        }

        private object CreateInstance(Type type)
        {
            var constructors = type.GetConstructors();
            var constructor = constructors.First();

            var parameters = constructor.GetParameters()
                .Select(p => Resolve(p.ParameterType))
                .ToArray();

            return constructor.Invoke(parameters);
        }

        public void Dispose()
        {
            foreach (var singleton in _singletons.Values.OfType<IDisposable>())
            {
                singleton.Dispose();
            }

            _singletons.Clear();
            _services.Clear();
        }
    }
}