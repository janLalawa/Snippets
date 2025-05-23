using System;
using NAMESPACEHERE.Handlers.Factory;

namespace NAMESPACEHERE;

public static class ServiceLocator
{
    private static readonly Dictionary<Type, INodeFactory> _factories = new();
    private static readonly Dictionary<Type, object> _services = new();

    public static void RegisterNodeFactory<T>(INodeFactory factory) where T : Node2D
    {
        _factories[typeof(T)] = factory;
    }

    public static INodeFactory GetNodeFactory<T>() where T : Node2D
    {
        if (_factories.TryGetValue(typeof(T), out var factory))
            return factory;
        throw new Exception($"Factory for {typeof(T)} found.");
    }

    public static void RegisterService<T>(object service) where T : class
    {
        _services[typeof(T)] = service;
    }

    public static T GetService<T>() where T : class
    {
        if (_services.TryGetValue(typeof(T), out var service))
            return (T)service;
        throw new Exception($"Service for {typeof(T)} not found.");
    }
}