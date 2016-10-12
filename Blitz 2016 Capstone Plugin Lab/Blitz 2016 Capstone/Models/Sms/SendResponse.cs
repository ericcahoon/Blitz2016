using System.Runtime.Serialization;

namespace CH.Xrm.Plugins.Models.Sms
{
    /// <summary>
    /// The service wraps its response with the name of the response class so we need an additional layer class to account for this
    /// </summary>
    [DataContract]
    public class SendResponse
    {
        [DataMember]
        public SendMessageResult SendMessageResult { get; set; }
    }
}
