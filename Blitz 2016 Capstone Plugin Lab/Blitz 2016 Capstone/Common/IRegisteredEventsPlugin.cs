using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;

namespace CH.Xrm.Plugins.Common
{
    public interface IRegisteredEventsPlugin : IPlugin
    {
        List<RegisteredEvent> RegisteredEvents { get; }
    }
}
