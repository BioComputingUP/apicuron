<h1 style="text-align:center;">APICURON Documentation</h1>

## Introduction

APICURON is a Webserver that can allow you to recognize contributions to your resource which can be a Database, Registry or a Respository any identifiable using URI can be a Resource.

Current APICURON implementation is geared towards scientific resources and offers representations and tools that can help you integrate easily like ORCID (opens new window)to identify curators and reward them.

<!-- a good starting point to integrate your Resource is visiting the [Getting Started Page](/main/) -->

A brief explanation of [How APICURON works](/docs#how-apicuron-works) can be found below

## Concept

Biocuration plays an essential role in making research data available to the scientific community and shareable, therefore increasing their intrinsic value. However, the contribution and effort of **biocurators** are extremely difficult to quantify and to acknowledge. This is relevant not only in the case of hired-curators but especially in the case of databases relying on community curation. **APICURON** provides partner biological databases with an automatic tracking system of the biocuration activities, allowing them to acknowledge and recognize the work of their **biocurators**. **APICURON** is based on the key concept of <u>**gamification**</u>, therefore relying on a system of _badges_ and _scores_ that are used to recognize the work of **biocurators** and at the same time encourage and motivate them.

## How APICURON works

**APICURON** serves as an external tracker of biocuration activities of each one of its partner resource, playing a crucial role not only in well-known and established databases but also in smaller, newer manually curated resources and, behind a firewall, also for non-academic institutions and research companies where biocuration is required with the aim of properly crediting the work of **biocurators**, raising awareness to the crucial role played by biocuration in scientific research and promoting good practices.

Registered resources (Member databases) submit biocuration events to the **APICURON** web server. **APICURON** stores biocuration activities and calculates achievements (_medals_, _badges_) and leaderboards on the fly. Results are served through a public API. **APICURON** can be cross-referenced by **ORCID**. Third-party databases can use **APICURON** to monitor **biocurators** work and human users can visit the **APICURON** website to see **biocurators** achievements and ranking.

![How APICURON works](/assets/apicuron%20workflow_transparent.png)

## Biocuration Activities

The description of a curation event in **APICURON** is provided by four key components: **entity**, **activity**, **agent** and **timestamp**. These key elements fulfill the recommendations of [Thessen et al](https://doi.org/10.5334/dsj-2019-054). In Addition APICURON implements a scoring system that is adjustable by curation platforms, and therefore in addition to the previously mentionned four key components APICURON adds a **score**

- **Entity**: it corresponds to the curated data object, which is identified by using the identifiers.org resolving system.
- **Activity**: this is the actual curation activity, such as _“entry_creation”_ or _“evidence_update”_. Although different databases can define different activities, those need to be mapped to term is a <u>W3C</u> recommendation that provides a way to define the life cycle of an object. terms are: **generation**, **revision** and **invalidation**.
- **Agent**: the biocurator that has performed the biocuration activity. In **APICURON**, biocurators are identified by their **ORCID**, allowing them to make their contributions citable.
- **Timestamp**: it provides the information, i.e. the date and time of the day, of when a biocuration activity was performed. Each curation report is accessible by users via API.
- **Score**: it associates a numercial value to an activity reflecting the value of the activity in relation to other activities defined by the same curation platform

A list of the entity and activity terms for each one of our partner databases is available.

## Become a member

We welcome all manually curated resources or biocuration organizations, especially those relying on community curation, to become **APICURON partners**. **Becoming an APICURON partner is free of charge**. Each registered resource can directly submit data through the [APICURON API](http://dev.apicuron.org/api/) after receiving credentials. We provide support for the definition of the biocuration activities, associated scores, badges and medals. We encourage the submission through the API but we are still open to include small or brand new resources that do not have enough resources to implement a web server able to push data. In that case APICURON developers will take care of collecting (pulling) curation activities manually directly from the connecting resource.

To become an APICURON member database you can follow integration steps [here](integration) if you face any issues you can join the [APICURON Slack](https://join.slack.com/t/apicuron/shared_invite/zt-1jir4nfu9-gDItsCVg7f0JoY8_mOht7w) and contact us by email at [info@apicuron.org](info@apicuron.org)

| <span style="font-size: 2rem">🔬</span>                                                                                                                                            | <span style="font-size: 2rem">👨‍💻</span>                                                                                                                                                        |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The [General Guide](/docs/user-guide) is aimed at explaining how APICURON can benefit curators and contributos of organizations that use APICURON and elaborates on how the tool works | The [Developer Documentation](/docs/developer-guide/index) is aimed at explaining how APICURON works for Developers and interested organizations who might be interested in integrating APICURON with their resource |
