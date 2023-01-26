# Documentation

### Welcome  👋

The **APICURON  main documentation**, this section will contain all the necessary steps to integrate your **Curation Resource** with **APICURON**.

### Integration process

In the process of integrating APICURON into your system you will go through the following Steps.

1. Create an account on APICURON by [logging-in](/api/auth/orcid) 
2. while logged-in, define your **Resource** by filling the following *[form](/databases/create)*
3. Your submission will then go through an *approval process*
4. After your Approval we will link your APICURON Account with the Created **Resource**
5. Then you will Have access to all the *features* APICURON has to offer.


### Defining your Resource

This is the first Part of the integration process. and it consists of filling this *[form](/databases/create)*

A resource is defined by the following fields:
 - *resource id*: the string identifier that uniquely identifies a resource
 - *resource name*: the Name of the resource that is used when displaying the resource
 - *resource long name*: A more descriptive name of the resource
 - *resource URI*: the Unified Resource identifier of tha resource
 - *resource URL*: the link that leads to the resource
 - *resource Description*: A description of the Resource
 - *resource Logo*: An image of the Resource Logo (svg, png and jpeg formats are accepted)


There are some **Caveats** to consider:
 - The *Resource_id* that you choose is not public but should be semantically relevant as it will be part of the endpoints you're going to use
 - You can upload either a png, jpeg or svg Logo. We recommend SVG as it is usually smaller in size and can offer a transparent background that makes the UI cleaner
 - The Resource Long Name is usually the full name of the resource that describes the resource slightly better than the Name but less extensively than the Description.
![Resource Definition](/assets/docs/images/screenshot_databses_create.png)

## Defining your Terms

Terms Are what you consider the atomic aspect of contribution for your resource, A term is defined by the following fields:
 - *Activity term*: The string identifier that uniquely identifiers a term in a resource
 - *Activity name*: The clean name of the Term that is displayed
 - *Activity Category*: The category in which the term falls among these three categories:
   - Generation
   - Invalidation
   - Revision
 - *Score*: the numerical value describing how the resource estimates the Activity
 - *Description*: A short text describing the in and outs of the Term

<img src="/assets/docs/images/screenshot_term_fields.png" class="tw-mx-auto">
<!-- ![Term Fields]() -->


## Submitting Curation Data (Reports)

There are two major ways to submit curation data (aka, reports) in APICURON, in real-time or in bulk.

### Real Time Submission

Real time submission can be tested on the UI Dashboard, using the following UI.

A single report contains the following fields:
 - *Activity term*: the activity term related to the reported curation effort
 - *Curator ORCID*: the orcid of the curator that made the effort
 - *Entity URI*: a URI that links to the page showcasing Entity that the Curator contributed to
 - *Timestamp*: the time and date of the effort submission to the resource

![Single Submission](/assets/docs/images/screenshot_single_submission.png)


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
Where the *reports* array contains a list of reports.\
An additional feature is to specify **global fields**

#### Global fields


![Bulk Submission](/assets/docs/images/screenshot_bulk_submission.png)
