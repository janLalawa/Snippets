using System;
using System.Reflection;

namespace NAMESPACEHERE;

[AttributeUsage(AttributeTargets.Field | AttributeTargets.Property)]
public class InjectAttribute : Attribute
{
}

public static class DependencyInjector
{
    public static void InjectDependencies(object obj)
    {
        var type = obj.GetType();
        var fields = type.GetFields(BindingFlags.NonPublic | BindingFlags.Instance)
                         .Where(f => f.GetCustomAttribute<InjectAttribute>() != null);

        foreach (var field in fields)
        {
            var serviceType = field.FieldType;
            var genericMethod = typeof(ServiceLocator).GetMethod("GetService")?.MakeGenericMethod(serviceType);

            if (genericMethod == null) continue;
            var service = genericMethod.Invoke(null, null);
            field.SetValue(obj, service);
        }
    }
}