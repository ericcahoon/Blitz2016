using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Fakes;
using System.Linq;
using Microsoft.Crm.Sdk.Messages;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Fakes;
using Microsoft.Xrm.Sdk.Query;
using Microsoft.Xrm.Sdk.Messages;

//ReSharper disable once CheckNamespace
namespace CH.Xrm.UnitTests
{
    public class Common
    {
        /// <summary>
        /// Creates a stubbed service provider object that has generic handlers for tracking
        /// </summary>
        /// <param name="service">Stubbed IOrganizationService to use in the Service provider</param>
        /// <param name="context">Stubbed IPluginExecutionContext to use in the Service provider</param>
        /// <returns></returns>
        public static IServiceProvider GetServiceProvider(StubIOrganizationService service,
            StubIPluginExecutionContext context)
        {
            // IOrganizationServiceFactory
            var factory = new StubIOrganizationServiceFactory {
                CreateOrganizationServiceNullableOfGuid = id => service
            };

            // IServiceProvider
            var serviceProvider = new StubIServiceProvider {
                GetServiceType = type =>
                {
                    if (type == typeof(IPluginExecutionContext)) {
                        return context;
                    }
                    if (type == typeof(IOrganizationServiceFactory)) {
                        return factory;
                    }

                    return null;
                }
            };

            return serviceProvider;

        }


        /// <summary>
        /// Create StubIOrganizationService Object that has generic handlers for the Create, ExecuteOrganizationRequest, RetrieveMultiple, and Update requests
        /// </summary>
        /// <param name="retrieveHandlers">Collection of delegate that define how to handle retrieve multiple requests for particular entities</param>
        /// <param name="recordsCreated">Collection to hold the records that are created through the CRM API</param>
        /// <param name="recordsRetrieved">Collection to hold the records that are retrieved through the CRM API</param>
        /// <param name="recordsUpdated">Collection to hold the records that are updated through the CRM API</param>
        /// <param name="recordsDeleted">Collection to hold the records that are deleted through the CRM API</param>
        /// <returns></returns>
        public static StubIOrganizationService GetStubIOrganizationService(Dictionary<string, Func<QueryExpression, EntityCollection>> retrieveHandlers,
            List<Entity> recordsCreated,
            List<Entity> recordsUpdated,
            List<Entity> recordsRetrieved,
            List<Entity> recordsDeleted)
        {

            return new StubIOrganizationService() {
                //Handle the plugin making a Create request against the CRM API
                CreateEntity = toCreate => HandleCreateRequest(toCreate, recordsCreated),

                RetrieveStringGuidColumnSet = (logicalNameAttribute, id, columnSet) => HandleRetrieveRequest(logicalNameAttribute, id, columnSet, recordsCreated, recordsUpdated, recordsRetrieved),

                //Handle the plugin making a RetrieveMultiple request against the CRM API
                RetrieveMultipleQueryBase =
                    query => HandleRetrieveMultipleRequest(query, recordsRetrieved, retrieveHandlers),

                //Handle the plugin making an Execute request against the CRM API
                ExecuteOrganizationRequest = request => HandleExecuteOrganizationRequest(request, recordsCreated, recordsDeleted, recordsUpdated, recordsRetrieved),

                //Handle the plugin making an Update request against the CRM API
                UpdateEntity = record => HandleUpdateRequest(record, recordsUpdated, recordsCreated)
            };

        }

        /// <summary>
        /// Create StubIOrganizationService Object that has generic handlers for the Create, ExecuteOrganizationRequest, RetrieveMultiple, and Update requests
        /// </summary>
        public static StubIOrganizationService GetStubIOrganizationService(Dictionary<string, Func<QueryExpression, EntityCollection>> retrieveHandlers, List<Entity> recordCollection)
        {
            return GetStubIOrganizationService(retrieveHandlers,
                recordCollection,
                new List<Entity>(),
                new List<Entity>(),
                new List<Entity>());
        }

        /// <summary>
        /// Create StubIOrganizationService Object that has generic handlers for the Create, ExecuteOrganizationRequest, RetrieveMultiple, and Update requests
        /// </summary>
        public static StubIOrganizationService GetStubIOrganizationService(List<Entity> recordCollection)
        {
            return GetStubIOrganizationService(new Dictionary<string, Func<QueryExpression, EntityCollection>>(),
                recordCollection,
                new List<Entity>(),
                new List<Entity>(),
                new List<Entity>());
        }

        /// <summary>
        /// Create StubIOrganizationService Object that has generic handlers for the Create, ExecuteOrganizationRequest, RetrieveMultiple, and Update requests
        /// </summary>
        public static StubIOrganizationService GetStubIOrganizationService()
        {
            return GetStubIOrganizationService(new Dictionary<string, Func<QueryExpression, EntityCollection>>(),
                new List<Entity>(),
                new List<Entity>(),
                new List<Entity>(),
                new List<Entity>());
        }

        /// <summary>
        /// Handles updating a test place holder entity with values that get passed in through an update request
        /// </summary>
        /// <param name="source">The entity that contains the new values</param>
        /// <param name="tartget">The test place holder entity to update</param>
        public static void SetEntityAttributeVales(Entity source, Entity tartget)
        {
            if (source == null ||
                source.Attributes == null ||
                tartget == null) { } else {
                foreach (var attr in source.Attributes) {
                    if (tartget.Contains(attr.Key)) {
                        tartget[attr.Key] = attr.Value;
                    } else {
                        tartget.Attributes.Add(new KeyValuePair<string, object>(attr.Key, attr.Value));
                    }
                }
            }
        }

        #region CRM Server Request Handlers

        /// <summary>
        ///     Fake to handle the plugin making a Create request to the CRM API
        /// </summary>
        /// <param name="toCreate">Entity Posted to CRM API in the Create Request</param>
        /// <param name="recordsCreated">Collection to hold the records that are created through the CRM API</param>
        /// <returns></returns>
        public static Guid HandleCreateRequest(Entity toCreate, List<Entity> recordsCreated)
        {
            toCreate.Id = Guid.NewGuid();

            recordsCreated.Add(toCreate);

            return toCreate.Id;
        }

        /// <summary>
        ///     Fake to handle the plugin making an Update request to the CRM API
        /// </summary>
        /// <param name="toUpdate">Entity Posted to CRM API in the Update Request</param>
        /// <param name="recordsUpdated">Collection to hold the records that are updated through the CRM API</param>
        /// <param name="recordsCreated"></param>
        public static void HandleUpdateRequest(Entity toUpdate, List<Entity> recordsUpdated,
            List<Entity> recordsCreated)
        {
            if (toUpdate.Id == Guid.Empty) {
                return;
            }

            //Check if we've already updated this recorded
            if (!(from r
                in recordsUpdated
                  where r.Id == toUpdate.Id
                  select r).Any()) {
                recordsUpdated.Add(toUpdate);
            }

            //Ensure values are synced between RecordsCreated collection and the record being updated
            SetEntityAttributeVales(toUpdate, (from r
                in recordsCreated
                                               where r.Id == toUpdate.Id
                                               select r).FirstOrDefault());
        }

        /// <summary>
        ///     Fake to handle the plugin making an Execute request to the CRM API
        /// </summary>
        /// <param name="request"></param>
        /// <param name="recordsDeleted"></param>
        /// <param name="recordsUpdated">Collection to hold the records that are updated through the CRM API</param>
        /// <param name="recordsRetrieved"></param>
        /// <param name="recordsCreated"></param>
        /// <returns></returns>
        public static OrganizationResponse HandleExecuteOrganizationRequest(OrganizationRequest request, List<Entity> recordsCreated, List<Entity> recordsDeleted,
            List<Entity> recordsUpdated, List<Entity> recordsRetrieved)
        {
            OrganizationResponse toReturn = null;

            var executeMultipleRequest = request as ExecuteMultipleRequest;
            if (executeMultipleRequest != null) {
                var err = new ExecuteMultipleResponse();
                err["Responses"] = new ExecuteMultipleResponseItemCollection();

                var loopLength = executeMultipleRequest.Requests.Count;

                //use a for loop instead of foreach so we can keep track of the index of the request in the executeMultipleRequest.Requests collection
                for (int i = 0; i < loopLength; i++) {
                    var r = executeMultipleRequest.Requests[i];
                    var createRequest = r as CreateRequest;
                    if (createRequest != null) {
                        var cr = new CreateResponse();
                        cr["id"] = HandleCreateRequest(createRequest.Target, recordsCreated);

                        err.Responses.Add(new ExecuteMultipleResponseItem() {
                            RequestIndex = i,
                            Response = cr
                        });
                    }


                    var updateRequest = r as UpdateRequest;
                    if (updateRequest != null) {
                        var ur = new UpdateResponse();
                        HandleUpdateRequest(updateRequest.Target, recordsUpdated, recordsCreated);

                        err.Responses.Add(new ExecuteMultipleResponseItem() {
                            RequestIndex = i,
                            Response = ur
                        });
                    }


                    var retrieveRequest = r as RetrieveRequest;
                    if (retrieveRequest != null) {
                        var rr = new RetrieveResponse();
                        rr["Entity"] = HandleRetrieveRequest(retrieveRequest.Target.LogicalName, retrieveRequest.Target.Id,
                            retrieveRequest.ColumnSet, recordsUpdated, recordsCreated, recordsRetrieved);

                        err.Responses.Add(new ExecuteMultipleResponseItem() {
                            RequestIndex = i,
                            Response = rr
                        });
                    }
                }

                toReturn = err;
            }

            var stateRequest = request as SetStateRequest;
            if (stateRequest != null) {
                var logicalName = stateRequest.EntityMoniker.LogicalName;
                var id = stateRequest.EntityMoniker.Id;
                var record = (from r
                    in recordsUpdated
                              where r.LogicalName == logicalName &&
                                    r.Id == id
                              select r).FirstOrDefault();
                if (record == null) {
                    recordsUpdated.Add(new Entity(logicalName) {
                        Id = id,
                        Attributes =
                        {
                            {"statecode", stateRequest.State},
                            {"statuscode", stateRequest.Status}
                        }
                    });
                } else {
                    record["statecode"] = stateRequest.State;
                    record["statuscode"] = stateRequest.Status;
                }
            }


            // ReSharper disable once ExpressionIsAlwaysNull
            return toReturn;
        }

        // ReSharper disable once UnusedParameter.Local
        private static Entity HandleRetrieveRequest(string entityLogicalName, Guid entityId, ColumnSet columnSet, List<Entity> recordsUpdated,
            List<Entity> recordsCreated, List<Entity> recordsRetrieved)
        {
            if (string.IsNullOrEmpty(entityLogicalName) || entityId.Equals(Guid.Empty)) return null;

            Entity toReturn = (recordsUpdated == null || !recordsUpdated.Any() ? null : (from r
                in recordsUpdated
                                                                                         where r.Id == entityId
                                                                                         select r).FirstOrDefault()) ?? (recordsCreated == null || !recordsCreated.Any()
                    ? null
                    : (from r
                        in recordsCreated
                       where r.Id == entityId
                       select r).FirstOrDefault());

            if (toReturn != null) {
                if (recordsRetrieved == null) recordsRetrieved = new List<Entity>();

                recordsRetrieved.Add(toReturn);
            }
            return toReturn;
        }

        /// <summary>
        ///     Fake to handle the plugin making a RetrieveMultiple request to the CRM API
        /// </summary>
        /// <param name="query"></param>
        /// <param name="recordsRetrieved">Collection to hold the records that are retrieved through the CRM AP</param>
        /// <param name="retrieveHandlers"></param>
        /// <returns></returns>
        public static EntityCollection HandleRetrieveMultipleRequest(QueryBase query, List<Entity> recordsRetrieved,
            Dictionary<string, Func<QueryExpression, EntityCollection>> retrieveHandlers)
        {
            var results = new EntityCollection();

            if (query.GetType().Name.Equals("QueryExpression")) {
                var qExpression = (QueryExpression)query;

                if (retrieveHandlers != null &&
                         retrieveHandlers.ContainsKey(qExpression.EntityName)) {
                    results = retrieveHandlers[qExpression.EntityName](qExpression);
                }
            }

            //Add to collection of records that have been retrieved
            foreach (var result in results.Entities) {
                if (recordsRetrieved.All(e => e.Id != result.Id)) {
                    recordsRetrieved.Add(result);
                }
            }

            return results;
        }

        #endregion CRM Server Request Handlers
    }
}
