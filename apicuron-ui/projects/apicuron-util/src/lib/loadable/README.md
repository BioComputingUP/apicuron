# LoadableComponent

The `LoadableComponent` is an Angular component that adds a loading screen with a spinner to any component based on an observable passed as an input parameter. This is useful for displaying a loading state while data is being fetched or processed.

## Usage

### Importing the Component

First, ensure that you import the `LoadableComponent` in your module or component where you want to use it.

```typescript
import { LoadableComponent } from 'apicuron-util/loadable';
```

### Using the Component

You can use the `LoadableComponent` by adding it to your template and passing an observable to it. The observable should emit the data that you want to display once it is loaded.
But before your content loads, loadable will make sure the user gets a spinner first

```html
<div [loadable]="data$">
	<ng-container *ngIf="data$ | async as data">
		<!-- Your content here -->
		<div>{{ data }}</div>
	</ng-container>
</div>
```
