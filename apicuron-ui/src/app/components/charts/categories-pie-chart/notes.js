// create the initial dataset for the pie chart
const data = {
    labels: ['Generation', 'Invalidation', 'Revision'],
    values: [40, 30, 30],
    type: 'pie',
    hoverinfo: 'label+percent',
    textinfo: 'value',
    marker: {
      colors: ['#4D194D', '#DAA520', '#228B22']
    }
  };
  
  // create the layout for the pie chart
  const layout = {
    title: 'Contributions by Category'
  };
  
  // create the data array and add the initial data to it
  let plotData = [data];
  
  // create a function to update the pie chart based on user input
  function updatePieChart(subcategories) {
    // create the new dataset for the pie chart
    const newLabels = [];
    const newValues = [];
    const newColors = [];
    for (const [category, subcategoryData] of Object.entries(subcategories)) {
      newLabels.push(category);
      let subcategoryTotal = 0;
      for (const [subcategory, value] of Object.entries(subcategoryData)) {
        subcategoryTotal += value;
      }
      newValues.push(subcategoryTotal);
      newColors.push(getColorForCategory(category));
    }
    const newData = {
      labels: newLabels,
      values: newValues,
      type: 'pie',
      hoverinfo: 'label+percent',
      textinfo: 'value',
      marker: {
        colors: newColors
      }
    };
  
    // update the data array with the new dataset and redraw the plot
    plotData = [newData];
    Plotly.react('plot', plotData, layout);
  }
  
  // create a function to get the color for a category
  function getColorForCategory(category) {
    if (category === 'Generation') {
      return '#4D194D';
    } else if (category === 'Invalidation') {
      return '#DAA520';
    } else if (category === 'Revision') {
      return '#228B22';
    } else {
      return '#000000';
    }
  }
  
  // create the pie chart using Plotly
  Plotly.newPlot('plot', plotData, layout);
  
  // call the updatePieChart function with example data
  const exampleSubcategories = {
    'Generation': {
      'Contributor A': 15,
      'Contributor B': 25,
      'Contributor C': 20
    },
    'Invalidation': {
      'Contributor D': 10,
      'Contributor E': 20
    },
    'Revision': {
      'Contributor F': 15,
      'Contributor G': 10,
      'Contributor H': 5
    }
  };
  updatePieChart(exampleSubcategories);


  /**
   * In this script, we first create the initial dataset for the pie chart with three categories and their corresponding values. We also set the type, hoverinfo, textinfo, and marker properties of the dataset.

We then create the layout for the pie chart with a title and no legend, since the legend will be updated based on user input.

Next, we create the data array and add the initial dataset to it. We also create a function updatePieChart that takes a parameter subcategories, which is an object containing the subcategories for each category. This function creates a new dataset based on the subcategories and updates the data array with the new dataset. We use the for...of loop to iterate through the subcategories object and calculate the total value for each
   */