# APICURON Technical Documentation

<p align="center">
  <img src="https://raw.githubusercontent.com/BioComputingUP/apicuron-ui/master/src/assets/APICURON.svg?token=GHSAT0AAAAAACISPHUXNF5TWXEEYAVTLGTSZKDRAKA" />
</p>


APICURON is currently composed of two elements
- The backend uses nestjs has a fairly modular implementation that has some nice features
- The frontend is an Angular app. The implementation is quite chaotically organized


## Table of Contents

- [The frontend](#the-frontend)
- [The backend](#the-backend)


## The frontend

### Structure

The project is composed of mostly feature modules, standalone components, some logic regarding the models loaded in API requests or query construction.

### Model Classes definitions

There's a top level directory (in the src directory) named *models* that contains classes of entities that are manipulated from different API requests.

These classes implement Deserializable when they need to be loaded in from json response Or serializable when They need to be sent back to the server

### Modules and services

There are three main categories of modules 🗃 that are implemented in the frontend.

- Lazy-loaded routes modules. Their whole purpose is to define routes that should be lazy-loaded. They allow for the app not to have to be entirely loaded for a single page to work
- Modules that encapsulate logic related to a model or a concept (ex: curatorModule...etc)
- Modules that do both, and implement features "exclusive" to their respective routes.

### standalone components

Standalone Components have been fairly used in this project. They allow for better reusability throughout the project. They are defined in the *components* directory and they normally contain 0 to no APP logic. Although many now do implement some APP related features.

The side panels in the user profile are defined as standalone components because They might prove usefull in another place. (reusability is still not well-tested)

## The backend

