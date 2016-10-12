using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using CH.Xrm.Plugins.Common;
using CH.Xrm.Plugins.Models.Entities;
using CH.Xrm.Plugins.Models.Sms;

namespace CH.Xrm.Plugins.BlitzCapstone
{
    public class SendTextMessage : PluginBase
    {
        private SmsGatewayConfiguration _Configuration;
        
        public SendTextMessage(string unsecure, string secure)
        {
            _Configuration = unsecure.DeserializeJson<SmsGatewayConfiguration>();
        }

        protected override void PopulateRegisteredEvents()
        {
            RegisteredEvents.Add(new RegisteredEvent(PipelineStage.PreOperation, MessageType.Create, ch_textmessage.EntityLogicalName));
        }

        protected override void ExecuteInternal(LocalPluginContext context)
        {
            // Validate Gateway Configuration values
            ValidateGatewayConfiguration();
            
            var textMessage = context.GetTarget<ch_textmessage>();
            
            // If not in the Pending Send status, exit
            if (textMessage.StatusCode == null || textMessage.StatusCodeEnum != ch_textmessage_StatusCode.PendingSend)
                return;


            // TO DO: Validate the Description value

            // TO DO: Validate the To Numbers value

            // TO DO: Validate the From Number value

            // TO DO: Submit message to SMS Gateway using SubmitMessageToSmsGateway

            // TO DO: Validate results from SubmitMessageToSmsGateay

            // Update the status of the record to be Queued
            textMessage.StatusCode = new OptionSetValue((int)ch_textmessage_StatusCode.Completed);
            textMessage.ch_SMSGatewayAccountId = "";  // TO DO: Update SMS Gateway Account ID value
            textMessage.ch_SMSGatewayRecordId = ""; // TO DO: Update SMS Gateway Record ID value
        }

        private void ValidateGatewayConfiguration()
        {
            if (_Configuration == null) {
                throw new InvalidPluginExecutionException("The configuration information was not provided in the plugin parameters.");
            }

            // Get the URL of the end point that interfaces with the SMS provider
            if (string.IsNullOrWhiteSpace(_Configuration.AccountId)) {
                throw new InvalidPluginExecutionException("Failed to find the Account ID to use with the SMS Gateway.");
            }
            // Get the URL of the end point that interfaces with the SMS provider
            if (string.IsNullOrWhiteSpace(_Configuration.AuthToken)) {
                throw new InvalidPluginExecutionException("Failed to find the Auth Token to use with the SMS Gateway.");
            }

            // Get the URL of the end point that interfaces with the SMS provider
            if (string.IsNullOrWhiteSpace(_Configuration.Uri)) {
                throw new InvalidPluginExecutionException("Failed to find the URL of the SMS Gateway.");
            }
        }

        /// <summary>
        /// Return a string that lists all the mobile numbers that should receive the text message
        /// </summary>
        /// <param name="service"></param>
        /// <param name="textMessage"></param>
        /// <returns></returns>
        private string GetToNumbers(IOrganizationService service, ch_textmessage textMessage)
        {
            var toList = textMessage.GetAttributeValue<EntityCollection>(ch_textmessage.Fields.To);

            if (toList == null ||
                !toList.Entities.Any())
                return null;

            var numbers = (from to
                                in toList.Entities
                           select to.GetAttributeValue<EntityReference>(ActivityParty.Fields.PartyId)
                                into partyMembers
                           where partyMembers != null
                           select GetPhoneNumber(service, partyMembers.LogicalName, partyMembers.Id, Contact.Fields.MobilePhone)).ToList();

            return string.Join(";", numbers.Where(r => !string.IsNullOrWhiteSpace(r)));
        }

        /// <summary>
        /// Return the phone number that should show as being the one sending the text message
        /// </summary>
        /// <param name="service"></param>
        /// <param name="textMessage">Reference to the ch_TextMessage record that's being sent</param>
        /// <returns></returns>
        private string GetFromNumber(IOrganizationService service, ch_textmessage textMessage)
        {
            var fromList = textMessage.GetAttributeValue<EntityCollection>(ch_textmessage.Fields.From);
            if (fromList == null ||
                !fromList.Entities.Any())
                return null;

            var from = fromList.Entities[0].GetAttributeValue<EntityReference>(ActivityParty.Fields.PartyId);
            if (from == null) return null;

            return GetPhoneNumber(service, from.LogicalName, from.Id, SystemUser.Fields.MobilePhone);
        }

        /// <summary>
        /// Attempts to return the request phone number value from a CRM record
        /// </summary>
        /// <param name="service"></param>
        /// <param name="entityLogicalName">The name of the entity to lookup the phone on</param>
        /// <param name="recordId">The ID of the record to lookup the phone number of</param>
        /// <param name="phoneAttribute">The name of the phone number field to lookup</param>
        /// <returns></returns>
        private string GetPhoneNumber(IOrganizationService service, string entityLogicalName, Guid recordId,
            string phoneAttribute)
        {

            var resp = service.Retrieve(entityLogicalName, recordId, new ColumnSet(phoneAttribute));
            if (resp == null) return string.Empty;

            var number = resp.GetAttributeValue<string>(phoneAttribute);
            if (string.IsNullOrWhiteSpace(number)) return string.Empty;

            number = new string(number.Where(char.IsDigit).ToArray());
            return (number.Substring(0, 1) == "1" ? "+" : "+1") + number;  //Return the number in the +1########## format that's needed by the SMS gateway
        }

        /// <summary>
        /// Executes invoking the method that posts the text message to the SMS gateway
        /// </summary>
        /// <param name="fromNumber">The number the message is being sent from</param>
        /// <param name="toNumber">The number the message is being sent to</param>
        /// <param name="messageBody">The message that's being sent</param>        
        /// <returns></returns>
        private SendMessageResult SubmitMessageToSmsGateway(LocalPluginContext context, string fromNumber, string toNumber, string messageBody)
        {
            string gatewayUrl = _Configuration.Uri;
            string gatewayAccountId = _Configuration.AccountId;
            string gatewayAuthToken = _Configuration.AuthToken;
            Guid organizationId = context.PluginExecutionContext.OrganizationId;
            Guid userId = context.PluginExecutionContext.InitiatingUserId;

            var request = new SendMessageRequest(gatewayAccountId, gatewayAuthToken, organizationId, userId, fromNumber, toNumber, messageBody);
            return request.SubmitMessageToSmsGateway(gatewayUrl);
        }
    }
}