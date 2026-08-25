DERE: The Dere Club
=====================

A modular visual novel engine and visual novel project built with HTML, CSS,
JavaScript, and JSON story data.

This document explains the structure of the project, the responsibilities of
its major systems, and how the different parts of the engine work together.


1. PROJECT OVERVIEW
===================

DERE: The Dere Club is a browser-based visual novel.

The project separates presentation, game logic, and story content into
different layers:

    HTML
      |
      v
    CSS
      |
      v
    JavaScript Engine
      |
      v
    JSON Story Data

HTML defines the interface.
CSS defines the visual presentation.
JavaScript provides the game engine and behavior.
JSON stores story content and branching dialogue.

This separation allows story content and engine logic to be developed
independently.


2. PROJECT STRUCTURE
====================

A simplified structure of the project is:

    DERE-The-Dere-Club-
    |
    +-- index.html
    +-- style.css
    |
    +-- scripts/
    |   +-- engine.js
    |   +-- dom.js
    |   +-- enums.js
    |   +-- eventBus.js
    |   +-- audio.js
    |   +-- background.js
    |   +-- character.js
    |   +-- characterProfile.js
    |   +-- dialogue.js
    |   +-- choice.js
    |   +-- effects.js
    |   +-- events.js
    |   +-- settings.js
    |   +-- storage.js
    |   +-- scene.js
    |   +-- storyNodes.js
    |   +-- storyParser.js
    |   +-- graphBuilder.js
    |   +-- storyBuilder.js
    |   +-- storyLoader.js
    |   +-- ...
    |
    +-- data/
    |   +-- character_info.json
    |   +-- year/
    |       +-- year1.json
    |
    +-- images/
    +-- audios/
    +-- fonts/
    |
    +-- Documentation/


3. HTML
========

FILE:
    index.html

The HTML provides the structural foundation of the visual novel.

The interface is divided into several pages and components.

Major interfaces include:

    Main Menu
    Gameplay
    Settings
    Character Profile
    About
    Save / Load
    Loading
    Orientation Information
    Demo / End Screen

The individual pages are represented using the "page" class.

Example:

    <div class="main-menu page hidden">

The "hidden" class allows the JavaScript screen system to determine which
page is currently visible.

3.1 MAIN MENU
-------------

The main menu provides navigation to the major parts of the application.

Main controls include:

    Setting
    Start
    About
    Character Profile

3.2 GAMEPLAY
------------

The gameplay interface contains the major visual novel components:

    Background
    Relationship Tracker
    Gameplay Menu
    Character Stage
    Dialogue Box
    Choices

The "stage" element acts as the area where character sprites are displayed.

The dialogue interface contains the speaker name, dialogue text, speaker
profile, and next indicator.

3.3 SETTINGS
------------

The settings page contains navigation for different categories.

Current categories include:

    Volume
    Text

The "setting-content" element is used as a dynamic container for settings
controls.

3.4 CHARACTER PROFILE
---------------------

The character profile page displays information about characters, including:

    Character image
    Character name
    Character description
    Character list
    Sprite preview

Character information is supplied dynamically by JavaScript.


4. CSS
======

FILE:
    style.css

The stylesheet controls the visual presentation and layout of the
application.

The CSS is organized around reusable components and interface-specific
selectors.

4.1 CSS VARIABLES
-----------------

The project uses CSS custom properties for common design values.

Examples include:

    --background
    --primary
    --primary-hover
    --text
    --border
    --shadow

Font variables include:

    --font-title
    --font-body

Other shared variables include:

    --font-xs
    --font-sm
    --font-md
    --font-lg
    --font-xl
    --border-size
    --border-style
    --radius
    --transition

Using variables allows the visual design to be changed centrally.

4.2 REUSABLE COMPONENTS
-----------------------

Several classes provide reusable interface styles.

    .button
    .page
    .panel
    .window
    .character

For example, ".button" defines the common appearance and interaction
behavior of buttons throughout the interface.

4.3 GAMEPLAY LAYOUT
-------------------

Gameplay is divided into visual layers:

    .gameplay
        |
        +-- background
        |
        +-- gameplay-info
        |     |
        |     +-- relationship-tracker
        |
        +-- stage
        |     |
        |     +-- characters
        |
        +-- gameplay-menu
        |
        +-- dialogue-box
              |
              +-- speaker
              +-- speaker-profile
              +-- dialogue-content
              +-- next-indicator

The stage contains dynamically displayed characters.

The dialogue box is positioned near the bottom of the gameplay screen.


5. JAVASCRIPT ENGINE
====================

The JavaScript is divided into modules.

Each module is responsible for a specific part of the application instead
of placing the entire game engine inside one script.

Major modules include:

    engine.js
        Application initialization and engine coordination.

    dom.js
        References and utilities for DOM elements.

    enums.js
        Shared enumerations and constants.

    eventBus.js
        Event-based communication between modules.

    audio.js
        Background music and voice playback.

    background.js
        Background management.

    character.js
        Character sprites, expressions, positions, and stage management.

    characterProfile.js
        Character profile management.

    dialogue.js
        Dialogue rendering and dialogue interaction.

    choice.js
        Player choice creation and selection.

    effects.js
        Gameplay and relationship effects.

    events.js
        Game event handling.

    settings.js
        Settings and user configuration.

    storage.js
        Persistent application and game data.

    scene.js
        Representation of a story scene.

    storyNodes.js
        Story graph node definitions.

    storyParser.js
        Converts JSON dialogue data into story nodes.

    graphBuilder.js
        Connects story nodes into a dialogue graph.

    storyBuilder.js
        Builds stories and scenes from parsed data.

    storyLoader.js
        Loads story data.

    debug.js
        Debugging utilities.


6. ENGINE INITIALIZATION
========================

The engine is initialized through "engine.js".

The initialization process establishes the systems required by the visual
novel before the story begins.

The general initialization order is:

    DOM
      |
    Storage
      |
    Audio
      |
    Screen
      |
    Settings
      |
    Background
      |
    Character Profile
      |
    Dialogue
      |
    Character
      |
    Choice
      |
    Events
      |
    Debug
      |
    Story Loader
      |
    Story

The purpose of this ordering is to ensure that the systems required by the
story are initialized before the story is started.


7. EVENTBUS
===========

FILE:
    eventBus.js

The EventBus provides communication between independent modules.

Instead of requiring every module to directly call every other module,
systems can subscribe to and emit named events.

Examples of events used by the engine include:

    scene:enter
    dialogue:advance
    choice:selected
    story:finished
    node:enter
    screen:change
    data:save

Example flow:

    StoryRunner
        |
        | emit("scene:enter")
        v
    EventBus
        |
        +-----------> Audio
        |
        +-----------> Background
        |
        +-----------> Other subscribers

This reduces direct coupling between systems.


8. AUDIO SYSTEM
===============

FILE:
    audio.js

The Audio module manages game audio.

It is responsible for:

    Background music
    Voice blips
    Audio volume
    Speaker-specific voice configuration

8.1 BGM
--------

Background music is loaded from:

    audios/backgroundMusic/

When a scene contains a BGM value, the Audio system receives the
"scene:enter" event and loads the corresponding track.

8.2 VOICE BLIPS
---------------

Voice blips are loaded according to the current speaker.

The engine uses speaker-specific playback-rate configuration so that
different characters can have different voice behaviors.

8.3 VOLUME
----------

BGM volume is calculated from the master volume and background-music volume.

Voice volume is similarly affected by the master and voice-acting settings.


9. CHARACTER SYSTEM
===================

FILE:
    character.js

The Character module controls characters displayed on the gameplay stage.

Character state includes information such as:

    Character
    Emotion
    Position

Characters can be placed at different positions on the stage.

Character presentation is separate from the story data so that story nodes
can describe what should happen without directly manipulating the DOM.


10. DIALOGUE SYSTEM
===================

FILE:
    dialogue.js

The Dialogue module is responsible for displaying dialogue to the player.

It handles the presentation of:

    Speaker
    Dialogue text
    Speaker profile
    Text progression
    Typing behavior

The dialogue system communicates with the story runner through events.

When the player advances dialogue, the dialogue system emits:

    dialogue:advance

StoryRunner listens for this event and advances the current story node.


11. CHOICE SYSTEM
=================

FILE:
    choice.js

The Choice system displays interactive choices defined by story data.

A choice contains an option and a branch of dialogue.

Conceptually:

    Choice
      |
      +-- Option A
      |     |
      |     +-- Dialogue Branch
      |
      +-- Option B
            |
            +-- Dialogue Branch

Selecting an option emits:

    choice:selected

The StoryRunner then moves the story to the selected branch.


12. STORY DATA
=============

Story content is stored separately from the JavaScript engine.

Example location:

    data/year/year1.json

The story data describes scenes, dialogue, choices, effects, and transitions.

This allows the story to be edited without changing the core engine.

12.1 SPEAKER NODE
-----------------

A speaker node represents a line of dialogue.

Example:

    {
        "type": "speaker",
        "speaker": "yuri",
        "text": "Anyway."
    }

A speaker node can also contain effects.

Example:

    "effects": [
        {
            "type": "relationship",
            "relations": [
                {
                    "character": "yuri",
                    "amount": 1
                }
            ]
        }
    ]

12.2 CHOICE NODE
----------------

A choice node contains multiple options.

Each option can contain its own dialogue sequence.

Conceptually:

    Choice
      |
      +-- Option A
      |     |
      |     +-- Dialogue
      |
      +-- Option B
            |
            +-- Dialogue

12.3 GOTO
---------

A goto node transfers execution to another scene.

This allows scenes to be connected without placing the entire story inside
one continuous dialogue sequence.


13. STORY PARSING AND GRAPH BUILDING
===================================

The story system converts JSON data into an executable dialogue graph.

The general process is:

    JSON
      |
      v
    StoryLoader
      |
      v
    StoryBuilder
      |
      v
    StoryParser
      |
      v
    Story Nodes
      |
      v
    GraphBuilder
      |
      v
    Scene Graph
      |
      v
    StoryRunner

13.1 STORYPARSER
----------------

StoryParser reads individual JSON objects and converts them into the
appropriate story node.

Depending on the data, this can produce nodes such as:

    SpeakerNode
    ChoiceNode
    GotoNode

13.2 GRAPHBUILDER
-----------------

GraphBuilder connects nodes together.

Linear dialogue is connected sequentially:

    Node A -> Node B -> Node C

Choices create branches:

                 -> Node B -> Node C
    Choice Node
                 -> Node D -> Node E

The graph allows the story runner to navigate branching dialogue without
hard-coding every possible path.

13.3 SCENE
----------

A Scene represents a section of the story.

A scene contains information such as:

    Scene ID
    Background
    BGM
    First Node
    Last Node

Scenes can also search for a specific node by index.


14. STORYRUNNER
==============

FILE:
    story runner implementation

StoryRunner controls the currently running story.

It maintains:

    currentStory
    currentScene
    currentNode

Its main responsibilities are:

    Starting the story
    Advancing dialogue
    Rendering nodes
    Entering scenes
    Processing choices
    Detecting the end of the story

Basic flow:

    Start
      |
      v
    Current Scene
      |
      v
    Current Node
      |
      v
    Render Node
      |
      +---- Speaker ----> Display Dialogue
      |
      +---- Choice -----> Display Choices
      |
      +---- Goto -------> Enter Scene
      |
      v
    Next Node


15. EFFECT SYSTEM
=================

Dialogue nodes may contain effects.

One current example is the relationship effect.

Example:

    "effects": [
        {
            "type": "relationship",
            "relations": [
                {
                    "character": "penny",
                    "amount": 2
                }
            ]
        }
    ]

When the node is processed, its effects are applied to the appropriate
systems.

This allows story content to modify gameplay state without directly
embedding gameplay code into the JSON.


16. RELATIONSHIP SYSTEM
======================

Relationships represent the player's relationship values with characters.

A relationship effect can increase or decrease a character's value.

Example:

    amount: 2

increases the relationship value.

Example:

    amount: -1

decreases the relationship value.

The relationship state is also included in saved game data.


17. SAVE / LOAD SYSTEM
======================

The save system stores the state required to continue a game.

A saved game contains information including:

    Story / Year
    Scene
    Current Node
    Character Stage
    Character Emotion
    Character Position
    Relationship Data

Conceptually:

    Save
      |
      +-- Story
      +-- Scene
      +-- Current Node
      +-- Stage
      |    +-- Character
      |    +-- Emotion
      |    +-- Position
      |
      +-- Relationships

When loading a game, these values are restored and the gameplay screen is
opened again.

The character stage is restored before the story resumes.


18. STORAGE
===========

FILE:
    storage.js

The Storage system is responsible for persistent application data.

It is used by systems such as:

    Save / Load
    Settings
    Current game slot

The storage layer allows game state and configuration to survive page
reloads.


19. HOW THE SYSTEMS WORK TOGETHER
=================================

A simplified complete flow is:

    Browser
       |
       v
    index.html
       |
       v
    style.css
       |
       v
    engine.js
       |
       +-------------------+
       |                   |
       v                   v
    Engine Systems      StoryLoader
       |                   |
       |                   v
       |               StoryBuilder
       |                   |
       |                   v
       |               StoryParser
       |                   |
       |                   v
       |               GraphBuilder
       |                   |
       |                   v
       |                 Scene
       |                   |
       +-------> StoryRunner
                       |
                       v
                    Node
                       |
              +--------+--------+
              |        |        |
              v        v        v
           Dialogue  Choice    Goto
              |        |        |
              v        v        v
           Character Effects  Scene
              |
              v
            Audio

Communication between systems is handled where appropriate through the
EventBus.


20. DEVELOPMENT PRINCIPLES
==========================

The project follows several architectural principles.

20.1 SEPARATION OF RESPONSIBILITIES
-----------------------------------

Each module should have a clear responsibility.

For example:

    Audio       -> audio
    Character   -> character presentation
    Dialogue    -> dialogue presentation
    StoryRunner -> story execution
    Storage     -> persistence

A module should avoid taking responsibility for unrelated systems.

20.2 DATA-DRIVEN STORY
----------------------

Story content should be represented by JSON rather than hard-coded inside
the engine whenever possible.

This makes it possible to create and modify scenes without changing the
core story engine.

20.3 EVENT-BASED COMMUNICATION
------------------------------

Modules should communicate through events when direct coupling is not
necessary.

This keeps the engine modular and allows systems to respond to changes
without requiring the sender to know every system that uses the event.

20.4 MODULAR ENGINE
-------------------

The engine should be divided into independent systems.

When adding a new feature, prefer creating or extending the module
responsible for that feature instead of placing unrelated logic inside
another module.


21. ADDING STORY CONTENT
=======================

To add dialogue:

    1. Open the appropriate JSON story file.
    2. Add a speaker node.
    3. Specify the speaker.
    4. Specify the dialogue text.
    5. Add effects if required.

To add a choice:

    1. Add a choice node.
    2. Define its options.
    3. Add dialogue to each option.
    4. Allow the StoryBuilder to construct the branches.

To move to another scene:

    1. Add a goto node.
    2. Specify the destination scene ID.


22. ADDING A CHARACTER
=====================

Character-related information is separated from the story engine.

Character data can include information required by the character profile
system, while sprite and emotion assets are stored in the appropriate
image directories.

The Character module is responsible for displaying the character during
gameplay.


23. ADDING AUDIO
================

Background music is stored under:

    audios/backgroundMusic/

Voice files are stored under:

    audios/voice/

The Audio module determines which audio file should be played based on
the current scene or speaker.


24. DOCUMENTATION
=================

Additional project documentation is located in:

    Documentation/

This directory contains supporting documentation and diagrams for the
project.

The documentation should be updated when major architectural changes are
made.


25. SUMMARY
===========

The project is structured as a modular visual novel engine.

The major architectural layers are:

    Presentation
        HTML + CSS

    Application
        JavaScript modules

    Story
        JSON data

    Runtime
        Story graph + StoryRunner

    Persistence
        Storage + Save / Load

The central idea is to keep the visual interface, engine logic, story
content, and persistent state separated.

This allows the project to grow without requiring the entire engine to be
rewritten whenever new story content or gameplay systems are introduced.
