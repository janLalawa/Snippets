using System;

namespace NAMESPACEHERE.Common
{
    public enum CrmParameterType
    {
        String,
        Decimal,
        Integer,
        Boolean,
        DateTime,
        EntityReference,
        Money,
        Float,
        Picklist,
        Guid
    }

    public class InputParameter<T>
    {
        public InputParameter(string name, CrmParameterType type, bool isRequired = true)
        {
            Name = name ?? throw new ArgumentNullException(nameof(name));
            Type = type;
            IsRequired = isRequired;
        }

        public string Name { get; }
        public CrmParameterType Type { get; }
        public bool IsRequired { get; }
    }

    public class ResponseProperty<T>
    {
        public ResponseProperty(string name, CrmParameterType type)
        {
            Name = name ?? throw new ArgumentNullException(nameof(name));
            Type = type;
        }

        public string Name { get; }
        public CrmParameterType Type { get; }
    }
}