using System;
using System.Linq;
using System.Reflection;
using Microsoft.Xrm.Sdk;

namespace NAMESPACEHERE.Common
{
    [AttributeUsage(AttributeTargets.Field | AttributeTargets.Property)]
    public class InjectAttribute : Attribute
    {
    }

    public static class DependencyInjector
    {
        public static void InjectDependencies(object obj)
        {
            if (obj == null)
                throw new ArgumentNullException(nameof(obj));

            var type = obj.GetType();

            var fields = type.GetFields(BindingFlags.NonPublic | BindingFlags.Instance)
                .Where(f => f.GetCustomAttribute<InjectAttribute>() != null);

            foreach (var field in fields)
            {
                var serviceType = field.FieldType;
                var service = ServiceLocator.GetService<object>(serviceType);
                if (service == null)
                    throw new InvalidPluginExecutionException($"Failed to resolve service for field {field.Name} of type {serviceType.Name}");
                field.SetValue(obj, service);
            }

            var properties = type.GetProperties(BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.Public | BindingFlags.SetProperty)
                .Where(p => p.GetCustomAttribute<InjectAttribute>() != null && p.CanWrite);

            foreach (var property in properties)
            {
                var serviceType = property.PropertyType;
                var service = ServiceLocator.GetService<object>(serviceType);
                if (service == null)
                    throw new InvalidPluginExecutionException($"Failed to resolve service for property {property.Name} of type {serviceType.Name}");

                try
                {
                    property.SetValue(obj, service,
                        BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.Public | BindingFlags.SetProperty,
                        null, null, null);
                }
                catch (Exception ex)
                {
                    throw new InvalidPluginExecutionException($"Failed to set property {property.Name} of type {serviceType.Name}. Error: {ex.Message}", ex);
                }
            }
        }
    }
}