# Integration with APICURON

## Introduction

as previously mentionned in the [Introduction](/main/get-started/) the current [APICURON](https://apicuron.org) implementation is geared towards research and relies on researcher tools and therefore our main authentication method, will be [ORCID](https://orcid.org).

To test your Integration we have a [separate APICURON instance](https://dev.apicuron.org) for testing that you can use along with the [sandbox version of ORCID](https://sandbox.orcid.org) to test integrations before using the main [APICURON](https://apicuron.org) instance that relies on the [public orcid](https://orcid.org)


First step is to create a Resource and that requires [authentication](#authentication)

## Authentication

To authenticate using [APICURON](https://dev.apicuron.org) is quite simple, all that is required is to click on the top right corner login button on the [APICURON](https://dev.apicuron.org) home page on the navigation bar

![login-button-screenshot](/assets/docs/screenshots/screenshot-login-buton.png)

You wil be redirected in a popup window to log-in to the [sandbox ORCID](https://sandbox.orcid.org) where you will be requested to authenticate as (shown below). In order to verify your profile, [ORCID](https://orcid.org) requires you to setup a mailinator inbox to verify your email address. The following procedure is further explained at the bottom of this [page](https://info.orcid.org/ufaqs/how-do-i-register-a-test-client-on-the-sandbox-member-api/)


![login-button-screenshot](/assets/docs/screenshots/orcid-login-popup.png)


## Create A Resource

After creating an account you will have the possibility to create a Resource [here](https://dev.apicuron.org/databases/create)

*After creating your resource you will need to wait for Approval by our Team in order to proceed to the following steps, you can contact us on*

A resource is defined by the following fields:
 - *resource id*: the string identifier that uniquely identifies a resource
 - *resource name*: the Name of the resource that is used when displaying the resource
 - *resource long name*: A more descriptive name of the resource
 - *resource URI*: the Unified Resource identifier of tha resource
 - *resource URL*: the link that leads to the resource
 - *resource Description*: A description of the Resource
 - *resource Logo*: An image of the Resource Logo (svg, png and jpeg formats are accepted)


There are some **Caveats** to consider:
 - The *resource_id* is not public but should be semantically relevant as it will be part of the endpoints you're going to use
 - You can upload either a png, jpeg or svg Logo. We recommend SVG as it is usually smaller in size and can offer a transparent background that makes the UI cleaner
 - The Resource Long Name is usually the full name of the resource that describes the resource slightly better than the Name but less extensively than the Description.

![login-button-screenshot](/assets/docs/screenshots/screenshot_databses_create.png)

## Defining Terms (Contributions)

Terms Are the atomic aspect of contribution for your resource. A term is defined by the following fields:

 - *Activity term*: The string identifier that uniquely identifiers a term in a resource
 - *Activity name*: The clean name of the Term that is displayed
 - *Activity Category*: The category in which the term falls among these three categories:
   - Generation
   - Invalidation
   - Revision
 - *Score*: the numerical value describing how the resource estimates the Activity
 - *Description*: A short text describing the Activity



## Submitting Curation Data (Reports)

There are two major ways to submit curation data (aka, reports) in APICURON, in real-time or in bulk.

When a resource submits the curation events in this manner **APICURON** behaves differently and attempts to reward curators in a different manner as well.

Submitting reports one by one when they occur allows APICURON to notify curators about their achievements and allows the resource to track the evolution of the reports in quasi real-time.

### Single report submission

Single report submission *(aka Real-time submission)* can be tested on the UI Dashboard, UI shown below.

 
A single report contains the following fields:
 - *Activity term*: the activity term related to the reported curation effort
 - *Curator ORCID*: the orcid of the curator that made the effort
 - *Entity URI*: a URI that links to the page showcasing Entity that the Curator contributed to
 - *Timestamp*: the time and date of the effort submission to the resource

![Single Submission](/assets/docs/screenshots/screenshot_single_submission.png)

### Bulk Submission

The bulk submission is a way for resources to submit their curation data in bulk\
Instead of sending multiple requests the resource can send a large JSON file that contains many curation reports at once\
In JSON format, a single submission report contains these fields:

```json
{
  "activity_term": "region_first_generation",
  "resource_id": "disprot",
  "timestamp": "2016-08-11T09:59:17.000Z",
  "curator_orcid": "0000-0002-0341-4888",
  "entity_uri": "https://identifiers.org/disprot:DP00034"
}

```

The JSON file to be uploaded when doing a bulk upload follows the structure specified underneath

```json
{
  ...
  "reports": [
    {
      "activity_term": "region_first_generation",
      "resource_id": "disprot",
      "timestamp": "2016-08-11T09:59:17.000Z",
      "curator_orcid": "0000-0002-0341-4888",
      "entity_uri": "https://identifiers.org/disprot:DP00034"
    }
    ...
  ]
}

```
Where the *reports* array contains a list of reports.

In an effort to reduce the file size and avoiding to repeat the same field, we have implemented **global&#x2011;fields**

![Bulk Submission](/assets/docs/screenshots/screenshot_bulk_submission.png)


#### Global fields

Global fields in Bulk submissions are fields that are placed outside of the reports array, they are meant to reduce redundancy across the file to avoid repeating the same value across the reports array

the most common example among the report fields is the *resource_id* field.


Instead of repeating the field across the entire array of reports you can specify it once outisde of the reports array.

```json

{
  "resource_id": "disprot",
  "reports": [
    {
      "activity_term": "region_first_generation",
      "timestamp": "2016-08-11T09:59:17.000Z",
      "curator_orcid": "0000-0002-0341-4888",
      "entity_uri": "https://identifiers.org/disprot:DP00034"
    },

    {
      "activity_term": "region_first_generation",
      "timestamp": "2016-08-11T09:59:17.000Z", 
      "curator_orcid": "0000-0002-0341-4888",
      "entity_uri": "https://identifiers.org/disprot:DP00034",
      "resource_id": "another_resource" // override the global field for this
      // specific entry 
    }
    
  ]
}

```