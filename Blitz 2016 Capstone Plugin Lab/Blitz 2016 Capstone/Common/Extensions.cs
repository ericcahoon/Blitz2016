using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Json;
using System.Text;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;

namespace CH.Xrm.Plugins.Common
{
    public static class Extensions
    {
        public static string GetAttributeValueAsJSON(this Entity entity, string attributeName)
        {
            if (entity == null || string.IsNullOrWhiteSpace(attributeName) || !entity.Contains(attributeName))
                return null;

            var value = entity[attributeName];

            if (value == null) return "#NULL#";

            var money = value as Money;
            if (money != null)
                return string.Format("{{ \"__metadata\": {{ \"type\": \"Microsoft.Crm.Sdk.Data.Services.Money\" }}, \"Value\": \"{0}\" }}",
                    money.Value);


            var setValue = value as OptionSetValue;
            if (setValue != null)
                return string.Format("{{ \"__metadata\": {{ \"type\": \"Microsoft.Crm.Sdk.Data.Services.OptionSetValue\" }}, \"Label\": \"{0}\", \"Value\": \"{1}\" }}",
                    !entity.FormattedValues.ContainsKey(attributeName) ? "" : entity.FormattedValues[attributeName],
                    setValue.Value);

            var reference = value as EntityReference;
            if (reference != null)
                return string.Format("{{ \"__metadata\": {{ \"type\": \"Microsoft.Crm.Sdk.Data.Services.EntityReference\" }}, \"Id\": \"{0}\", \"LogicalName\": \"{1}\" }}",
                    reference.Id,
                    reference.LogicalName);

            return value.ToString();
        }

        /// <summary>
        /// Deserializes the json.
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="xml">The XML to try deserializing.</param>
        /// <returns></returns>
        /// <exception cref="System.ArgumentNullException">text</exception>
        public static T DeserializeXml<T>(this string xml)
        {
            if (string.IsNullOrWhiteSpace(xml)) {
                throw new ArgumentNullException("xml");
            }

            using (var reader = new MemoryStream(Encoding.UTF8.GetBytes(xml))) {

                var serializer = new NetDataContractSerializer();
                //new DataContractJsonSerializer(typeof(T));
                return (T)serializer.Deserialize(reader);
            }
        }

        #region <T>

        /// <summary>
        /// Serializes the value to a json string.
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="value">The Value to serialize to JSON</param>
        /// <returns></returns>
        /// <exception cref="System.ArgumentNullException">text</exception>
        public static string SerializeToJson<T>(this T value)
        {
            if (value == null) {
                throw new ArgumentNullException("value");
            }

            using (var memoryStream = new MemoryStream()) {
                var serializer = new DataContractJsonSerializer(typeof(T));
                serializer.WriteObject(memoryStream, value);
                return Encoding.Default.GetString(memoryStream.ToArray());
            }
        }

        /// <summary>
        /// Deserializes the json.
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="text">The text.</param>
        /// <returns></returns>
        /// <exception cref="System.ArgumentNullException">text</exception>
        public static T DeserializeJson<T>(this string text)
        {
            if (text == null) {
                throw new ArgumentNullException("text");
            }

            using (var reader = new MemoryStream(Encoding.Default.GetBytes(text))) {
                var serializer = new DataContractJsonSerializer(typeof(T));
                return (T)serializer.ReadObject(reader);
            }
        }

        #endregion <T>

        #region List<RegisteredEvent>

        #region AddEvent

        /// <summary>
        /// Defaults the execute method to be InternalExecute and run against all entities.
        /// </summary>
        /// <param name="events"></param>
        /// <param name="stage"></param>
        /// <param name="message"></param>
        public static void AddEvent(this List<RegisteredEvent> events, PipelineStage stage, MessageType message)
        {
            events.AddEvent(stage, null, message, null);
        }

        /// <summary>
        /// Runs against all entities.
        /// </summary>
        /// <param name="events"></param>
        /// <param name="stage"></param>
        /// <param name="message"></param>
        /// <param name="execute"></param>
        public static void AddEvent(this List<RegisteredEvent> events, PipelineStage stage, MessageType message, Action<LocalPluginContext> execute)
        {
            events.AddEvent(stage, null, message, execute);
        }

        /// <summary>
        /// Defaults the execute method to be InternalExecute and runs against the specified entity.
        /// </summary>
        /// <param name="events"></param>
        /// <param name="stage"></param>
        /// <param name="entityLogicalName"></param>
        /// <param name="message"></param>
        public static void AddEvent(this List<RegisteredEvent> events, PipelineStage stage, string entityLogicalName, MessageType message)
        {
            events.AddEvent(stage, entityLogicalName, message, null);
        }

        /// <summary>
        /// Runs against the specified entity
        /// </summary>
        /// <param name="events"></param>
        /// <param name="stage"></param>
        /// <param name="entityLogicalName"></param>
        /// <param name="message"></param>
        /// <param name="execute"></param>
        public static void AddEvent(this List<RegisteredEvent> events, PipelineStage stage, string entityLogicalName, MessageType message, Action<LocalPluginContext> execute)
        {
            events.Add(new RegisteredEvent(stage, message, execute, entityLogicalName));
        }

        #endregion // AddEvent

        #region AddEvents

        /// <summary>
        /// Defaults the execute method to be InternalExecute and run against all entities.
        /// </summary>
        /// <param name="events"></param>
        /// <param name="stage"></param>
        /// <param name="messages"></param>
        public static void AddEvents(this List<RegisteredEvent> events, PipelineStage stage, params MessageType[] messages)
        {
            events.AddEvents(stage, null, null, messages);
        }

        /// <summary>
        /// Defaults the execute method to be InternalExecute and runs against the specified entity.
        /// </summary>
        /// <param name="events"></param>
        /// <param name="stage"></param>
        /// <param name="messages"></param>
        /// <param name="entityLogicalName"></param>
        public static void AddEvents(this List<RegisteredEvent> events, PipelineStage stage, string entityLogicalName, params MessageType[] messages)
        {
            events.AddEvents(stage, entityLogicalName, null, messages);
        }

        /// <summary>
        /// Runs against all entities.
        /// </summary>
        /// <param name="events"></param>
        /// <param name="stage"></param>
        /// <param name="messages"></param>
        /// <param name="execute"></param>
        public static void AddEvents(this List<RegisteredEvent> events, PipelineStage stage, Action<LocalPluginContext> execute, params MessageType[] messages)
        {
            events.AddEvents(stage, null, execute, messages);
        }


        /// <summary>
        /// Runs against the specified entity
        /// </summary>
        /// <param name="events"></param>
        /// <param name="stage"></param>
        /// <param name="entityLogicalName"></param>
        /// <param name="execute"></param>
        /// <param name="messages"></param>
        public static void AddEvents(this List<RegisteredEvent> events, PipelineStage stage, string entityLogicalName, Action<LocalPluginContext> execute, params MessageType[] messages)
        {
            events.AddRange(messages.Select(message => new RegisteredEvent(stage, message, execute, entityLogicalName)));
        }

        #endregion // AddEvent

        #endregion // List<RegisteredEvent>

        #region LocalPluginContext

        #endregion //LocalPluginContext

        #region ColumnSet

        /// <summary>
        ///     Allows for adding column names in an early bound manner:
        ///     columnSet.AddColumns&lt;Opportunity&gt;(i => new { i.OpportunityId, i.SalesStage, i.SalesStageCode });
        /// </summary>
        /// <typeparam name="T">An Entity Type</typeparam>
        /// <param name="columnSet">The ColumnSet</param>
        /// <param name="anonymousTypeInitializer">
        ///     An Anonymous Type Initializer where the properties of the anonymous
        ///     type are the column names to add
        /// </param>
        /// <returns></returns>
        public static ColumnSet AddColumns<T>(this ColumnSet columnSet,
            Expression<Func<T, object>> anonymousTypeInitializer) where T : Entity
        {
            columnSet.AddColumns(GetAttributeNamesArray(anonymousTypeInitializer));
            return columnSet;
        }

        /// <summary>
        ///     Creates an array of attribute names array from an Anonymous Type Initializer.
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="anonymousTypeInitializer">The anonymous type initializer.</param>
        /// <returns></returns>
        /// <exception cref="System.ArgumentException">lambda must return an object initializer</exception>
        private static string[] GetAttributeNamesArray<T>(Expression<Func<T, object>> anonymousTypeInitializer)
            where T : Entity
        {
            var initializer = anonymousTypeInitializer.Body as NewExpression;
            if (initializer == null || initializer.Members == null) {
                throw new ArgumentException("lambda must return an object initializer");
            }

            // Search for and replace any occurence of Id with the actual Entity's Id
            return initializer.Members.Select(GetLogicalAttributeName<T>).ToArray();
        }

        /// <summary>
        ///     Normally just returns the name of the property, in lowercase.  But Id must be looked up via reflection.
        /// </summary>
        /// <param name="property"></param>
        /// <returns></returns>
        private static string GetLogicalAttributeName<T>(MemberInfo property) where T : Entity
        {
            var name = property.Name.ToLower();
            if (name == "id") {
                var attribute =
                    typeof(T).GetProperty("Id").GetCustomAttributes<AttributeLogicalNameAttribute>().FirstOrDefault();
                if (attribute == null) {
                    throw new ArgumentException(property.Name +
                                                " does not contain an AttributeLogicalNameAttribute.  Unable to determine id");
                }

                name = attribute.LogicalName;
            }

            return name;
        }

        #endregion // ColumnSet

        #region Entity

        /// <summary>
        ///     Returns the Id of the entity or Guid.Empty if it is null"
        /// </summary>
        /// <param name="entity"></param>
        /// <returns></returns>
        public static Guid GetIdOrDefault(this Entity entity)
        {
            return entity == null ? Guid.Empty : entity.Id;
        }

        /// <summary>
        ///     Creates the EntityReference from Entity, settings it's name
        /// </summary>
        /// <param name="entity"></param>
        /// <param name="name"></param>
        /// <returns></returns>
        public static EntityReference ToEntityReference(this Entity entity, string name)
        {
            var reference = entity.ToEntityReference();
            reference.Name = name;
            return reference;
        }

        #endregion // Entity

        #region EntityCollection

        /// <summary>
        ///     Converts the entity collection into a list, casting each entity.
        /// </summary>
        /// <typeparam name="T">The type of Entity</typeparam>
        /// <param name="col">The collection to convert</param>
        /// <returns></returns>
        public static List<T> ToEntityList<T>(this EntityCollection col) where T : Entity
        {
            if (typeof(T) == typeof(Entity)) {
                // T is Entity.  No need to cast, just convert.
                return (List<T>)(object)col.Entities.ToList();
            }

            return col.Entities.Select(e => e.ToEntity<T>()).ToList();
        }

        #endregion // EntityCollection

        #region EntityReference

        /// <summary>
        ///     Returns the Id of the entity reference or Guid.Empty if it is null"
        /// </summary>
        /// <param name="entity"></param>
        /// <returns></returns>
        public static Guid GetIdOrDefault(this EntityReference entity)
        {
            return entity == null ? Guid.Empty : entity.Id;
        }

        /// <summary>
        ///     Returns the Name of the entity reference or null if it is null"
        /// </summary>
        /// <param name="entity"></param>
        /// <returns></returns>
        public static string GetNameOrDefault(this EntityReference entity)
        {
            return entity == null ? null : entity.Name;
        }

        #endregion // EntityReference

        #region Label

        public static string GetLocalOrDefaultText(this Label label, string defaultIfNull = null)
        {
            var local = label.UserLocalizedLabel ?? label.LocalizedLabels.FirstOrDefault();

            if (local == null) {
                return defaultIfNull;
            }

            return local.Label ?? defaultIfNull;
        }

        #endregion // Label

        #region OptionSetValue

        /// <summary>
        ///     Returns the value of the OptionSetValue, or int.MinValue if it is null
        /// </summary>
        /// <param name="osv"></param>
        /// <returns></returns>
        public static int GetValueOrDefault(this OptionSetValue osv)
        {
            return GetValueOrDefault(osv, int.MinValue);
        }

        /// <summary>
        ///     Returns the value of the OptionSetValue, or int.MinValue if it is null
        /// </summary>
        /// <param name="osv">The OptionSetValue.</param>
        /// <param name="defaultValue">The value to default the OptionSetValue's Value to if it is null.</param>
        /// <returns></returns>
        public static int GetValueOrDefault(this OptionSetValue osv, int defaultValue)
        {
            return osv == null ? defaultValue : osv.Value;
        }

        #endregion // OptionSetValue

        #region ParameterCollection

        /// <summary>
        ///     Gets the parameter value from the collection, cast to type 'T', or default(T) if the collection doesn't contain a
        ///     parameter with the given name.
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="parameters">The ParameterCollection.</param>
        /// <param name="parameterName">Name of the parameter.</param>
        /// <returns></returns>
        public static T GetParameterValue<T>(this ParameterCollection parameters, string parameterName)
        {
            var attributeValue = parameters.GetParameterValue(parameterName);
            return attributeValue == null ? default(T) : (T)attributeValue;
        }

        /// <summary>
        ///     Gets the parameter value from the collection, or null if the collection doesn't contain a parameter with the given
        ///     name.
        /// </summary>
        /// <param name="parameters">The ParameterCollection.</param>
        /// <param name="parameterName">Name of the parameter.</param>
        /// <returns></returns>
        /// <exception cref="System.ArgumentNullException">parameterName</exception>
        public static object GetParameterValue(this ParameterCollection parameters, string parameterName)
        {
            if (string.IsNullOrWhiteSpace(parameterName)) {
                throw new ArgumentNullException("parameterName");
            }
            return parameters.Contains(parameterName) ? parameters[parameterName] : null;
        }

        #endregion // ParameterCollection

        #region QueryExpression

        public static void First(this QueryExpression query)
        {
            query.PageInfo.Count = 1;
            query.PageInfo.PageNumber = 1;
        }

        /// <summary>
        ///     Updates the Query Expression to only return only the first entity that matches the query expression expression
        ///     criteria.
        ///     Shortcut for setting the Query's PageInfo.Count and PageInfo.PageNumber to 1.
        /// </summary>
        /// <param name="qe">The query.</param>
        /// <param name="count">The count of entities to restrict the result of the query to.</param>
        public static QueryExpression Take(this QueryExpression qe, int count)
        {
            if (count > 5000) {
                throw new ArgumentException("Count must be 5000 or less", "count");
            }
            qe.PageInfo.Count = count;
            qe.PageInfo.PageNumber = 1;

            return qe;
        }

        #endregion // QueryExpression

        #region String

        /// <summary>
        /// Deserialize the entity from a string xml value to a specific entity type.
        /// </summary>
        /// <typeparam name="T">The type of entity to deserialize the xml to.</typeparam>
        /// <param name="xml">The xml to deserialize.</param>
        /// <returns></returns>
        public static T DeserializeEntity<T>(this string xml) where T : Entity
        {
            var entity = xml.DeserializeEntity();
            return entity == null ? null : entity.ToEntity<T>();
        }

        /// <summary>
        /// Deserialize the entity from a string xml value to an IExtensibleDataObject
        /// </summary>
        /// <param name="xml">The xml to deserialize.</param>
        /// <returns></returns>
        public static Entity DeserializeEntity(this string xml)
        {
            var serializer = new NetDataContractSerializer();
            var entity = (Entity)serializer.ReadObject(new MemoryStream(Encoding.UTF8.GetBytes(xml)));
            return entity;
        }

        #endregion // String
    }
}
