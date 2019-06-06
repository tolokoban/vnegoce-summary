# Embedding HTML 5 app in VNegoce - Proof of Concept (June 2019)

Here is an explanation of how to embed seamlessly any HTML 5 app into a C# WPF component.
To achieve this, we will use the following component: [DotNetBrowser](https://www.teamdev.com/dotnetbrowser#licensing-pricing).

This component is able to display cutting edge HTML 5 / CSS 3 / ES6 Javascipt because it is based on [Chromium](https://www.chromium.org/Home) 69. It can also interact with the HTML 5 content in two ways:

1. Executing Javascript code in the HTML 5 app context.
2. Injecting C# object in the HTML 5 global scope.

## Wrapping the DotNetBrowser component into a WPF View

Here is the XAML of the C# container:

```xml
<UserControl x:Class="VNegoceNET.Html5.Summary"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" 
             xmlns:d="http://schemas.microsoft.com/expression/blend/2008" 
             xmlns:local="clr-namespace:VNegoceNET.Html5"
             mc:Ignorable="d" 
             d:DesignHeight="450" d:DesignWidth="800">
    <Grid x:Name="mainLayout">        
    </Grid>
</UserControl>
```

And here is the code behind:
```c#
using DotNetBrowser;
using DotNetBrowser.Events;
using DotNetBrowser.WPF;

namespace VNegoceNET.Html5
{
    public partial class Summary : UserControl
    {
        private BrowserView webView;

        public Summary()
        {
            InitializeComponent();

            webView = new WPFBrowserView();
            var browser = webView.Browser;
            browser.ScriptContextCreated += delegate (object sender, ScriptContextEventArgs e)
            {
                JSValue value = browser.ExecuteJavaScriptAndReturnValue("window");
                var NegoceCore = InversionOfControl.Resolve<INegoceCore>();
                NegoceCore.OnCallback = (id, json) =>
                {
                    var command = $"window.onNegoceCoreMessage(\"{id}\",{json.ToString()})";
                    browser.ExecuteJavaScript(command);
                };
                NegoceCore.OnException = (id, json) =>
                {
                    var command = $"window.onNegoceCoreException(\"{id}\",{json.ToString()})";
                    browser.ExecuteJavaScript(command);
                };
                value.AsObject().SetProperty("NegoceCore", NegoceCore);
            };
            mainLayout.Children.Add((UIElement)webView.GetComponent());
            webView.Browser.LoadURL(@"https://tolokoban.github.io/vnegoce-summary/index.html");
        }
    }
}
```
