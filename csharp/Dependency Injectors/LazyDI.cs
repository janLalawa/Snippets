using NAMESPACEHERE.Mapping.Clients;
using NAMESPACEHERE.Mapping.Controllers;
using NAMESPACEHERE.Mapping.Logic;
using NAMESPACEHERE.Mapping.Services;
using Microsoft.Extensions.Configuration;

namespace NAMESPACEHERE.Mapping
{
    internal class Program
    {
        public static void Main(string[] args)
        {
            var logger = new LoggerService();

            var configBuilder = new ConfigurationBuilder()
                .AddJsonFile(
                    "C:\\....updateme....\\appsettings.json",
                    false, true);
            var configRoot = configBuilder.Build();

            var crmClientHelper = new CrmClientHelper(configRoot);
            var crmClient = crmClientHelper.GetCrmClient();
            var retrievalService = new RetrievalService(crmClient, logger);
            var parseService = new ParseService(logger);
            var comparisonService = new ComparisonService(logger);
            var mappingLogic = new MappingLogic(logger);
            var mappingService = new MappingService(logger, retrievalService, mappingLogic);
            var builderService = new BuilderService(logger);
            var updateService = new UpdateService(logger, crmClient);

            var controller = new MapController(
                builderService,
                comparisonService,
                mappingService,
                parseService,
                retrievalService,
                updateService,
                logger
            );

            controller.MapResponse();
        }
    }
}