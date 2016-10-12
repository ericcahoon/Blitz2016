using System.Runtime.Serialization;

namespace CH.Xrm.Plugins.Models.Sms
{
    [DataContract]
    public class EnumValue
    {
        [DataMember]
        public string Label { get; set; }
        [DataMember]
        public int Value { get; set; }
    }

    [DataContract]
    public class SendMessageResult
    {
        [DataMember]
        public string Message { get; set; }
        [DataMember]
        public EnumValue State { get; set; }
        [DataMember]
        public EnumValue Status { get; set; }
        [DataMember]
        public int TotalRequestTimeMilliseconds { get; set; }
        [DataMember]
        public string AccountId { get; set; }
        [DataMember]
        public string SendingStatusUpdatesTo { get; set; }
        [DataMember]
        public string SmsSid { get; set; }

    }
}
