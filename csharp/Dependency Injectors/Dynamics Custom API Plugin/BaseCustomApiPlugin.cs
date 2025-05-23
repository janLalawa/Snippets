using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Microsoft.Xrm.Sdk;

namespace NAMESPACEHERE.Common
{
    public abstract class BaseCustomApiPlugin : IPlugin
    {
        private readonly Dictionary<string, object> _outputValues = new Dictionary<string, object>();
        protected readonly Dictionary<string, object> InputParameters = new Dictionary<string, object>();
        protected readonly Dictionary<string, object> ResponseProperties = new Dictionary<string, object>();
        protected virtual string ApiName => GetType().Name;
        protected virtual bool IsEnabled => true;

        [Inject] protected IPluginExecutionContext Context { get; set; }
        [Inject] protected ITracingService Trace { get; set; }
        [Inject] protected IOrganizationService Service { get; set; }

        public void Execute(IServiceProvider serviceProvider)
        {
            if (serviceProvider == null) throw new ArgumentNullException(nameof(serviceProvider));

            var correlationId = Guid.NewGuid().ToString().Substring(0, 8);
            var startTime = DateTime.UtcNow;

            try
            {
                ServiceLocator.Initialise(serviceProvider);
                RegisterServices();
                DependencyInjector.InjectDependencies(this);

                RegisterApiPropertiesAuto();
                RegisterApiProperties();

                if (!IsEnabled)
                {
                    Trace.Trace($"[{correlationId}] Custom API '{ApiName}' is disabled.");
                    return;
                }

                Trace.Trace($"[{correlationId}] Beginning Custom API '{ApiName}' execution");
                ValidateInputParameters();
                ExecuteCustomApi();
                SetOutputParametersInContext();
                Trace.Trace($"[{correlationId}] Custom API '{ApiName}' execution completed successfully");
            }
            catch (Exception ex)
            {
                Trace?.Trace($"[{correlationId}] Error in Custom API '{ApiName}' execution: {ex.Message}");
                Trace?.Trace($"[{correlationId}] Stack trace: {ex.StackTrace}");
                throw new InvalidPluginExecutionException($"Custom API '{ApiName}' execution failed: {ex.Message}", ex);
            }
            finally
            {
                Trace?.Trace($"[{correlationId}] Execution time: {DateTime.UtcNow - startTime}");
                ServiceLocator.Clear();
            }
        }

        protected abstract void RegisterServices();

        protected abstract void ExecuteCustomApi();

        protected virtual void RegisterApiProperties()
        {
        }

        private void ValidateInputParameters()
        {
            foreach (var keyValuePair in InputParameters)
            {
                var parameterName = keyValuePair.Key;
                var parameter = keyValuePair.Value;

                var parameterType = parameter.GetType();
                var isRequired = (bool)parameterType.GetProperty("IsRequired").GetValue(parameter);

                if (!isRequired) continue;

                if (!Context.InputParameters.Contains(parameterName))
                {
                    Trace.Trace($"Required parameter {parameterName} is missing.");
                    throw new InvalidPluginExecutionException($"Required parameter {parameterName} is missing.");
                }

                var expectedType = parameterType.GetGenericArguments()[0];
                var value = Context.InputParameters[parameterName];

                if (value != null && !expectedType.IsInstanceOfType(value))
                    throw new InvalidPluginExecutionException(
                        $"Parameter {parameterName} is of incorrect type. Expected {expectedType.Name}.");
            }
        }

        private void SetOutputParametersInContext()
        {
            foreach (var output in _outputValues) Context.OutputParameters[output.Key] = output.Value;
        }

        private void RegisterApiPropertiesAuto()
        {
            var fields = GetType()
                .GetFields(BindingFlags.Static | BindingFlags.NonPublic | BindingFlags.Public)
                .Where(f => f.IsStatic);

            foreach (var field in fields)
            {
                var value = field.GetValue(null);
                if (value == null) continue;

                var type = value.GetType();
                if (!type.IsGenericType) continue;

                var genericType = type.GetGenericTypeDefinition();
                var genericArg = type.GetGenericArguments()[0];

                if (genericType == typeof(InputParameter<>))
                {
                    var registerMethod = typeof(BaseCustomApiPlugin)
                        .GetMethod("RegisterInput", BindingFlags.NonPublic | BindingFlags.Instance)
                        ?.MakeGenericMethod(genericArg);

                    if (registerMethod != null) registerMethod.Invoke(this, new[] { value });
                }
                else if (genericType == typeof(ResponseProperty<>))
                {
                    var registerMethod = typeof(BaseCustomApiPlugin)
                        .GetMethod("RegisterOutput", BindingFlags.NonPublic | BindingFlags.Instance)
                        ?.MakeGenericMethod(genericArg);

                    if (registerMethod != null) registerMethod.Invoke(this, new[] { value });
                }
            }
        }

        protected void RegisterInput<T>(InputParameter<T> parameter)
        {
            if (parameter == null) throw new ArgumentNullException(nameof(parameter));
            InputParameters[parameter.Name] = parameter;
        }

        protected void RegisterOutput<T>(ResponseProperty<T> property)
        {
            if (property == null) throw new ArgumentNullException(nameof(property));
            ResponseProperties[property.Name] = property;
        }

        protected T GetInput<T>(InputParameter<T> parameter)
        {
            if (!Context.InputParameters.Contains(parameter.Name))
                throw new InvalidPluginExecutionException($"Input parameter '{parameter.Name}' not found.");

            return (T)Context.InputParameters[parameter.Name];
        }

        protected void SetOutput<T>(ResponseProperty<T> property, T value)
        {
            if (!ResponseProperties.ContainsKey(property.Name))
                throw new InvalidPluginExecutionException($"Output parameter '{property.Name}' is not defined in ResponseProperties");

            _outputValues[property.Name] = value;
        }
    }
}