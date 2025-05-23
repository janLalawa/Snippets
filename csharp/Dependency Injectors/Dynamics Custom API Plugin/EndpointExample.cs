using NAMESPACEHERE.Common;
using NAMESPACEHERE.Logic.AddNumbers;

namespace NAMESPACEHERE.Endpoints
{
    public sealed class AddNumbersPlugin : BaseCustomApiPlugin
    {
        private static readonly InputParameter<decimal> Number1 = new InputParameter<decimal>("Number1", CrmParameterType.Decimal);
        private static readonly InputParameter<decimal> Number2 = new InputParameter<decimal>("Number2", CrmParameterType.Decimal);
        private static readonly ResponseProperty<string> Result = new ResponseProperty<string>("StringResponseProp", CrmParameterType.String);

        [Inject] private IAddNumbersLogic _logic;

        protected override void RegisterServices()
        {
            ServiceLocator.RegisterService<IAddNumbersLogic>(ServiceFactory.Create<AddNumbersLogic>());
        }

        protected override void ExecuteCustomApi()
        {
            var number1 = GetInput(Number1);
            var number2 = GetInput(Number2);

            var result = _logic.Add(number1, number2);

            SetOutput(Result, result.ToString());
        }
    }
}