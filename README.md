# Extension

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.3.3.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build & Deploy

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.
Run `ng build dev` while testing to run the dev server.
See the `package.json` file for all possible build options.

This app uses [cheeriojs](https://cheerio.js.org/) to run a post-build step that overwrites the default
behavior of Angular for the compiled css. The default `media` attribute is `print` and for the extension
to render correctly and apply our custom css file we need it to be set to `all` right away. This behavior
is not a feature in Angular so we've added a cheeriojs post-build script that simply overwrites this
setting to be `all` instead. Pretty simple, but important to call out that this modification to the
compiled project has been automated.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## Important Additional Package Information
### Working with Browser Extensions
- https://developer.chrome.com/docs/extensions/get-started
- https://developer.chrome.com/docs/extensions

### Firebase
- https://firebase.google.com/
- https://github.com/angular/angularfire
- https://firebaseopensource.com/projects/angular/angularfire2/

### Ng Block UI
- https://www.npmjs.com/package/ng-block-ui

### Cheerio JS
Read above about Build & Deploy steps for information on how this is used. There is a `postbuild.js` file at the
root of the `Extension` project that contains more information and the configuration for this process.
- https://cheerio.js.org/

### Angular Material
- https://v13.material.angular.io/
- https://jossef.github.io/material-design-icons-iconfont/

### Lifesaver for Material Drag and Drop Nested
- https://v13.material.angular.io/cdk/drag-drop/overview
- https://stackblitz.com/edit/angular-cdk-nested-drag-drop-demo?file=src%2Fapp%2Fshared%2Fcomponents%2Flist-item%2Flist-item.html

### UUIDJS
- https://github.com/uuidjs/uuid

### ParticlesJS
- https://vincentgarreau.com/particles.js/#default

### ngx-markdown
- https://www.npmjs.com/package/ngx-markdown/v/13.1.0