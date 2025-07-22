# User Guide

## The Web interface

APICURON's web interface is the main way to interact with APICURON.

APICURON is currently only integrated with ORCID, it is the only authentication system that is used and aim behind it serves the interest of curators.

When logging-in on APICURON using your ORCID Account you aggree to having your data publicly displayed on the APICURON Website and UI, showcasing your contributions to various resources. Through this mechanism APICURON will re-distribute user data obtained from ORCID that the user authorizes publicly on ORCID's privacy control mechanism

And the curator will have their profile computed as showcased below

![APICURON profile example](/assets/docs/screenshots/curator-profile.png)

### Main Page
[The main page of APICURON](https://apicuron.org/) presents a search bar that leads to a list of curators profiles followed by aggregated statistics about the partner resources and biocurators registered on APICURON. In addition a list of integrated resources is shown below as cards containing a small descriptions of each database

### Databases Page

[The Databases page of APICURON](https://apicuron.org/databases) shows a list of integrated databases, each one represented by a card containing a short description of the resource, their logo and a link that leads to the database. There's a little helper box on the top-right corner of the database that has clickable pills, each one mapping to a database. clicking a pill would scroll automatically to the concerned database.

### Single Database Page

A single database page shows details regarding a single database, including a description, a leaderboard of the biocurators that contributed to the resource on the right hand side. Next to the leaderboard the page showcases the reward model defined by the resource. Each resource has their own recognition system that APICURON handles. Initially there's a list of Activities that are tracked by the database. Each activity is represented by a card with a score attached, an annotation of the type of the contribution and a description. 

Following the activities a list of Badges and medals (optional) can be found. These are achievements that can be earned by the biocurators provided that they meet certain contribution conditions.


### Curators Page
[The curators page](https://apicuron.org/curators) shows a list of biocurators who registered their profile on APICURON, each profile shows scores representing the amount of contributions done by each curator on each database that is registered on APICURON. The scores are classified according to the Provenance (PROV) Ontology terms as defined by the World Wide Web Consortium (W3C) Provenance Working Group (24). PROV terms, [generation](https://www.w3.org/TR/prov-o/#Generation), [revision](https://www.w3.org/TR/prov-o/#Revision) and [invalidation](https://www.w3.org/TR/prov-o/#Invalidation).

The list of curators is searchable by curator name and orcid id, and can be filtered by the database (partner resource).

### Single Curator Page

Each biocurator that is registered on APICURON has a profile page that showcases the contributions and earned achievements on each different database. In addition APICURON pulls profile data from the ORCID profile of the curator (biography, keywords...etc) and re-displays them on the profile page in order to give more context about each curator. The page is structured like the example below

![profile page example](/assets/docs/screenshots/curator-profile.png)

## Integration with ORCID

ORCID offers a mechanism for Curators to display their contribution, by allowing APICURON to update your profile.
APICURON will periodically indicate a summary to your contributions to every partner resource on APICURON.

Your contributions would appear on ORCID as the example below

![APICURON ORCID submission example](/assets/docs/screenshots/orcid-submission-example.png)
<!-- ## your rights to your data -->