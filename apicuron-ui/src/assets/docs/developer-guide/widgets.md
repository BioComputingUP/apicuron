# Web Components and Widgets

APICURON aims to offer the following Widgets for Resources to use, these widgets are meant to allow partner resource to recognize the efforts of their curators directly on their platform.


## Leaderboard Widget

APICURON offers a leaderboard widget which showcases the ranking of biocurators depending on their contribution score that is calculated using the reward mechanism that is setup by the resource.

Here's an example of how to use it

``` html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>

</head>
<body>
    
    <!-- in here we inject the web component and pass the desired resource_id of which we want to display the leaderboard -->
    <apicuron-leaderboard resource="disprot"></apicuron-leaderboard>


    <!-- in this script tag, we load the leaderboard that computes and fetches data from the Production APICURON version -->
    <script src="http://apicuron.org/assets/widgets/apicuron-leaderboard.js"></script>
</body>
</html>

```

If you would like to load the leaderboard from the development instance of APICURON, replace the script tag used by this one

```html
<script src="http://dev.apicuron.org/assets/widgets/apicuron-leaderboard-dev.js"></script>
```

### Configuration

The component accepts two props `resource` and `options`

```html
<apicuron-leaderboard [resource]="" [options]=""></apicuron-leaderboard>
```
- **resource** expects either a string containing the resource identifier or the resource object itself
- **options** an array of either a `string` or a pair of string and another array `[string, string[]]`
  - In the case of a singular string it specifies the leaderboard name to include. leaderboards that are available are `monthly-leaderboard`
  `weekly-leaderboard` and `total-leaderboard`
  - in the case of this type `string | [string, string[]]` the first string indicates the leaderboard name and the array indicates the list of columns to include in said leaderboard.
  
> **Note**:
> Complex objects (like arrays and objects) cannot be passed as props in web components It is necessary to obtain a reference to the DOM element and assigning the property to the element through javascript. In this case `options` should be assigned that way E.G below

```js

const element = document.querySelector('apicuron-leaderboard[resource]');
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

