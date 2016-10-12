﻿using System;
using System.Globalization;
using System.Linq;
using Microsoft.Xrm.Sdk;

namespace CH.Xrm.Plugins.Common
{
    public class LocalPluginContext
    {
        #region Properties

        /// <summary>
        /// The current event the plugin is executing for.
        /// </summary>
        public RegisteredEvent Event { get; private set; }
        /// <summary>
        /// The IOrganizationService of the plugin, Impersonated as the user that triggered the services.  TODO: Create SystemOrganizationService?
        /// </summary>
        public IOrganizationService OrganizationService { get; private set; }
        /// <summary>
        /// The IPluginExecutionContext of the plugin.
        /// </summary>
        public IPluginExecutionContext PluginExecutionContext { get; private set; }
        /// <summary>
        /// The Type.FullName of the plugin.
        /// </summary>
        public String PluginTypeName { get; private set; }
        /// <summary>
        /// The ITracingService of the plugin.
        /// </summary>
        public ITracingService TracingService { get; private set; }

        #endregion // Properties

        #region ImageNames struct

        public struct PluginImageNames
        {
            public const string PRE_IMAGE = "PreImage";
            public const string POST_IMAGE = "PostImage";
        }

        #endregion ImageNames struct

        #region Constructors

        /// <summary>
        /// Initializes a new instance of the <see cref="LocalPluginContext"/> class.
        /// </summary>
        /// <param name="serviceProvider">The service provider.</param>
        /// <param name="plugin">The plugin.</param>
        /// <exception cref="System.ArgumentNullException">
        /// serviceProvider
        /// or
        /// plugin
        /// </exception>
        public LocalPluginContext(IServiceProvider serviceProvider, IRegisteredEventsPlugin plugin)
        {
            if (serviceProvider == null) {
                throw new ArgumentNullException("serviceProvider");
            }

            if (plugin == null) {
                throw new ArgumentNullException("plugin");
            }

            InitializeServiceProviderProperties(serviceProvider);
            InitializePluginProperties(PluginExecutionContext, plugin);
        }

        #endregion // Constructors

        #region PropertyInitializers

        /// <summary>
        /// Initializes the IServiceProvider properties.
        /// </summary>
        /// <param name="serviceProvider">The service provider.</param>
        private void InitializeServiceProviderProperties(IServiceProvider serviceProvider)
        {
            PluginExecutionContext = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            TracingService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));

            var factory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            OrganizationService = factory.CreateOrganizationService(PluginExecutionContext.UserId);
        }

        /// <summary>
        /// Initializes the plugin properties.
        /// </summary>
        /// <param name="context">The context.</param>
        /// <param name="plugin">The plugin.</param>
        private void InitializePluginProperties(IPluginExecutionContext context, IRegisteredEventsPlugin plugin)
        {
            // Iterate over all of the expected registered events to ensure that the plugin
            // has been invoked by an expected event
            // For any given plug-in event at an instance in time, we would expect at most 1 result to match.
            Event = plugin.RegisteredEvents.FirstOrDefault(a =>
                (int)a.Stage == context.Stage &&
                a.MessageName == context.MessageName &&
                (string.IsNullOrWhiteSpace(a.EntityLogicalName) || a.EntityLogicalName == context.PrimaryEntityName)
                );

            PluginTypeName = plugin.GetType().FullName;
        }

        #endregion // PropertyInitializers

        #region Trace

        /// <summary>
        /// Traces the specified message.  Guaranteed to not throw an exception.
        /// </summary>
        /// <param name="message">The message.</param>
        public void Trace(string message)
        {
            try {
                if (string.IsNullOrWhiteSpace(message) || TracingService == null) {
                    return;
                }

                if (PluginExecutionContext == null) {
                    TracingService.Trace(message);
                } else {
                    TracingService.Trace(
                        "{0}, Correlation Id: {1}, Initiating User: {2}",
                        message,
                        PluginExecutionContext.CorrelationId,
                        PluginExecutionContext.InitiatingUserId);
                }
            }
            catch (Exception ex) {
                try {
                    // ReSharper disable once PossibleNullReferenceException
                    TracingService.Trace("Exception occurred attempting to trace {0}: {1}", message, ex);
                }
                // ReSharper disable once EmptyGeneralCatchClause
                catch {
                    // Attempted to trace a message, and had an exception, and then had another exception attempting to trace the exception that occurred when tracing.
                    // Better to give up rather than stopping the entire program when attempting to write a Trace message
                }
            }
        }

        /// <summary>
        /// Traces the format.   Guaranteed to not throw an exception.
        /// </summary>
        /// <param name="format">The format.</param>
        /// <param name="args">The arguments.</param>
        public void TraceFormat(string format, params object[] args)
        {
            try {
                if (string.IsNullOrWhiteSpace(format) || TracingService == null) {
                    return;
                }
                var message = String.Format(CultureInfo.InvariantCulture, format, args);
                TracingService.Trace(PluginExecutionContext == null ?
                    message :
                    String.Format("{0}, Correlation Id: {1}, Initiating User: {2}", message, PluginExecutionContext.CorrelationId, PluginExecutionContext.InitiatingUserId));
            }
            catch (Exception ex) {
                try {
                    // ReSharper disable once PossibleNullReferenceException
                    TracingService.Trace("Exception occurred attempting to trace {0}: {1}", format, ex);
                }
                // ReSharper disable once EmptyGeneralCatchClause
                catch {
                    // Attempted to trace a message, and had an exception, and then had another exception attempting to trace the exception that occurred when tracing.
                    // Better to give up rather than stopping the entire program when attempting to write a Trace message
                }
            }
        }

        #endregion // Trace

        #region GetParameterValue

        /// <summary>
        /// Gets the parameter value from the PluginExecutionContext.InputParameters collection, cast to type 'T', or default(T) if the collection doesn't contain a parameter with the given name.
        /// </summary>
        /// <typeparam name="T">Type of the parameter to be returned</typeparam>
        /// <param name="parameterName"></param>
        /// <returns></returns>
        public T GetInputParameterValue<T>(string parameterName)
        {
            return PluginExecutionContext.InputParameters.GetParameterValue<T>(parameterName);
        }

        /// <summary>
        /// Gets the parameter value from the PluginExecutionContext.InputParameters collection, or null if the collection doesn't contain a parameter with the given name.
        /// </summary>
        /// <param name="parameterName"></param>
        /// <returns></returns>
        public object GetInputParameterValue(string parameterName)
        {
            return PluginExecutionContext.InputParameters.GetParameterValue(parameterName);
        }

        /// <summary>
        /// Gets the parameter value from the PluginExecutionContext.OutputParameters collection, cast to type 'T', or default(T) if the collection doesn't contain a parameter with the given name.
        /// </summary>
        /// <typeparam name="T">Type of the parameter to be returned</typeparam>
        /// <param name="parameterName"></param>
        /// <returns></returns>
        public T GetOutputParameterValue<T>(string parameterName)
        {
            return PluginExecutionContext.OutputParameters.GetParameterValue<T>(parameterName);
        }

        /// <summary>
        /// Gets the parameter value from the PluginExecutionContext.OutputParameters collection, or null if the collection doesn't contain a parameter with the given name.
        /// </summary>
        /// <param name="parameterName"></param>
        /// <returns></returns>
        public object GetOutputParameterValue(string parameterName)
        {
            return PluginExecutionContext.OutputParameters.GetParameterValue(parameterName);
        }

        /// <summary>
        /// Gets the variable value from the PluginExecutionContext.SharedVariables collection, cast to type 'T', or default(T) if the collection doesn't contain a variable with the given name.
        /// </summary>
        /// <typeparam name="T">Type of the variable to be returned</typeparam>
        /// <param name="variableName"></param>
        /// <returns></returns>
        public T GetSharedVariableValue<T>(string variableName)
        {
            return PluginExecutionContext.SharedVariables.GetParameterValue<T>(variableName);
        }

        /// <summary>
        /// Gets the variable value from the PluginExecutionContext.SharedVariables collection, or null if the collection doesn't contain a variable with the given name.
        /// </summary>
        /// <param name="variableName"></param>
        /// <returns></returns>
        public object GetSharedVariableValue(string variableName)
        {
            return PluginExecutionContext.SharedVariables.GetParameterValue(variableName);
        }

        #endregion // GetParameterValue

        #region Retrieve Entity From Context

        /// <summary>
        /// Creates a new Entity of type T, adding the attributes from both the Target and the Post Image if they exist.  
        /// Does not return null.
        /// Does not return a reference to Target
        /// </summary>
        /// <param name="imageName">Name of the image.</param>
        /// <returns></returns>
        public T CoallesceTargetWithPostEntity<T>(string imageName = PluginImageNames.POST_IMAGE) where T : Entity
        {
            var entity = (T)Activator.CreateInstance(typeof(T));
            var target = GetTarget<T>();
            if (target != null) {
                entity.Id = target.Id;
                foreach (var attribute in target.Attributes) {
                    entity[attribute.Key] = attribute.Value;
                }
            }

            var postImage = GetPostEntity<T>(imageName);
            if (postImage == null) {
                return entity;
            }

            if (entity.Id == Guid.Empty) {
                entity.Id = postImage.Id;
            }

            foreach (var attribute in postImage.Attributes.Where(a => !entity.Contains(a.Key))) {
                entity[attribute.Key] = attribute.Value;
            }

            return entity;
        }

        /// <summary>
        /// If the PreEntityImages contains the given imageName Key, the Value is cast to the Entity type T, else null is returned
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="imageName"></param>
        /// <returns></returns>
        public T GetPreEntity<T>(string imageName = PluginImageNames.PRE_IMAGE) where T : Entity
        {
            return GetEntity<T>(PluginExecutionContext.PreEntityImages, imageName);
        }

        /// <summary>
        /// If the PostEntityImages contains the given imageName Key, the Value is cast to the Entity type T, else null is returned
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="imageName"></param>
        /// <returns></returns>
        public T GetPostEntity<T>(string imageName = PluginImageNames.POST_IMAGE) where T : Entity
        {
            return GetEntity<T>(PluginExecutionContext.PostEntityImages, imageName);
        }

        /// <summary>
        /// If the images collection contains the given imageName Key, the Value is cast to the Entity type T, else null is returned
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="images"></param>
        /// <param name="imageName"></param>
        /// <returns></returns>
        private T GetEntity<T>(DataCollection<string, Entity> images, string imageName) where T : Entity
        {
            if (!images.ContainsKey(imageName)) {
                return null;
            }

            var entity = images[imageName].ToEntity<T>();
            return entity;
        }

        /// <summary>
        /// Cast the Target to the given Entity Type T. 
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <returns></returns>
        public T GetTarget<T>() where T : Entity
        {
            var parameters = PluginExecutionContext.InputParameters;
            if (parameters == null || !parameters.ContainsKey(ParameterName.Target) || !(parameters[ParameterName.Target] is Entity)) {
                return null;
            }

            // Obtain the target business entity from the input parameters.
            var entity = ((Entity)parameters[ParameterName.Target]).ToEntity<T>();
            return entity;
        }

        /// <summary>
        /// Finds and returns the Target as an Entity Reference (Delete Plugins)
        /// </summary>
        /// <returns></returns>
        public EntityReference GetTargetEntityReference()
        {
            EntityReference entity = null;
            var parameters = PluginExecutionContext.InputParameters;
            if (parameters.ContainsKey(ParameterName.Target) &&
                 parameters[ParameterName.Target] is EntityReference) {
                entity = (EntityReference)parameters[ParameterName.Target];
            }
            return entity;
        }

        #endregion Retrieve Entity From Context
    }
}