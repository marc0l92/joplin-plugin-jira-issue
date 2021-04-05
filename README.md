# Joplin Plugin - Jira Issue

This plugin allows you to track the progress of [Atlassian Jira](https://www.atlassian.com/software/jira) Issues from your [Joplin](https://joplinapp.org/) notes.

## Manual Installation

- Download the last release from this repository.
- Open `Joplin > Options > Plugins > Install from File`
- Select the jpl file you downloaded.

## Usage
### Configuration
In the settings is it possible to define how to connect to the Jira server and what are the property to show.
![settings](./doc/settings.png)

### Issues tracking
To start tracking a new issue use the HTML Tag:
```md
<JiraIssue key="AAA-123">
```
and then use the JiraIssue:Refresh button to download the last issue information.

### JQL Search/Filter
Is it possible to define a search/filter using a JQL query. Use the HTML Tag:
```md
<JiraSearch jql="resolution = Unresolved AND assignee = currentUser() AND status = 'In Progress' order by priority DESC" max="10"></JiraSearch>
```
to define the query and the max number of results to display.

### Usage Example
![Usage example](./doc/usage_example.gif)

## Rendering modes
Is it possible to use differnt rendering mode:

### Text
![Rendering Mode Text](./doc/rendering_mode_text.png)

### Badge
![Rendering Mode Badge](./doc/rendering_mode_badge.png)

### Table
![Rendering Mode Table](./doc/rendering_mode_table.png)


# Development
If you want to contribute to this plugin you can find here some userful references:

- [Joplin - Getting started with plugin development](https://joplinapp.org/api/get_started/plugins/)
- [Joplin - Plugin API reference](https://joplinapp.org/api/references/plugin_api/classes/joplin.html)
- [Joplin - Data API reference](https://joplinapp.org/api/references/rest_api/)
- [Joplin - Plugin examples](https://github.com/laurent22/joplin/tree/dev/packages/app-cli/tests/support/plugins)


# FAQ
- Q: How can I use double quotes (`"`) in the JiraSearch query? e.g. status = "In Progress"
    - A: You can use single quotes (`'`) or the html tag `&quot;`


# Future imrpvements
- [ ] Add support for wysiwyg editor
- [ ] Improve refresh icon