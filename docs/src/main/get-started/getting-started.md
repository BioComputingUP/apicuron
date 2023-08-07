# Getting Started

as previously mentionned in the [Introduction](/main/get-started/) the current [APICURON](https://apicuron.org) implementation is geared towards research and relies on researcher tools and therefore our main authentication method, will be [ORCID](https://orcid.org).

To test your Integration we have a [separate APICURON instance](https://dev.apicuron.org) for testing that you can use along with the [sandbox version of ORCID](https://sandbox.orcid.org) to test integrations before using the main [APICURON](https://apicuron.org) instance that relies on the [public orcid](https://orcid.org)


First step is to create a Resource and that requires us to authentify ourselves

## Authentication

To authenticate using [APICURON](https://dev.apicuron.org) is quite simple, all that is required is to click on the top right corner login button on the [APICURON](https://dev.apicuron.org) home page on the navigation bar

![login-button-screenshot](/screenshots/screenshot-login-buton.png)

You wil be redirected in a popup window to log-in to the [sandbox ORCID](https://sandbox.orcid.org) where you will be requested to authenticate as (shown below). In order to verify your profile, [ORCID](https://orcid.org) requires you to setup a mailinator inbox to verify your email address. The following procedure is further explained at the bottom of this [page](https://info.orcid.org/ufaqs/how-do-i-register-a-test-client-on-the-sandbox-member-api/)


![login-button-screenshot](/screenshots/orcid-login-popup.png)


## Create A Resource

After creating an account you will have the possibility to create a Resource [here](https://dev.apicuron.org/databases/create)