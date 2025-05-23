using System;
using Microsoft.Extensions.Configuration;
using Microsoft.Xrm.Tooling.Connector;

namespace NAMESPACEHERE.Clients
{
    public interface ICrmClient
    {
        CrmServiceClient GetCrmClient();
    }

    public class CrmClientHelper : ICrmClient, IDisposable
    {
        private readonly IConfiguration _configuration;
        private readonly string _connectionString;
        private CrmServiceClient _crmServiceClient;

        public CrmClientHelper(IConfiguration configuration)
        {
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
            var url = _configuration["Dynamics365:Url"];
            var username = _configuration["Dynamics365:Username"];
            var password = _configuration["Dynamics365:Password"];

            _connectionString = $@"AuthType=OAuth;
                Url={url};
                Username={username};
                Password={password};
                AppId=51f81489-12ee-4a9e-aaae-a2591f45987d;
                RedirectUri=app://58145B91-0C36-4500-8554-080854F2AC97;
                LoginPrompt=Auto";
        }

        public CrmServiceClient GetCrmClient()
        {
            if (_crmServiceClient != null && _crmServiceClient.IsReady)
            {
                Console.WriteLine("Reusing existing CRM client");
                return _crmServiceClient;
            }

            Console.WriteLine("Creating new CRM client");
            _crmServiceClient = new CrmServiceClient(_connectionString);

            if (!_crmServiceClient.IsReady)
            {
                Console.WriteLine("Failed to connect to Dynamics 365");
                throw new Exception($"Failed to connect to Dynamics 365: {_crmServiceClient.LastCrmError}");
            }

            Console.WriteLine("Connected to Dynamics 365");
            return _crmServiceClient;
        }

        public void Dispose()
        {
            Console.WriteLine("Disposing CRM client");
            _crmServiceClient?.Dispose();
        }
    }
}