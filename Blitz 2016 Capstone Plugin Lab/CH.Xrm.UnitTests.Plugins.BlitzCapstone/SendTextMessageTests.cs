using System;
using System.Collections.Generic;
using System.Net.Fakes;
using System.Text;
using CH.Xrm.Plugins.Common;
using CH.Xrm.Plugins.Models.Entities;
using CH.Xrm.Plugins.Models.Sms;
using CH.Xrm.Plugins.BlitzCapstone;
using Microsoft.QualityTools.Testing.Fakes;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Fakes;

namespace CH.Xrm.UnitTests.Plugins.Sms
{
    [TestClass]
    public class SendTextMessageTests
    {
        #region Shared Properties

        protected static IDisposable Context { get; set; }

        public static readonly SystemUser FromUser = new SystemUser {
            Id = new Guid("F8C164C7-6243-42DF-8A8C-07950E350254"),
            MobilePhone = "(808) 518-2749"
        };

        public static readonly SystemUser FromUserMissingPhoneNumber = new SystemUser {
            Id = new Guid("EF2993D4-3F15-4DFE-A00A-238E566E9623")
        };

        public static readonly Contact ToUser1 = new Contact {
            Id = new Guid("5025166D-F330-4D75-B99C-AB14174BB8E0"),
            MobilePhone = "(314) 669-6276"
        };

        public static readonly Contact ToUser2 = new Contact {
            Id = new Guid("2AE730BC-814E-439F-B997-409D4D95835E"),
            MobilePhone = "(555) 111-2222"
        };

        public static readonly Contact ToUserMissingMobileNumber = new Contact {
            Id = new Guid("7318C5FC-5AFA-44F8-BCAC-882CAC1E3029")
        };

        private readonly List<Entity> _RecordsToRetrieve = new List<Entity>();

        #endregion Shared Properties

        [TestInitialize]
        public void TestSetup()
        {
            Context = ShimsContext.Create();

            _RecordsToRetrieve.AddRange(new Entity[]
            {
                FromUser,
                FromUserMissingPhoneNumber,
                ToUser1,
                ToUser2,
                ToUserMissingMobileNumber
            });
        }

        [TestCleanup]
        public void TestTeardown()
        {
            if (Context == null) return;
            Context.Dispose();
            Context = null;
        }


        // TO DO: Add exception tests for missing SMS Gateway configuration values

        // TO DO: Add exception tests for missing CRM record values



        private SmsGatewayConfiguration GetDefaultConfig()
        {
            return new SmsGatewayConfiguration {
                AccountId = "ABC",
                AuthToken = "WsIDwJPW8x",
                Uri = "https://crmdmz.crowehorwath.com/CrmServices/v1.10/SMS/SendText"
            };
        }

        [TestCategory("SendTextMessage")]
        [TestMethod]
        public void ValidTextMessage_Should_UpdateSmsAttributesOnTextMessage()
        {
            //
            // Arrange
            //

            const string EXPECTED_SMS_RECORD_ID = "123";

            var config = GetDefaultConfig();

            var target = new ch_textmessage {
                StatusCode = new OptionSetValue((int)ch_textmessage_StatusCode.PendingSend),
                Description = "This is a test message",
                From = new Entity[]
                {
                    new ActivityParty
                    {
                        PartyId = FromUser.ToEntityReference()
                    }
                },
                To = new Entity[]
                {
                    new ActivityParty
                    {
                        PartyId = ToUser1.ToEntityReference()
                    }
                }
            };

            //Create context that'll be posted to plugin
            var pluginExecutionContext = new StubIPluginExecutionContext {
                PrimaryEntityNameGet = () => ch_textmessage.EntityLogicalName,
                PrimaryEntityIdGet = () => Guid.Empty,
                MessageNameGet = () => MessageType.Create.ToString(),
                StageGet = () => (int)PipelineStage.PreOperation,
                InitiatingUserIdGet = () => Guid.Empty,
                UserIdGet = () => Guid.NewGuid(),
                InputParametersGet = () => new ParameterCollection
                {
                    {"Target", target}
                }
            };

            //Get a service provider
            var serviceProvider = Common.GetServiceProvider(
                Common.GetStubIOrganizationService(_RecordsToRetrieve), pluginExecutionContext);

            //Mock the class posting data to the SMS gateway URI
            
            ShimWebClient.AllInstances.UploadDataUriByteArray = (@this, uri, data) =>
            {
                if (uri == null ||
                    uri.AbsoluteUri != config.Uri)
                    return null;

                var response = new SendResponse {
                    SendMessageResult = new SendMessageResult {
                        AccountId = config.AccountId,
                        SmsSid = EXPECTED_SMS_RECORD_ID,
                        State = new EnumValue {
                            Value = 1,
                            Label = "Succeeded"
                        },
                        Status = new EnumValue {
                            Value = 4,
                            Label = "Succeeded"
                        }
                    }
                };

                return Encoding.UTF8.GetBytes(response.SerializeToJson());
            };


            var plugin = new SendTextMessage(config.SerializeToJson(), null);

            //
            // Act
            //

            plugin.Execute(serviceProvider);


            //
            // Assert
            //

            Assert.IsNotNull(target);
            Assert.AreEqual(config.AccountId, target.ch_SMSGatewayAccountId,
                "The SendTextMessage class is expected to set the ch_SMSGatewayAccountId from the data returned by the SMS gateway.  This did not happen.");
            Assert.AreEqual(EXPECTED_SMS_RECORD_ID, target.ch_SMSGatewayRecordId,
                "The SendTextMessage class is expected to set the ch_SMSGatewayRecordId from the data returned by the SMS gateway.  This did not happen.");
        }

        /// <summary>
        ///     Test helper for the set of tests that are expecting an Exception to be thrown
        /// </summary>
        private void ExpectExceptionToBeThrown(string expectedExceptionMessage, ch_textmessage preImage,
            ch_textmessage target, SmsGatewayConfiguration configuration)
        {
            //
            // Arrange
            //

            //Create context that'll be posted to plugin
            var pluginExecutionContext = new StubIPluginExecutionContext {
                PrimaryEntityNameGet = () => ch_textmessage.EntityLogicalName,
                PrimaryEntityIdGet = () => Guid.Empty,
                MessageNameGet = () => MessageType.Create.ToString(),
                StageGet = () => (int)PipelineStage.PreOperation,
                InitiatingUserIdGet = () => Guid.Empty,
                UserIdGet = () => Guid.NewGuid(),
                InputParametersGet = () => new ParameterCollection
                {
                    {"Target", target}
                },
                PreEntityImagesGet = () => new EntityImageCollection
                {
                    {"PreImage", preImage}
                }
            };

            //Get a service provider
            var serviceProvider = Common.GetServiceProvider(
                Common.GetStubIOrganizationService(_RecordsToRetrieve), pluginExecutionContext);


            var plugin = new SendTextMessage(configuration.SerializeToJson(), null);

            try {
                //
                // Act
                //
                plugin.Execute(serviceProvider);

                Assert.Fail("Expected an exception to be thrown; however, one was not");
            }
            catch (InvalidPluginExecutionException ex) {
                //
                // Assert
                //
                Assert.IsNotNull(ex);
                Assert.AreEqual(expectedExceptionMessage, ex.Message);
            }
        }
        private void ExpectExceptionToBeThrown(string expectedExceptionMessage, ch_textmessage target, 
            SmsGatewayConfiguration configuration)
        {
            ExpectExceptionToBeThrown(expectedExceptionMessage, null, target, configuration);
        }
    }
}
