using NUnit.Framework;
using AzureFunctions;
using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.Extensions.Logging;
using Moq;
using System.Threading.Tasks;

namespace AzureFunctions.Tests
{
    [TestFixture()]
    public class UpdateAPerfsTests
    {
        [Test()]
        public async Task RunTest()
        {
            await UpdateAPerfs.Run("agc002", new Mock<ILogger>().Object);
        }
    }
}