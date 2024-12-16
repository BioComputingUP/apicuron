# Leaderboard Module

This module is responsible for rendering resource leaderboards. Each leaderboard defines specific columns that can be used to display relevant data.

## Structure

Each leaderboard is defined under the `leaderboards` directory.

## Usage

To use this module, import it into your project and use the resource-leaderboard component for all the leaderboards combined or import each leaderboard individually.

```typescript
import { LeaderboardModule } from 'apicuron-util/leaderboard';

// in module, import the LeaderboardModule
@NgModule({
	imports: [LeaderboardModule]
})

// in a component template you can use the leaderboard

const template = `
<resource-leaderboard></resource-leaderboard>

`
```

## Configuration

The ResourceLeaderboard component accepts two props `resource` and `options`

```html
<resource-leaderboard [resource]="" [options]=""></resource-leaderboard>
```
- **resource** expects either a string containing the resource identifier or the resource object itself
- **options** an array of either a `string` or a pair of string and another array `[string, string[]]`
  - In the case of a singular string it specifies the leaderboard name to include. leaderboards that are available are `monthly-leaderboard`
  `weekly-leaderboard` and `total-leaderboard`
  - in the case of this type `string | [string, string[]]` the first string indicates the leaderboard name and the array indicates the list of columns to include in said leaderboard.
  
> Note for Web Components/ angular-elements
> 
> Complex objects (like arrays and objects) cannot be passed as props in web components It is necessary to obtain a reference to the DOM element and assigning the property to the element through javascript. In this case `options` should be assigned that way E.G below

```js

const element = document.querySelector('resource-leaderboard[resource]');
element.options = ['total-leaderboard', 'weekly-leaderboard'];

```

### Available Columns

| Monthly Leaderboard         | Weekly Leaderboard         | Total Leaderboard          |
| -------------------------- | -------------------------- | -------------------------- |
| Ranking                    | Ranking                    | Ranking                    |
| Contributor                | Contributor                | Contributor                |
| Generation Contributions   | Generation Contributions   | Medals                     |
| Invalidation Contributions | Invalidation Contributions | Badges                     |
| Revision Contributions     | Revision Contributions     | Generation Contributions   |
| Total Score                | Total Score                | Invalidation Contributions |
| last Contribution Date     | last Contribution Date     | Revision Contributions     |
|                            |                            | Total Score                |
|                            |                            | last Contribution Date     |


