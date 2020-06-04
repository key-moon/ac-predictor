using NUnit.Framework;
using AzureFunctions;
using System;
using System.Collections.Generic;
using System.Text;
using Moq;
using Microsoft.Extensions.Logging;

namespace AzureFunctions.Tests
{
    [TestFixture()]
    public class PutContestsTests
    {
        [Test()]
        public void Func()
        {
            Mock<ILogger> mock = new Mock<ILogger>();
            PutContests.Func(new[] { "test" }, mock.Object).Wait();
        }
    }
}