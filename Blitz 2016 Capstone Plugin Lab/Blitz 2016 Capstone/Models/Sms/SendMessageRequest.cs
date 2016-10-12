using System;
using System.IO;
using System.Net;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Json;
using System.Text;
using CH.Xrm.Plugins.Common;

namespace CH.Xrm.Plugins.Models.Sms
{
    [DataContract]
    public class SendMessageRequest
    {
        // ReSharper disable InconsistentNaming
        [DataMember]
        public Guid organizationId { get; set; }

        [DataMember]
        public Guid userId { get; set; }

        [DataMember]
        public string fromNumber { get; set; }

        [DataMember]
        public string toNumber { get; set; }

        [DataMember]
        public string messageBody { get; set; }

        [DataMember]
        public string accountId { get; set; }

        [DataMember]
        public string authToken { get; set; }
        // ReSharper restore InconsistentNaming

        public SendMessageRequest(string gatewayAccountId, string gatewayAuthToken, Guid orgId, Guid systemUserId, string from, string to, string message)
        {
            accountId = gatewayAccountId;
            authToken = gatewayAuthToken;
            organizationId = orgId;
            userId = systemUserId;
            fromNumber = from;
            toNumber = to;
            messageBody = message;
        }

        /// <summary>
        /// Posts to the SendText Method on the gatewayUrl that's provided
        /// </summary>
        /// <param name="gatewayUrl">The URL to submit the request to</param>
        /// <returns></returns>
        public SendMessageResult SubmitMessageToSmsGateway(string gatewayUrl)
        {
            if (string.IsNullOrWhiteSpace(gatewayUrl)) throw new ArgumentNullException("gatewayUrl");

            byte[] requestResponse;
            var jss = new DataContractJsonSerializer(typeof(SendResponse));
            SendMessageResult result = null;

            //Post the request to the SMS gateway
            using (var client = new WebClient())
            {
                requestResponse = client.UploadData(new Uri(gatewayUrl),
                    Encoding.UTF8.GetBytes(this.SerializeToJson()));
            }

            if (requestResponse != null && requestResponse.Length > 0)
            {

                using (var stream = new MemoryStream(requestResponse))
                {
                    stream.Position = 0;
                    var response = (SendResponse)jss.ReadObject(stream);  //Deserialize the response

                    result = response.SendMessageResult;
                }
            }

            return result;
        }
    }
}
