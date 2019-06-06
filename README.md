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
                value.AsObject().SetProperty("NegoceCore", NegoceCore);
                
                NegoceCore.OnCallback = (id, json) =>
                {
                    var command = $"window.onNegoceCoreResolve(\"{id}\",{json.ToString()})";
                    browser.ExecuteJavaScript(command);
                };
                NegoceCore.OnException = (id, json) =>
                {
                    var command = $"window.onNegoceCoreReject(\"{id}\",{json.ToString()})";
                    browser.ExecuteJavaScript(command);
                };                
            };
            mainLayout.Children.Add((UIElement)webView.GetComponent());
            webView.Browser.LoadURL(@"https://tolokoban.github.io/vnegoce-summary/index.html");
        }
    }
}
```

After this, in the HTML 5 global scope, we will find an object called `window.NegoceCore` which will have all the functions provided by a C# instance of the C# class `NegoceCore`. This is how the Javascript can send messages to the C# code.

## Asynchronous calls

The HTML 5 app is using the C# code as a service. Therefore it should use it asynchronously.
Let's imagine we want to retrieve the list of all entities the current user can access.
Here is how we want to write in the Javascript:
```js
import Core from "./core"

async function getEntities() {
  try {
    const entities = await Core.GetAllEntities();
    display( entities );
  } catch( ex ) {
    ...
  }
}
```

The `Core` module is a wrapper around the `NegoceCore` onject which ease the asynchronous access of the C# service.
Here is its code:
```js
export default {
  async GetAllEntities() {
    return new Promise((resolve, reject) => {
      const id = registerCallback(
        (...args) => {
          delete CALLBACK[id];
          resolve(...args);
        }),
        (...args) => {
          delete CALLBACK[id];
          reject(...args);
        }));
      NegoceCore.getallEntities(id);
    });
  }
}

const IDX = 0;
const CALLBACKS = {};

function registerCallback(onResolve, onReject) {
  const idx = `${IDX++}`;
  CALLBACKS[idx] = [onResolve, onReject];
  return idx;
}

window.onNegoceCoreResolve = (id, ...args) => {
  const [resolve] = CALLBACK[id];
  resolve(...args);
};

window.onNegoceCoreReject = (id, ...args) => {
  const [resolve, reject] = CALLBACK[id];
  reject(...args);
};
```

And here is the code of the C# class `NegoceCore`:
```c#

```
