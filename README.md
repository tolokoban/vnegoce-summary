# Embedding HTML 5 app in VNegoce - Proof of Concept (June 2019)

Here is an explanation of how to embed seamlessly any HTML 5 app into a C# WPF component.
To achieve this, we will use the following component:

* [DotNetBrowser](https://www.teamdev.com/dotnetbrowser#licensing-pricing)

This component is able to display cutting edge HTML 5 / CSS 3 / ES6 Javascipt because it is based on [Chromium](https://www.chromium.org/Home) 69. It can also interact with the HTML 5 content in two ways:

1. Executing Javascript code in the HTML 5 app context.
2. Injecting C# object in the HTML 5 global scope.


