DERE: The Dere Club
=====================

A modular visual novel engine and visual novel project built with HTML, CSS,
JavaScript (ES Modules), and JSON story data.

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

The actual structure of the project is:

    DERE-The-Dere-Club-
    |
    +-- index.html
    +-- style.css
    |
    +-- scripts/
    |   +-- engine.js               Application entry point / boot sequence
    |   +-- dom.js                  Cached DOM element references
    |   +-- enums.js                Shared enumerations and constants
    |   +-- eventBus.js             Pub/sub event system
    |   +-- events.js               Wires up UI click/keyboard listeners
    |   +-- screen.js               Page/popup navigation (open/back/hide)
    |   +-- utils.js                Small DOM/query/sleep helpers
    |   +-- jsonLoader.js           Generic fetch-and-parse-JSON helper
    |   |
    |   +-- audio.js                BGM + voice blip playback
    |   +-- background.js           Scene background image handling
    |   +-- settings.js             Volume/text-speed settings UI + state
    |   +-- storage.js              LocalStorage persistence (settings + saves)
    |   +-- saveLoad.js             Save/Load slot UI and logic
    |   |
    |   +-- dialogue.js             Typewriter text rendering + speaker portraits
    |   +-- choice.js               Choice popup rendering
    |   +-- character.js            On-stage character sprites (spawn/move/remove)
    |   +-- characterProfile.js     Character Profile screen logic
    |   +-- relationship.js         Per-character affection value tracking
    |   +-- gameplayInfoTracker.js  Renders the relationship HUD
    |   +-- effects.js              Effect system (currently: relationship changes)
    |   |
    |   +-- storyNodes.js           Node class definitions (Speaker/Choice/Goto)
    |   +-- storyParser.js          Converts JSON scene data into node objects
    |   +-- graphBuilder.js         Also exports StoryBuilder (see note below)
    |   +-- scene.js                Scene class + node lookup by index
    |   +-- story.js                Story class (id, start scene, scene map)
    |   +-- storyGraph.js           Registry of loaded Story objects, by id
    |   +-- storyLoader.js          Fetches + builds a year's story JSON
    |   +-- storyRunner.js          Walks the node graph, drives gameplay
    |   |
    |   +-- debug.js                Exports story graphs as Mermaid diagrams
    |   +-- main-backup.js          Legacy non-modular build (NOT used by index.html)
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
        +-- Dere_Character_Sheets.docx
        +-- Dere_Club_Stripped_Documentation.docx

NOTE ON graphBuilder.js:
    Despite the name, this single file exports TWO objects: "GraphBuilder"
    (connects parsed nodes into a linked graph) and "StoryBuilder" (drives
    the overall build process per scene). There is no separate
    "storyBuilder.js" file - both live together in graphBuilder.js.


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

The "hidden" and "visible" classes allow the JavaScript screen system
(screen.js) to determine which page is currently shown.

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

The dialogue box contains a speaker name panel, a dialogue body (holding the
speaker profile image and the dialogue text paragraph), and a next indicator.

3.3 SETTINGS
------------

The settings page contains navigation for different categories.

Current categories include:

    Volume
    Text

The "setting-content" element is used as a dynamic container for settings
controls, filled in by settings.js.

3.4 CHARACTER PROFILE
---------------------

The character profile page displays information about characters, including:

    Character image
    Character name
    Character description
    Character list
    Sprite preview

Character information is supplied dynamically by characterProfile.js, sourced
from data/character_info.json.


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
              +-- dialogue-body
                    |
                    +-- speaker-profile
                    +-- p (dialogue text)
              +-- next-indicator

The stage contains dynamically displayed characters.

The dialogue box is positioned near the bottom of the gameplay screen.

NOTE: an earlier draft of this document referenced a ".dialogue-content"
class. That class does not exist in index.html - the actual dialogue text
lives in ".dialogue-body p".


5. JAVASCRIPT ENGINE
====================

The JavaScript is divided into ES modules, each loaded via `import`/`export`
statements. Each module is responsible for a specific part of the
application instead of placing the entire game engine inside one script.

Modules include:

    engine.js
        Application initialization and boot sequence.

    dom.js
        Cached references to DOM elements, populated on initialize().

    enums.js
        Shared enumerations and constants (characters, positions, emotions).

    eventBus.js
        Event-based (pub/sub) communication between modules.

    events.js
        Wires up UI click/keyboard/touch listeners to EventBus events.

    screen.js
        Page/popup navigation: open, back, show/hide, orientation handling.

    utils.js
        get/getAll/on DOM helpers and a Sleep(ms) promise helper.

    jsonLoader.js
        Generic fetch-and-parse-JSON helper used by story and character data.

    audio.js
        Background music and voice blip playback, volume calculation.

    background.js
        Scene background image swapping.

    settings.js
        Settings UI (volume/text speed) and in-memory settings state.

    storage.js
        Persistent application data via localStorage (settings + save slots).

    saveLoad.js
        Save/Load slot UI, save-state serialization, and slot preview.

    dialogue.js
        Dialogue rendering: typewriter effect, speaker name/profile display.

    choice.js
        Choice popup creation and selection handling.

    character.js
        Character sprites: spawning, moving, removing, and stage restoration.

    characterProfile.js
        Character Profile screen population and character list rendering.

    relationship.js
        Per-character affection value tracking (clamped -100 to 100).

    gameplayInfoTracker.js
        Renders the relationship HUD whenever relationship data changes.

    effects.js
        Effect system: currently supports relationship-changing effects.

    storyNodes.js
        Story graph node class definitions (SpeakerNode, ChoiceNode, GotoNode).

    storyParser.js
        Converts individual JSON dialogue entries into story node objects.

    graphBuilder.js
        Exports GraphBuilder (connects nodes into a graph) and StoryBuilder
        (drives the scene-by-scene build process). See note in section 2.

    scene.js
        Scene class: id, background, bgm, first/last node, node lookup by index.

    story.js
        Story class: id, start scene id, map of scenes.

    storyGraph.js
        Registry mapping a loaded story's id to its Story object.

    storyLoader.js
        Fetches a year's JSON file and builds it into a registered Story.

    storyRunner.js
        Walks the node graph at runtime: advancing, rendering, branching.

    debug.js
        Converts a scene map into a Mermaid flowchart string for visualization.

    main-backup.js
        A legacy, pre-modularization version of the entire engine kept for
        reference. Not referenced by index.html and safe to ignore/delete.


6. ENGINE INITIALIZATION
========================

The engine is initialized through "engine.js", triggered on the browser's
DOMContentLoaded event.

The actual initialization order is:

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
    CharacterProfile   (async)
      |
    GameplayInfoTracker
      |
    Relationship
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
    SaveLoad
      |
    StoryLoader        (async, loads "year1")

The purpose of this ordering is to ensure that the systems required by the
story are initialized before the story is started. For example, Storage
must exist before Settings reads persisted values from it, and DOM must
exist before anything queries an element from it.


7. EVENTBUS
===========

FILE:
    eventBus.js

The EventBus provides communication between independent modules.

Instead of requiring every module to directly call every other module,
systems can subscribe to ("on") and emit named events. EventBus also
supports emitAsync, which awaits all registered handlers in parallel.

Events actually used by the engine include:

    scene:enter           - a new scene has started (drives background/BGM)
    node:enter            - the story runner entered a new node
    dialogue:advance      - player requested to advance dialogue
    choice:selected       - player selected a dialogue choice
    story:finished        - the story graph has run out of nodes
    screen:change         - request to navigate to a different page
    data:save             - request to persist current settings/saves
    saveLoad:changeMode   - toggled the save/load screen mode
    gameSlot:save         - a save slot was used to save
    gameSlot:load         - a save slot was used to load
    relationship:change   - a character's affection changed

Example flow:

    StoryRunner
        |
        | emit("scene:enter")
        v
    EventBus
        |
        +-----------> Audio        (loads BGM if the scene specifies one)
        |
        +-----------> Background   (swaps the background image)
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

When a scene contains a "bgm" value, the Audio system receives the
"scene:enter" event and loads/plays the corresponding track.

8.2 VOICE BLIPS
---------------

Voice blips are loaded according to the current speaker, from:

    audios/voice/

The engine uses speaker-specific playback-rate configuration (VoiceConfig)
so that different characters can have different voice behaviors.

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

Characters can be placed at different positions on the stage (far-left,
left, center, right, far-right).

Character presentation is separate from the story data so that story nodes
can describe what should happen (via "stage" operations: set/remove/clear)
without directly manipulating the DOM.

The module also exposes getStagePreview() (a snapshot of on-stage character
data for saving) and restoreStage(savedStage) (rebuilds the stage from a
snapshot, or from current in-memory state if none is given) - both used by
the save/load system.


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

When the player advances dialogue, an EventBus "dialogue:advance" event is
emitted. StoryRunner listens for this event and advances the current story
node (or, if text is still typing, finishes the current line instantly).


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

A speaker node can also contain effects and stage directions.

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
    StoryBuilder     (exported from graphBuilder.js)
      |
      v
    StoryParser
      |
      v
    Story Nodes
      |
      v
    GraphBuilder     (also exported from graphBuilder.js)
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

Scenes can also search for a specific node by index (used when restoring a
save, or previewing a save slot).


14. STORYRUNNER
==============

FILE:
    scripts/storyRunner.js

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

Values are clamped between -100 and 100. The relationship state is also
included in saved game data.


17. SAVE / LOAD SYSTEM
======================

FILE:
    scripts/saveLoad.js

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
opened again. The character stage is restored (via Character.restoreStage)
before the story resumes.

Saving reads the current stage via Character.getStagePreview(), which keeps
saveLoad.js from reaching into character.js's internal state directly.


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
reloads by writing to and reading from localStorage.


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

Audio and Background are driven by "scene:enter" rather than directly by
Node rendering.

Communication between systems is handled where appropriate through the
EventBus.


20. DEVELOPMENT PRINCIPLES
==========================

The project follows several architectural principles. Such as Single Responsibility Principle, DRY, Separation of Concern and many more.

20.1 SEPARATION OF RESPONSIBILITIES
-----------------------------------

Each module should have a clear responsibility.

For example:

    Audio       -> audio
    Character   -> character presentation
    Dialogue    -> dialogue presentation
    StoryRunner -> story execution
    Storage     -> persistence

A module should avoid taking responsibility for unrelated systems, and
should avoid reaching into another module's private state directly (prefer
a public method, e.g. Character.getStagePreview() rather than reading
character.js's internal activeStage variable from outside the module).

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
system (data/character_info.json), while sprite and emotion assets are
stored in the appropriate image directories
(images/characters/<char>/<char>_<emotion>.png).

The Character module is responsible for displaying the character during
gameplay.


23. ADDING AUDIO
================

Background music is stored under:

    audios/backgroundMusic/

Voice files are stored under:

    audios/voice/

The Audio module determines which audio file should be played based on
the current scene ("bgm" field) or speaker.


24. RUNNING THE PROJECT
========================

Because scripts/engine.js is loaded as an ES module and the game fetches
JSON data files at runtime, the project must be served over HTTP - opening
index.html directly via file:// will fail due to CORS/module restrictions.

Example using Python:

    cd DERE-The-Dere-Club-
    python3 -m http.server 8000

Then open:

    http://localhost:8000


25. DOCUMENTATION
=================

Additional project documentation is located in:

    Documentation/

This directory contains supporting documentation and diagrams for the
project (character sheets and stripped design documentation, as .docx
files).

The documentation should be updated when major architectural changes are
made.


26. SUMMARY
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


27. CREDITS
===========

    Kyle Justine Cristobal     - Designer
    Chemuel Jhon Dela Pena     - Programmer
    John Bernard Nollas        - Assistant / Researcher
    Daniel Ethan Perolino      - Programmer / Moral Support
