# CuratedWebExtension

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.1.6.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.




// Project Abstract

# Curated-Web
The Curated Web: A wrap for existing Web


Introduction 
The web is a vast network of interconnected resources which can be accessed via the 
internet. It allows users to browse websites, interact with content, and access services, 
applications, and information globally without any geographical barriers. 
It has become such an integral part of daily life that it influences how we communicate, 
work, shop, learn, and entertain ourselves. It provides a vast array of uses, ranging from 
information retrieval and communication to entertainment and e-commerce. With its 
ability to connect people globally and offer a variety of tools and services, the web plays 
a central role in shaping the modern digital landscape. 


Objective 
It would be great if users could have their own web, as it would provide them with greater 
control over their online presence, privacy, and the content they interact with. This 
project aims to create federated layers for the existing web for specific curators/users. 
They will be able to subscribe/follow other curators. Curators can provide traces, 
interaction, bookmarks, even post its (annotated) (visualizations of existing data as well). 
Overall, the federated layers enable curators to repurpose/reprogram the content of the 
original web. 


Related Work 
There are few works been this area which includes scented widgets [1] and some 
social/collaborative navigation. Scented widgets [2] leverage information scent theory, 
providing visual or textual cues to help users predict the usefulness of links or interface 
elements before interacting with them. Social navigation [3] refers to systems that use 
collective user interactions, such as recommendations, comments, or activity 
heatmaps, to influence individual navigation paths, making digital exploration more 
intuitive. Similarly, collaborative navigation builds on shared user experiences, enabling 
groups to co-browse, annotate, or guide each other in online spaces. 


Use cases 
Customizing their own web offers significant benefits to its users ranging from user 
experience enhancement to even promote their business or organizations. 
Customization for specific curators also enables their layer/ page to be more adaptive, 
and aligned with their expectations, making it an essential tool for success in the digital 
world. One of the experiences that a user can have is, they will be able to transform the 
web as below 
The curated web can be used for education, journalism and for making social impact as 
well. One of the main usages of this can be curators will be able to comment and discuss 
each other’s contents. 


Approach and Considerations 
A layer on tops the existing browsers which serves as a federated layer will be created as 
a browser plugin or an extension while ensuring the below: - - - - - 
it is compatible with major browsers (e.g.: chrome, edge, Firefox, safari) and their 
different versions 
data protection and security, XSS protection 
performance – plugin should not slow down the browsers 
User friendly and ensuring best UI experience ensuring customizability 
Ensuring privacy and compliance to browser policies. 


Methodology and Timeline 
Step 1: February - - - 
Do research and plan the implementation and document the steps 
Decide the functionalities and applications of the extension 
Fix Target Browsers and research their web extensions and compatibility 
Step 2: March - 
Create Figma prototypes for the UI and functionalities 
Step 3: April - - 
Create Essential Files 
start the implementation of federated layer with most compatible and famous 
browser (probably google chrome) 
Step 4: May - - 
Test the created layer properly and modify it iteratively. 
Package and Publish Chrome Web Store 


Conclusion 
The created curated web layer should be able to offer collaboration and coordination 
among curators. It should provide significant benefits by tailoring online experiences to 
meet specific needs, whether for individuals, businesses, or organizations. 


Bibliography 
[1]  I. Xplore, “"Scented Widgets: Improving Navigation Cues with Embedded Visualizations,” 
IEEE, 2014. [Online]. Available: https://ieeexplore.ieee.org/document/6875917. 
[2]  S. V. Group, “"Scented Widgets," Stanford University,” [Online]. Available: 
http://vis.stanford.edu/papers/scented-widgets.. 
[3]  Wikipedia, “"Social navigation," Wikipedia.,” [Online]. Available: 
https://en.wikipedia.org/wiki/Social_navigation.. 
[4]  G. C. Developers, “"Chrome DevTools,",” [Online]. Available: 
https://developer.chrome.com/docs/devtools.. 