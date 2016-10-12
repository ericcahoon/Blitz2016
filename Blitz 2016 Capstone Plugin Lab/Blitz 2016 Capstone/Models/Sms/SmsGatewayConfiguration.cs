using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace CH.Xrm.Plugins.Models.Sms
{
    [DataContract]
    public class SmsGatewayConfiguration
    {
        [DataMember]
        public string AccountId { get; set; }

        [DataMember]
        public string AuthToken { get; set; }

        [DataMember]
        public string Uri { get; set; }
    }
}
